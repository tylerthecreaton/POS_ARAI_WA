<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IngredientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $ingredients = Ingredient::all();

        // Append is_low_stock attribute to each ingredient
        $ingredients->each(function ($ingredient) {
            $ingredient->is_low_stock = $ingredient->is_low_stock;
        });

        return response()->json([
            'success' => true,
            'data' => $ingredients
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'current_stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
        ]);

        $ingredient = Ingredient::create($validated);

        return response()->json([
            'success' => true,
            'data' => $ingredient,
            'message' => 'Ingredient created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $ingredient = Ingredient::findOrFail($id);

        // Append is_low_stock attribute
        $ingredient->is_low_stock = $ingredient->is_low_stock;

        return response()->json([
            'success' => true,
            'data' => $ingredient
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $ingredient = Ingredient::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'current_stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
        ]);

        $ingredient->update($validated);

        return response()->json([
            'success' => true,
            'data' => $ingredient,
            'message' => 'Ingredient updated successfully'
        ]);
    }

    /**
     * Get stock information for ingredient.
     */
    public function stock(string $id): JsonResponse
    {
        $ingredient = Ingredient::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'current_stock' => $ingredient->current_stock,
                'min_stock' => $ingredient->min_stock,
                'is_low_stock' => $ingredient->is_low_stock,
                'stock_transactions' => $ingredient->stockTransactions()->orderBy('created_at', 'desc')->limit(10)->get()
            ]
        ]);
    }

    /**
     * Update stock for ingredient.
     */
    public function updateStock(Request $request, string $id): JsonResponse
    {
        $ingredient = Ingredient::findOrFail($id);

        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'unit_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Create stock transaction
        StockTransaction::create([
            'ingredient_id' => $ingredient->id,
            'transaction_type' => $request->has('quantity') ? 'in' : 'out',
            'quantity' => abs($validated['quantity']),
            'unit_cost' => $validated['unit_cost'],
            'notes' => $validated['notes'],
        ]);

        // Update ingredient stock
        $ingredient->current_stock += $validated['quantity'];
        $ingredient->save();

        return response()->json([
            'success' => true,
            'data' => $ingredient,
            'message' => 'Stock updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $ingredient = Ingredient::findOrFail($id);
        $ingredient->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ingredient deleted successfully'
        ]);
    }

    /**
     * Display a listing of the resource for web view.
     */
    public function indexWeb()
    {
        return Inertia::render('ingredients/index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function createWeb()
    {
        return Inertia::render('ingredients/create');
    }

    /**
     * Store a newly created resource in storage for web requests.
     */
    public function storeWeb(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'current_stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
        ]);

        $ingredient = Ingredient::create($validated);

        return redirect()->route('ingredients.index')
            ->with('success', 'วัตถุดิบถูกสร้างเรียบร้อยแล้ว');
    }

    /**
     * Display the specified resource for web view.
     */
    public function showWeb(string $id)
    {
        $ingredient = Ingredient::findOrFail($id);

        return Inertia::render('ingredients/show', [
            'id' => $id,
            'ingredient' => $ingredient
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function editWeb(string $id)
    {
        $ingredient = Ingredient::findOrFail($id);

        return Inertia::render('ingredients/edit', [
            'id' => $id,
            'ingredient' => $ingredient
        ]);
    }

    /**
     * Update the specified resource in storage for web requests.
     */
    public function updateWeb(Request $request, string $id)
    {
        $ingredient = Ingredient::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'current_stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
        ]);

        $ingredient->update($validated);

        return redirect()->route('ingredients.index')
            ->with('success', 'วัตถุดิบถูกอัพเดทเรียบร้อยแล้ว');
    }

    /**
     * Remove the specified resource from storage for web requests.
     */
    public function destroyWeb(string $id)
    {
        $ingredient = Ingredient::findOrFail($id);
        $ingredient->delete();

        return redirect()->route('ingredients.index')
            ->with('success', 'วัตถุดิบถูกลบเรียบร้อยแล้ว');
    }
}
