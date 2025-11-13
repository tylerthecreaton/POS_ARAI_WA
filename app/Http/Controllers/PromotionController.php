<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\OrderPromotion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class PromotionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Promotion::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by promotion type
        if ($request->has('promotion_type')) {
            $query->where('promotion_type', $request->promotion_type);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('start_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('end_date', '<=', $request->end_date);
        }

        $promotions = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $promotions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'promotion_type' => ['required', Rule::in(['percentage', 'fixed_amount', 'buy_one_get_one', 'free_item', 'points_multiplier'])],
            'discount_value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_count' => 'nullable|integer|min:0',
            'applicable_product_ids' => 'nullable|array',
            'applicable_product_ids.*' => 'exists:products,id',
            'applicable_category_ids' => 'nullable|array',
            'applicable_category_ids.*' => 'exists:categories,id',
            'required_points' => 'nullable|integer|min:0',
            'points_multiplier' => 'nullable|numeric|min:0',
            'free_product_id' => 'nullable|exists:products,id',
            'buy_quantity' => 'nullable|integer|min:1',
            'get_quantity' => 'nullable|integer|min:1',
        ]);

        $promotion = Promotion::create($validated);

        // Sync applicable products and categories
        if (isset($validated['applicable_product_ids'])) {
            $promotion->applicableProducts()->sync($validated['applicable_product_ids']);
        }

        if (isset($validated['applicable_category_ids'])) {
            $promotion->applicableCategories()->sync($validated['applicable_category_ids']);
        }

        return response()->json([
            'success' => true,
            'data' => $promotion,
            'message' => 'Promotion created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $promotion = Promotion::with(['applicableProducts', 'applicableCategories'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $promotion
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $promotion = Promotion::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'promotion_type' => ['sometimes', Rule::in(['percentage', 'fixed_amount', 'buy_one_get_one', 'free_item', 'points_multiplier'])],
            'discount_value' => 'sometimes|numeric|min:0',
            'min_order_amount' => 'sometimes|nullable|numeric|min:0',
            'max_discount_amount' => 'sometimes|nullable|numeric|min:0',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'is_active' => 'sometimes|boolean',
            'usage_limit' => 'sometimes|nullable|integer|min:1',
            'usage_count' => 'sometimes|nullable|integer|min:0',
            'applicable_product_ids' => 'sometimes|nullable|array',
            'applicable_product_ids.*' => 'exists:products,id',
            'applicable_category_ids' => 'sometimes|nullable|array',
            'applicable_category_ids.*' => 'exists:categories,id',
            'required_points' => 'sometimes|nullable|integer|min:0',
            'points_multiplier' => 'sometimes|nullable|numeric|min:0',
            'free_product_id' => 'sometimes|nullable|exists:products,id',
            'buy_quantity' => 'sometimes|nullable|integer|min:1',
            'get_quantity' => 'sometimes|nullable|integer|min:1',
        ]);

        $promotion->update($validated);

        // Sync applicable products and categories
        if (isset($validated['applicable_product_ids'])) {
            $promotion->applicableProducts()->sync($validated['applicable_product_ids']);
        }

        if (isset($validated['applicable_category_ids'])) {
            $promotion->applicableCategories()->sync($validated['applicable_category_ids']);
        }

        return response()->json([
            'success' => true,
            'data' => $promotion,
            'message' => 'Promotion updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Promotion deleted successfully'
        ]);
    }

    /**
     * Get active promotions.
     */
    public function active(): JsonResponse
    {
        $promotions = Promotion::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            })
            ->with(['applicableProducts', 'applicableCategories'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $promotions
        ]);
    }

    /**
     * Apply promotion to order.
     */
    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'promotion_id' => 'required|exists:promotions,id',
            'order_id' => 'required|exists:orders,id',
        ]);

        $promotion = Promotion::findOrFail($validated['promotion_id']);

        // Check if promotion is active and valid
        if (!$promotion->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Promotion is not active'
            ], 400);
        }

        // Check if promotion is within date range
        if ($promotion->start_date && now()->lt($promotion->start_date)) {
            return response()->json([
                'success' => false,
                'message' => 'Promotion has not started yet'
            ], 400);
        }

        if ($promotion->end_date && now()->gt($promotion->end_date)) {
            return response()->json([
                'success' => false,
                'message' => 'Promotion has expired'
            ], 400);
        }

        // Check usage limit
        if ($promotion->usage_limit && $promotion->usage_count >= $promotion->usage_limit) {
            return response()->json([
                'success' => false,
                'message' => 'Promotion usage limit reached'
            ], 400);
        }

        // Check if promotion is already applied to this order
        $existingOrderPromotion = OrderPromotion::where('order_id', $validated['order_id'])
            ->where('promotion_id', $validated['promotion_id'])
            ->first();

        if ($existingOrderPromotion) {
            return response()->json([
                'success' => false,
                'message' => 'Promotion is already applied to this order'
            ], 400);
        }

        // Apply promotion to order
        OrderPromotion::create([
            'order_id' => $validated['order_id'],
            'promotion_id' => $validated['promotion_id'],
        ]);

        // Increment usage count
        $promotion->increment('usage_count');

        return response()->json([
            'success' => true,
            'message' => 'Promotion applied successfully'
        ]);
    }

    /**
     * Remove promotion from order.
     */
    public function remove(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'promotion_id' => 'required|exists:promotions,id',
            'order_id' => 'required|exists:orders,id',
        ]);

        $orderPromotion = OrderPromotion::where('order_id', $validated['order_id'])
            ->where('promotion_id', $validated['promotion_id'])
            ->firstOrFail();

        $orderPromotion->delete();

        // Decrement usage count
        $promotion = Promotion::findOrFail($validated['promotion_id']);
        if ($promotion->usage_count > 0) {
            $promotion->decrement('usage_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Promotion removed successfully'
        ]);
    }
}
