<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPromotion;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductRecipe;
use App\Models\Ingredient;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['customer', 'orderItems.product', 'promotions.promotion']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.customizations' => 'nullable|array',
            'order_type' => ['required', Rule::in(['dine_in', 'takeaway', 'delivery'])],
            'table_number' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'payment_method' => ['nullable', Rule::in(['cash', 'card', 'mobile_banking', 'wallet'])],
            'promotion_ids' => 'nullable|array',
            'promotion_ids.*' => 'exists:promotions,id',
        ]);

        return DB::transaction(function () use ($validated) {
            // Create order
            $order = Order::create([
                'customer_id' => $validated['customer_id'] ?? null,
                'order_number' => $this->generateOrderNumber(),
                'status' => 'pending',
                'order_type' => $validated['order_type'],
                'table_number' => $validated['table_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'subtotal' => 0,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'payment_status' => 'pending',
                'payment_method' => $validated['payment_method'] ?? null,
            ]);

            // Create order items and calculate subtotal
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $itemTotal = $item['quantity'] * $item['price'];
                $subtotal += $itemTotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $itemTotal,
                    'customizations' => $item['customizations'] ?? null,
                ]);
            }

            // Calculate tax (assuming 7% tax rate)
            $taxAmount = $subtotal * 0.07;
            $totalAmount = $subtotal + $taxAmount;

            // Apply promotions
            $discountAmount = 0;
            if (isset($validated['promotion_ids']) && is_array($validated['promotion_ids'])) {
                foreach ($validated['promotion_ids'] as $promotionId) {
                    OrderPromotion::create([
                        'order_id' => $order->id,
                        'promotion_id' => $promotionId,
                    ]);

                    // Calculate discount based on promotion
                    // This is a simplified calculation, you might want to add more complex logic
                    $promotion = \App\Models\Promotion::find($promotionId);
                    if ($promotion) {
                        if ($promotion->promotion_type === 'percentage') {
                            $discountAmount += $subtotal * ($promotion->discount_value / 100);
                        } elseif ($promotion->promotion_type === 'fixed_amount') {
                            $discountAmount += $promotion->discount_value;
                        }
                    }
                }
            }

            // Update order totals
            $order->update([
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount - $discountAmount,
            ]);

            // Load relationships for response
            $order->load(['customer', 'orderItems.product', 'promotions.promotion']);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order created successfully'
            ], 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $order = Order::with(['customer', 'orderItems.product', 'promotions.promotion'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'customer_id' => 'sometimes|nullable|exists:customers,id',
            'status' => ['sometimes', Rule::in(['pending', 'preparing', 'ready', 'completed', 'cancelled'])],
            'order_type' => ['sometimes', Rule::in(['dine_in', 'takeaway', 'delivery'])],
            'table_number' => 'sometimes|nullable|string|max:50',
            'notes' => 'sometimes|nullable|string',
            'payment_status' => ['sometimes', Rule::in(['pending', 'paid', 'refunded'])],
            'payment_method' => ['sometimes', 'nullable', Rule::in(['cash', 'card', 'mobile_banking', 'wallet'])],
        ]);

        $order->update($validated);

        // Load relationships for response
        $order->load(['customer', 'orderItems.product', 'promotions.promotion']);

        return response()->json([
            'success' => true,
            'data' => $order,
            'message' => 'Order updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        // Only allow deletion of pending orders
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete order that is not in pending status'
            ], 400);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully'
        ]);
    }

    /**
     * Process payment for order.
     */
    public function processPayment(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'payment_method' => ['required', Rule::in(['cash', 'card', 'mobile_banking', 'wallet'])],
            'paid_amount' => 'required|numeric|min:0',
            'change_amount' => 'nullable|numeric|min:0',
        ]);

        // Update payment status
        $order->update([
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'paid',
            'status' => 'completed',
        ]);

        // Deduct ingredients from stock
        $this->deductIngredientsFromStock($order);

        // Add points to customer if applicable
        if ($order->customer_id) {
            $customer = Customer::find($order->customer_id);
            if ($customer) {
                $pointsEarned = floor($order->total_amount); // 1 point per 1 currency unit
                $customer->increment('points', $pointsEarned);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $order,
            'message' => 'Payment processed successfully'
        ]);
    }

    /**
     * Cancel order.
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        // Only allow cancellation of pending or preparing orders
        if (!in_array($order->status, ['pending', 'preparing'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel order that is already ready or completed'
            ], 400);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:255',
        ]);

        $order->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $order,
            'message' => 'Order cancelled successfully'
        ]);
    }

    /**
     * Get order statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $orders = Order::whereBetween('created_at', [$startDate, $endDate]);

        $totalOrders = $orders->count();
        $totalRevenue = $orders->sum('total_amount');
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        $ordersByStatus = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $ordersByType = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('order_type, COUNT(*) as count')
            ->groupBy('order_type')
            ->pluck('count', 'order_type')
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'avg_order_value' => $avgOrderValue,
                'orders_by_status' => $ordersByStatus,
                'orders_by_type' => $ordersByType,
            ]
        ]);
    }

    /**
     * Generate unique order number.
     */
    private function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $lastOrder = Order::whereDate('created_at', now())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastOrder ? intval(substr($lastOrder->order_number, -4)) + 1 : 1;

        return 'ORD' . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Deduct ingredients from stock when order is completed.
     */
    private function deductIngredientsFromStock(Order $order): void
    {
        foreach ($order->orderItems as $item) {
            $product = Product::find($item->product_id);
            if ($product) {
                $recipes = ProductRecipe::where('product_id', $product->id)->get();

                foreach ($recipes as $recipe) {
                    $ingredient = Ingredient::find($recipe->ingredient_id);
                    if ($ingredient) {
                        $totalQuantity = $recipe->quantity * $item->quantity;

                        // Check if there's enough stock
                        if ($ingredient->current_stock >= $totalQuantity) {
                            // Deduct from stock
                            $ingredient->decrement('current_stock', $totalQuantity);

                            // Create stock transaction
                            StockTransaction::create([
                                'ingredient_id' => $ingredient->id,
                                'transaction_type' => 'out',
                                'quantity' => $totalQuantity,
                                'notes' => 'Used for Order #' . $order->order_number,
                            ]);
                        }
                    }
                }
            }
        }
    }
}
