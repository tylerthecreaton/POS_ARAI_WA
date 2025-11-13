<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\ProductRecipe;
use App\Models\Ingredient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category');

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('name')->get();

        // Set image_url for each product
        $productsData = $products->map(function ($product) {
            $data = $product->toArray();
            $data['image_url'] = $product->getDisplayImageUrl();
            return $data;
        });

        return response()->json([
            'success' => true,
            'data' => $productsData
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
            'is_available' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'barcode' => 'nullable|string|max:100|unique:products,barcode',
            'recipe' => 'nullable|array',
            'recipe.*.ingredient_id' => 'required|exists:ingredients,id',
            'recipe.*.quantity' => 'required|numeric|min:0.01',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $validated['image'] = $imagePath;
        }

        $product = Product::create($validated);

        // Create product recipe if provided
        if (isset($validated['recipe']) && is_array($validated['recipe'])) {
            foreach ($validated['recipe'] as $recipeItem) {
                ProductRecipe::create([
                    'product_id' => $product->id,
                    'ingredient_id' => $recipeItem['ingredient_id'],
                    'quantity' => $recipeItem['quantity'],
                ]);
            }
        }

        // Load relationships for response
        $product->load(['category']);

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::with(['category'])->findOrFail($id);

        // Get the product data as array and set image_url
        $productData = $product->toArray();
        $productData['image_url'] = $product->getDisplayImageUrl();

        return response()->json([
            'success' => true,
            'data' => $productData
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'cost' => 'sometimes|nullable|numeric|min:0',
            'image_url' => 'sometimes|nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'sometimes|boolean',
            'is_available' => 'sometimes|boolean',
            'sort_order' => 'sometimes|nullable|integer|min:0',
            'sku' => ['sometimes', 'nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product->id)],
            'barcode' => ['sometimes', 'nullable', 'string', 'max:100', Rule::unique('products', 'barcode')->ignore($product->id)],
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $image = $request->file('image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $validated['image'] = $imagePath;
        }

        $product->update($validated);

        // Load relationships for response
        $product->load(['category']);

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Get active products.
     */
    public function active(Request $request): JsonResponse
    {
        $query = Product::where('is_active', true)
            ->where('is_available', true)
            ->with('category');

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->orderBy('name')->get();

        // Set image_url for each product
        $productsData = $products->map(function ($product) {
            $data = $product->toArray();
            $data['image_url'] = $product->getDisplayImageUrl();
            return $data;
        });

        return response()->json([
            'success' => true,
            'data' => $productsData
        ]);
    }

    /**
     * Get product recipe.
     */
    public function recipe(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $recipe = $product->recipe()->with('ingredient')->get();

        return response()->json([
            'success' => true,
            'data' => $recipe
        ]);
    }

    /**
     * Update product recipe.
     */
    public function updateRecipe(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'recipe' => 'required|array',
            'recipe.*.ingredient_id' => 'required|exists:ingredients,id',
            'recipe.*.quantity' => 'required|numeric|min:0.01',
        ]);

        // Delete existing recipe
        $product->recipe()->delete();

        // Create new recipe
        foreach ($validated['recipe'] as $recipeItem) {
            ProductRecipe::create([
                'product_id' => $product->id,
                'ingredient_id' => $recipeItem['ingredient_id'],
                'quantity' => $recipeItem['quantity'],
            ]);
        }

        // Load updated recipe for response
        $updatedRecipe = $product->recipe()->with('ingredient')->get();

        return response()->json([
            'success' => true,
            'data' => $updatedRecipe,
            'message' => 'Product recipe updated successfully'
        ]);
    }

    /**
     * Check if product can be made based on ingredient stock.
     */
    public function checkAvailability(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $recipe = $product->recipe()->with('ingredient')->get();

        $canMake = true;
        $insufficientIngredients = [];

        foreach ($recipe as $recipeItem) {
            $ingredient = $recipeItem->ingredient;
            $requiredQuantity = $recipeItem->quantity;
            // For now, we'll assume ingredients are always available
            // This should be implemented when ingredient stock management is ready
            $availableQuantity = 1000; // Default value for testing

            if ($availableQuantity < $requiredQuantity) {
                $canMake = false;
                $insufficientIngredients[] = [
                    'ingredient' => $ingredient->name,
                    'required' => $requiredQuantity,
                    'available' => $availableQuantity,
                    'unit' => $ingredient->unit ?? 'unit',
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'can_make' => $canMake,
                'insufficient_ingredients' => $insufficientIngredients,
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage (web route).
     */
    public function storeWeb(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
            'is_available' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'barcode' => 'nullable|string|max:100|unique:products,barcode',
            'recipe' => 'nullable|array',
            'recipe.*.ingredient_id' => 'required|exists:ingredients,id',
            'recipe.*.quantity' => 'required|numeric|min:0.01',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $validated['image'] = $imagePath;
        }

        $product = Product::create($validated);

        // Create product recipe if provided
        if (isset($validated['recipe']) && is_array($validated['recipe'])) {
            foreach ($validated['recipe'] as $recipeItem) {
                ProductRecipe::create([
                    'product_id' => $product->id,
                    'ingredient_id' => $recipeItem['ingredient_id'],
                    'quantity' => $recipeItem['quantity'],
                ]);
            }
        }

        return to_route('products.index')->with('success', 'สร้างสินค้าสำเร็จแล้ว');
    }

    /**
     * Update the specified resource in storage (web route).
     */
    public function updateWeb(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'cost' => 'sometimes|nullable|numeric|min:0',
            'image_url' => 'sometimes|nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'sometimes|boolean',
            'is_available' => 'sometimes|boolean',
            'sort_order' => 'sometimes|nullable|integer|min:0',
            'sku' => ['sometimes', 'nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product->id)],
            'barcode' => ['sometimes', 'nullable', 'string', 'max:100', Rule::unique('products', 'barcode')->ignore($product->id)],
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $image = $request->file('image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $validated['image'] = $imagePath;
        }

        $product->update($validated);

        return to_route('products.index')->with('success', 'แก้ไขสินค้าสำเร็จแล้ว');
    }

    /**
     * Remove the specified resource from storage (web route).
     */
    public function destroyWeb(string $id): RedirectResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return to_route('products.index')
            ->with('success', 'ลบสินค้าสำเร็จแล้ว');
    }
}
