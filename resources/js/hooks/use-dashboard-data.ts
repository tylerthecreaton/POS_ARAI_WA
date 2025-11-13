import { useState, useEffect } from 'react';

// Mock data for development - replace with actual API calls
const mockSalesMetrics = {
    dailyRevenue: 15420.50,
    weeklyRevenue: 125750.00,
    monthlyRevenue: 485320.75,
    orderCount: 42,
    averageOrderValue: 367.16,
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    customerGrowth: 15.2,
};

const mockTopProducts = [
    {
        id: 1,
        name: 'ชาไทยเย็น',
        category: 'เครื่องดื่ม',
        price: 45.00,
        sold_quantity: 125,
        revenue: 5625.00,
    },
    {
        id: 2,
        name: 'ข้าวมันไก่',
        category: 'อาหารหลัก',
        price: 60.00,
        sold_quantity: 98,
        revenue: 5880.00,
    },
    {
        id: 3,
        name: 'ลาเต้',
        category: 'เครื่องดื่ม',
        price: 55.00,
        sold_quantity: 87,
        revenue: 4785.00,
    },
    {
        id: 4,
        name: 'สลัดผลไม้',
        category: 'ของว่าง',
        price: 40.00,
        sold_quantity: 76,
        revenue: 3040.00,
    },
    {
        id: 5,
        name: 'ขนมปังปิ้ง',
        category: 'ของว่าง',
        price: 25.00,
        sold_quantity: 112,
        revenue: 2800.00,
    },
];

const mockRecentOrders = [
    {
        id: 1001,
        customer_name: 'สมชาย ใจดี',
        total_amount: 245.00,
        status: 'completed' as const,
        order_type: 'walk_in' as const,
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        items: [
            { id: 1, product_name: 'ชาไทยเย็น', quantity: 2, price: 45.00 },
            { id: 2, product_name: 'ขนมปังปิ้ง', quantity: 3, price: 25.00 },
        ],
    },
    {
        id: 1002,
        customer_name: 'สมศรี รักดี',
        total_amount: 180.00,
        status: 'preparing' as const,
        order_type: 'pre_order' as const,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        items: [
            { id: 3, product_name: 'ลาเต้', quantity: 2, price: 55.00 },
            { id: 4, product_name: 'สลัดผลไม้', quantity: 1, price: 40.00 },
        ],
    },
    {
        id: 1003,
        customer_name: 'วิชัย มั่นคง',
        total_amount: 120.00,
        status: 'ready' as const,
        order_type: 'walk_in' as const,
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        items: [
            { id: 2, product_name: 'ข้าวมันไก่', quantity: 2, price: 60.00 },
        ],
    },
    {
        id: 1004,
        customer_name: 'มานี รวยมาก',
        total_amount: 95.00,
        status: 'pending' as const,
        order_type: 'walk_in' as const,
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        items: [
            { id: 1, product_name: 'ชาไทยเย็น', quantity: 1, price: 45.00 },
            { id: 5, product_name: 'ขนมปังปิ้ง', quantity: 2, price: 25.00 },
        ],
    },
    {
        id: 1005,
        customer_name: 'ประสิทธิ์ สุขใจ',
        total_amount: 320.00,
        status: 'completed' as const,
        order_type: 'pre_order' as const,
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        items: [
            { id: 2, product_name: 'ข้าวมันไก่', quantity: 4, price: 60.00 },
            { id: 4, product_name: 'สลัดผลไม้', quantity: 2, price: 40.00 },
        ],
    },
];

const mockInventoryStatus = {
    lowStockItems: [
        {
            id: 1,
            name: 'น้ำตาลทราย',
            current_stock: 2.5,
            min_stock: 5.0,
            unit: 'กิโลกรัม',
            cost_per_unit: 25.00,
        },
        {
            id: 2,
            name: 'นมสด',
            current_stock: 3.0,
            min_stock: 8.0,
            unit: 'ลิตร',
            cost_per_unit: 45.00,
        },
        {
            id: 3,
            name: 'ใบชา',
            current_stock: 0.8,
            min_stock: 2.0,
            unit: 'กิโลกรัม',
            cost_per_unit: 320.00,
        },
        {
            id: 4,
            name: 'กะทิ',
            current_stock: 1.2,
            min_stock: 3.0,
            unit: 'ลิตร',
            cost_per_unit: 65.00,
        },
        {
            id: 5,
            name: 'ไข่ไก่',
            current_stock: 12,
            min_stock: 24,
            unit: 'ฟอง',
            cost_per_unit: 4.50,
        },
    ],
    totalIngredients: 48,
    criticalItemsCount: 5,
};

const mockCustomerAnalytics = {
    newCustomersThisMonth: 28,
    totalCustomers: 342,
    repeatCustomersCount: 156,
    repeatCustomerRate: 45.6,
    topCustomers: [
        {
            id: 1,
            name: 'สมชาย ใจดี',
            phone: '081-234-5678',
            total_orders: 45,
            total_spent: 8750.00,
            points: 1200,
        },
        {
            id: 2,
            name: 'สมศรี รักดี',
            phone: '082-345-6789',
            total_orders: 38,
            total_spent: 6240.00,
            points: 890,
        },
        {
            id: 3,
            name: 'วิชัย มั่นคง',
            phone: '083-456-7890',
            total_orders: 32,
            total_spent: 5680.00,
            points: 750,
        },
        {
            id: 4,
            name: 'มานี รวยมาก',
            phone: '084-567-8901',
            total_orders: 28,
            total_spent: 4320.00,
            points: 580,
        },
        {
            id: 5,
            name: 'ประสิทธิ์ สุขใจ',
            phone: '085-678-9012',
            total_orders: 25,
            total_spent: 3850.00,
            points: 450,
        },
    ],
};

export function useDashboardData() {
    const [loading, setLoading] = useState(true);
    const [salesMetrics, setSalesMetrics] = useState(mockSalesMetrics);
    const [topProducts, setTopProducts] = useState(mockTopProducts);
    const [recentOrders, setRecentOrders] = useState(mockRecentOrders);
    const [inventoryStatus, setInventoryStatus] = useState(mockInventoryStatus);
    const [customerAnalytics, setCustomerAnalytics] = useState(mockCustomerAnalytics);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // In a real application, these would be actual API calls
            // const salesResponse = await fetch('/api/dashboard/sales-metrics');
            // const salesData = await salesResponse.json();
            // setSalesMetrics(salesData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Using mock data for now
            setSalesMetrics(mockSalesMetrics);
            setTopProducts(mockTopProducts);
            setRecentOrders(mockRecentOrders);
            setInventoryStatus(mockInventoryStatus);
            setCustomerAnalytics(mockCustomerAnalytics);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Dashboard data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return {
        loading,
        error,
        salesMetrics,
        topProducts,
        recentOrders,
        inventoryStatus,
        customerAnalytics,
        refetch: fetchDashboardData,
    };
}
