<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query();

        // Search by name or phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('phone', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Filter by membership tier
        if ($request->has('membership_tier')) {
            $query->where('membership_tier', $request->membership_tier);
        }

        $customers = $query->orderBy('name')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:customers,email',
            'phone' => 'required|string|max:20|unique:customers,phone',
            'address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'membership_tier' => ['nullable', Rule::in(['bronze', 'silver', 'gold', 'platinum'])],
            'points' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        // Set default membership tier if not provided
        if (!isset($validated['membership_tier'])) {
            $validated['membership_tier'] = 'bronze';
        }

        // Set default points if not provided
        if (!isset($validated['points'])) {
            $validated['points'] = 0;
        }

        $customer = Customer::create($validated);

        return response()->json([
            'success' => true,
            'data' => $customer,
            'message' => 'Customer created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $customer = Customer::with(['orders' => function ($query) {
            $query->orderBy('created_at', 'desc')->limit(10);
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('customers', 'email')->ignore($customer->id)],
            'phone' => ['sometimes', 'string', 'max:20', Rule::unique('customers', 'phone')->ignore($customer->id)],
            'address' => 'sometimes|nullable|string',
            'birth_date' => 'sometimes|nullable|date',
            'membership_tier' => ['sometimes', Rule::in(['bronze', 'silver', 'gold', 'platinum'])],
            'points' => 'sometimes|integer|min:0',
            'notes' => 'sometimes|nullable|string',
        ]);

        $customer->update($validated);

        return response()->json([
            'success' => true,
            'data' => $customer,
            'message' => 'Customer updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        // Check if customer has orders
        if ($customer->orders()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete customer with associated orders'
            ], 400);
        }

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully'
        ]);
    }

    /**
     * Add points to customer.
     */
    public function addPoints(Request $request, string $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'points' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
        ]);

        $customer->increment('points', $validated['points']);

        // Create a transaction record (if you have a points transaction table)
        // PointsTransaction::create([
        //     'customer_id' => $customer->id,
        //     'points' => $validated['points'],
        //     'type' => 'earned',
        //     'reason' => $validated['reason'] ?? 'Manual addition',
        // ]);

        return response()->json([
            'success' => true,
            'data' => $customer,
            'message' => 'Points added successfully'
        ]);
    }

    /**
     * Redeem points from customer.
     */
    public function redeemPoints(Request $request, string $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'points' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
        ]);

        if ($customer->points < $validated['points']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient points'
            ], 400);
        }

        $customer->decrement('points', $validated['points']);

        // Create a transaction record (if you have a points transaction table)
        // PointsTransaction::create([
        //     'customer_id' => $customer->id,
        //     'points' => $validated['points'],
        //     'type' => 'redeemed',
        //     'reason' => $validated['reason'] ?? 'Manual redemption',
        // ]);

        return response()->json([
            'success' => true,
            'data' => $customer,
            'message' => 'Points redeemed successfully'
        ]);
    }

    /**
     * Get customer statistics.
     */
    public function statistics(string $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $totalOrders = $customer->orders()->count();
        $totalSpent = $customer->orders()->sum('total_amount');
        $avgOrderValue = $totalOrders > 0 ? $totalSpent / $totalOrders : 0;

        $lastOrder = $customer->orders()->orderBy('created_at', 'desc')->first();

        return response()->json([
            'success' => true,
            'data' => [
                'total_orders' => $totalOrders,
                'total_spent' => $totalSpent,
                'avg_order_value' => $avgOrderValue,
                'current_points' => $customer->points,
                'membership_tier' => $customer->membership_tier,
                'last_order_date' => $lastOrder ? $lastOrder->created_at : null,
            ]
        ]);
    }

    /**
     * Get customer order history.
     */
    public function orders(Request $request, string $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $query = $customer->orders()->with(['items.product', 'promotions.promotion']);

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Upgrade customer membership tier.
     */
    public function upgradeTier(Request $request, string $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'membership_tier' => ['required', Rule::in(['bronze', 'silver', 'gold', 'platinum'])],
            'reason' => 'nullable|string|max:255',
        ]);

        $customer->update([
            'membership_tier' => $validated['membership_tier'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $customer,
            'message' => 'Membership tier upgraded successfully'
        ]);
    }
}
