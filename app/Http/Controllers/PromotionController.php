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

    /**
     * Display a listing of the resource for web.
     */
    public function indexWeb(Request $request)
    {
        return inertia('promotions/index');
    }

    /**
     * Show the form for creating a new resource for web.
     */
    public function createWeb()
    {
        $products = \App\Models\Product::where('is_available', true)->get(['id', 'name', 'price']);
        $categories = \App\Models\Category::all(['id', 'name']);

        return inertia('promotions/create', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /**
     * Display the specified resource for web.
     */
    public function showWeb(string $id)
    {
        $promotion = Promotion::with(['applicableProducts', 'applicableCategories'])->findOrFail($id);

        return inertia('promotions/show', [
            'promotion' => $promotion,
        ]);
    }

    /**
     * Show the form for editing the specified resource for web.
     */
    public function editWeb(string $id)
    {
        $promotion = Promotion::with(['applicableProducts', 'applicableCategories'])->findOrFail($id);
        $products = \App\Models\Product::where('is_available', true)->get(['id', 'name', 'price']);
        $categories = \App\Models\Category::all(['id', 'name']);

        return inertia('promotions/edit', [
            'promotion' => $promotion,
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage for web.
     */
    public function storeWeb(Request $request)
    {
        $response = $this->store($request);

        if ($response->getStatusCode() === 201) {
            return redirect()->route('promotions.index')
                ->with('success', 'สร้างโปรโมชั่นเรียบร้อยแล้ว');
        }

        return redirect()->back()
            ->with('error', 'ไม่สามารถสร้างโปรโมชั่นได้')
            ->withErrors($response->getData(true));
    }

    /**
     * Update the specified resource in storage for web.
     */
    public function updateWeb(Request $request, string $id)
    {
        $response = $this->update($request, $id);

        if ($response->getStatusCode() === 200) {
            return redirect()->route('promotions.index')
                ->with('success', 'อัปเดตโปรโมชั่นเรียบร้อยแล้ว');
        }

        return redirect()->back()
            ->with('error', 'ไม่สามารถอัปเดตโปรโมชั่นได้')
            ->withErrors($response->getData(true));
    }

    /**
     * Remove the specified resource from storage for web.
     */
    public function destroyWeb(string $id)
    {
        $response = $this->destroy($id);

        if ($response->getStatusCode() === 200) {
            return redirect()->route('promotions.index')
                ->with('success', 'ลบโปรโมชั่นเรียบร้อยแล้ว');
        }

        return redirect()->back()
            ->with('error', 'ไม่สามารถลบโปรโมชั่นได้');
    }

    /**
     * Get promotion analytics.
     */
    public function analytics(string $id): JsonResponse
    {
        $promotion = Promotion::findOrFail($id);

        // Get order promotions for this promotion
        $orderPromotions = OrderPromotion::where('promotion_id', $id)
            ->with('order')
            ->get();

        $totalDiscount = $orderPromotions->sum('discount_amount');
        $ordersCount = $orderPromotions->count();

        // Calculate additional metrics
        $totalOrders = \App\Models\Order::count();
        $avgOrderValue = $orderPromotions->avg(function ($item) {
            return $item->order ? $item->order->total_amount : 0;
        });

        // Find peak usage date
        $peakUsageDate = $orderPromotions->groupBy(function ($item) {
            return \Carbon\Carbon::parse($item->created_at)->format('Y-m-d');
        })->map->max('count', function ($group) {
            return $group->count();
        });

        // Calculate daily average usage
        $startDate = $promotion->created_at;
        $daysSinceStart = $startDate->diffInDays(now());
        $dailyAvgUsage = $daysSinceStart > 0 ? round($ordersCount / $daysSinceStart, 2) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_discount' => $totalDiscount,
                'orders_count' => $ordersCount,
                'total_orders' => $totalOrders,
                'total_savings' => $totalDiscount,
                'avg_order_value' => $avgOrderValue,
                'peak_usage_date' => $peakUsageDate ? \Carbon\Carbon::parse($peakUsageDate)->format('d/m/Y') : null,
                'daily_avg_usage' => $dailyAvgUsage,
            ]
        ]);
    }

    /**
     * Preview promotion effects.
     */
    public function preview(Request $request): JsonResponse
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
            'required_points' => 'nullable|integer|min:0',
            'points_multiplier' => 'nullable|numeric|min:0',
            'free_product_id' => 'nullable|exists:products,id',
            'buy_quantity' => 'nullable|integer|min:1',
            'get_quantity' => 'nullable|integer|min:1',
            'applicable_product_ids' => 'nullable|array',
            'applicable_product_ids.*' => 'exists:products,id',
            'applicable_category_ids' => 'nullable|array',
            'applicable_category_ids.*' => 'exists:categories,id',
        ]);

        // Calculate preview effects
        $preview = [
            'promotion_type' => $validated['promotion_type'],
            'discount_value' => $validated['discount_value'],
            'min_order_amount' => $validated['min_order_amount'],
            'max_discount_amount' => $validated['max_discount_amount'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'is_active' => $validated['is_active'],
            'usage_limit' => $validated['usage_limit'],
            'required_points' => $validated['required_points'],
            'points_multiplier' => $validated['points_multiplier'],
            'free_product_id' => $validated['free_product_id'],
            'buy_quantity' => $validated['buy_quantity'],
            'get_quantity' => $validated['get_quantity'],
        ];

        // Calculate sample scenarios
        $sampleScenarios = [];

        // Sample order amounts for calculation
        $sampleAmounts = [100, 500, 1000, 2000];

        foreach ($sampleAmounts as $amount) {
            $discount = 0;
            $finalAmount = $amount;
            $applicable = true;

            switch ($validated['promotion_type']) {
                case 'percentage':
                    $discount = $amount * ($validated['discount_value'] / 100);
                    $finalAmount = $amount - $discount;
                    if ($validated['min_order_amount'] && $amount < $validated['min_order_amount']) {
                        $applicable = false;
                    }
                    if ($validated['max_discount_amount'] && $discount > $validated['max_discount_amount']) {
                        $discount = $validated['max_discount_amount'];
                        $finalAmount = $amount - $discount;
                    }
                    break;

                case 'fixed_amount':
                    $discount = $validated['discount_value'];
                    $finalAmount = $amount - $discount;
                    if ($validated['min_order_amount'] && $amount < $validated['min_order_amount']) {
                        $applicable = false;
                    }
                    break;

                case 'buy_one_get_one':
                    // For BOGO, calculate based on buy_quantity and get_quantity
                    $buyQty = $validated['buy_quantity'] ?? 1;
                    $getQty = $validated['get_quantity'] ?? 1;
                    $discount = ($amount / $buyQty) * $getQty;
                    $finalAmount = $amount;
                    if ($validated['min_order_amount'] && $amount < $validated['min_order_amount']) {
                        $applicable = false;
                    }
                    break;

                case 'free_item':
                    // Free item doesn't affect order amount directly
                    $discount = 0;
                    $finalAmount = $amount;
                    if ($validated['min_order_amount'] && $amount < $validated['min_order_amount']) {
                        $applicable = false;
                    }
                    break;

                case 'points_multiplier':
                    // Points multiplier doesn't affect order amount
                    $discount = 0;
                    $finalAmount = $amount;
                    if ($validated['min_order_amount'] && $amount < $validated['min_order_amount']) {
                        $applicable = false;
                    }
                    break;
            }

            $sampleScenarios[] = [
                'order_amount' => $amount,
                'discount' => $discount,
                'final_amount' => $finalAmount,
                'applicable' => $applicable,
                'savings_percentage' => $amount > 0 ? round(($discount / $amount) * 100, 2) : 0,
            ];
        }

        // Get applicable products and categories
        $applicableProducts = [];
        $applicableCategories = [];

        if (isset($validated['applicable_product_ids'])) {
            $applicableProducts = \App\Models\Product::whereIn('id', $validated['applicable_product_ids'])
                ->get(['id', 'name', 'price']);
        }

        if (isset($validated['applicable_category_ids'])) {
            $applicableCategories = \App\Models\Category::whereIn('id', $validated['applicable_category_ids'])
                ->get(['id', 'name']);
        }

        $preview['sample_scenarios'] = $sampleScenarios;
        $preview['applicable_products'] = $applicableProducts;
        $preview['applicable_categories'] = $applicableCategories;

        return response()->json([
            'success' => true,
            'data' => $preview
        ]);
    }
}
