<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Ingredient;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard overview data.
     */
    public function overview(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $thisMonth = now()->startOfMonth()->toDateString();
        $lastMonth = now()->subMonth()->startOfMonth()->toDateString();
        $lastMonthEnd = now()->subMonth()->endOfMonth()->toDateString();

        // Today's stats
        $todayOrders = Order::whereDate('created_at', $today)->count();
        $todayRevenue = Order::whereDate('created_at', $today)->sum('total_amount');

        // This month's stats
        $thisMonthOrders = Order::whereDate('created_at', '>=', $thisMonth)->count();
        $thisMonthRevenue = Order::whereDate('created_at', '>=', $thisMonth)->sum('total_amount');

        // Last month's stats for comparison
        $lastMonthOrders = Order::whereBetween('created_at', [$lastMonth, $lastMonthEnd])->count();
        $lastMonthRevenue = Order::whereBetween('created_at', [$lastMonth, $lastMonthEnd])->sum('total_amount');

        // Calculate growth percentages
        $ordersGrowth = $lastMonthOrders > 0 ? (($thisMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100 : 0;
        $revenueGrowth = $lastMonthRevenue > 0 ? (($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 : 0;

        // Total counts
        $totalProducts = Product::where('is_active', true)->count();
        $totalCustomers = Customer::count();
        $lowStockIngredients = Ingredient::whereRaw('current_stock <= min_stock')->count();

        // Recent orders
        $recentOrders = Order::with(['customer', 'orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'today_stats' => [
                    'orders' => $todayOrders,
                    'revenue' => $todayRevenue,
                ],
                'monthly_stats' => [
                    'orders' => $thisMonthOrders,
                    'revenue' => $thisMonthRevenue,
                    'orders_growth' => round($ordersGrowth, 2),
                    'revenue_growth' => round($revenueGrowth, 2),
                ],
                'totals' => [
                    'products' => $totalProducts,
                    'customers' => $totalCustomers,
                    'low_stock_ingredients' => $lowStockIngredients,
                ],
                'recent_orders' => $recentOrders,
            ]
        ]);
    }

    /**
     * Get sales data for charts.
     */
    public function salesData(Request $request): JsonResponse
    {
        $period = $request->get('period', '7days'); // 7days, 30days, 90days, 1year

        $startDate = match ($period) {
            '7days' => now()->subDays(7)->toDateString(),
            '30days' => now()->subDays(30)->toDateString(),
            '90days' => now()->subDays(90)->toDateString(),
            '1year' => now()->subYear()->toDateString(),
            default => now()->subDays(7)->toDateString(),
        };

        // Daily sales data
        $dailySales = Order::whereDate('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Sales by category
        $salesByCategory = Order::join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereDate('orders.created_at', '>=', $startDate)
            ->selectRaw('categories.name, SUM(order_items.quantity) as quantity, SUM(order_items.subtotal) as revenue')
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('revenue', 'desc')
            ->get();

        // Top selling products
        $topProducts = Order::join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereDate('orders.created_at', '>=', $startDate)
            ->selectRaw('products.name, SUM(order_items.quantity) as quantity, SUM(order_items.subtotal) as revenue')
            ->groupBy('products.id', 'products.name')
            ->orderBy('quantity', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'daily_sales' => $dailySales,
                'sales_by_category' => $salesByCategory,
                'top_products' => $topProducts,
            ]
        ]);
    }

    /**
     * Get inventory data for dashboard.
     */
    public function inventoryData(): JsonResponse
    {
        // Low stock ingredients
        $lowStockIngredients = Ingredient::whereRaw('current_stock <= min_stock')
            ->orderBy('current_stock', 'asc')
            ->limit(10)
            ->get();

        // Ingredient stock value
        $stockValue = Ingredient::selectRaw('SUM(current_stock * cost_per_unit) as total_value')
            ->first()
            ->total_value ?? 0;

        // Most used ingredients (based on recent transactions)
        $mostUsedIngredients = Ingredient::with(['stockTransactions' => function ($query) {
            $query->where('transaction_type', 'out')
                ->whereDate('created_at', '>=', now()->subDays(30))
                ->selectRaw('ingredient_id, SUM(quantity) as total_used')
                ->groupBy('ingredient_id')
                ->orderBy('total_used', 'desc');
        }])
            ->get()
            ->filter(function ($ingredient) {
                return $ingredient->stockTransactions->isNotEmpty();
            })
            ->sortByDesc(function ($ingredient) {
                return $ingredient->stockTransactions->first()->total_used ?? 0;
            })
            ->take(10)
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'low_stock_ingredients' => $lowStockIngredients,
                'stock_value' => $stockValue,
                'most_used_ingredients' => $mostUsedIngredients,
            ]
        ]);
    }

    /**
     * Get customer data for dashboard.
     */
    public function customerData(): JsonResponse
    {
        // New customers this month
        $newCustomersThisMonth = Customer::whereDate('created_at', '>=', now()->startOfMonth())
            ->count();

        // Top customers by spending
        $topCustomers = Customer::with(['orders' => function ($query) {
            $query->selectRaw('customer_id, SUM(total_amount) as total_spent, COUNT(*) as order_count')
                ->groupBy('customer_id')
                ->orderBy('total_spent', 'desc');
        }])
            ->get()
            ->filter(function ($customer) {
                return $customer->orders->isNotEmpty();
            })
            ->sortByDesc(function ($customer) {
                return $customer->orders->first()->total_spent ?? 0;
            })
            ->take(10)
            ->values();

        // Customers by membership tier
        $customersByTier = Customer::selectRaw('membership_tier, COUNT(*) as count')
            ->groupBy('membership_tier')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'new_customers_this_month' => $newCustomersThisMonth,
                'top_customers' => $topCustomers,
                'customers_by_tier' => $customersByTier,
            ]
        ]);
    }

    /**
     * Get order statistics for dashboard.
     */
    public function orderStats(Request $request): JsonResponse
    {
        $period = $request->get('period', '7days');

        $startDate = match ($period) {
            '7days' => now()->subDays(7)->toDateString(),
            '30days' => now()->subDays(30)->toDateString(),
            '90days' => now()->subDays(90)->toDateString(),
            '1year' => now()->subYear()->toDateString(),
            default => now()->subDays(7)->toDateString(),
        };

        // Orders by status
        $ordersByStatus = Order::whereDate('created_at', '>=', $startDate)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // Orders by type
        $ordersByType = Order::whereDate('created_at', '>=', $startDate)
            ->selectRaw('order_type, COUNT(*) as count')
            ->groupBy('order_type')
            ->get();

        // Average order value by day of week
        $avgOrderValueByDay = Order::whereDate('created_at', '>=', $startDate)
            ->selectRaw('DAYNAME(created_at) as day_name, AVG(total_amount) as avg_value')
            ->groupBy('day_name')
            ->orderByRaw('FIELD(day_name, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")')
            ->get();

        // Peak hours
        $peakHours = Order::whereDate('created_at', '>=', $startDate)
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'orders_by_status' => $ordersByStatus,
                'orders_by_type' => $ordersByType,
                'avg_order_value_by_day' => $avgOrderValueByDay,
                'peak_hours' => $peakHours,
            ]
        ]);
    }
}
