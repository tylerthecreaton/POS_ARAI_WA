import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import SalesMetrics from '@/components/dashboard/sales-metrics';
import TopProducts from '@/components/dashboard/top-products';
import RecentOrders from '@/components/dashboard/recent-orders';
import InventoryStatus from '@/components/dashboard/inventory-status';
import CustomerAnalytics from '@/components/dashboard/customer-analytics';
import QuickActions from '@/components/dashboard/quick-actions';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const {
        loading,
        error,
        salesMetrics,
        topProducts,
        recentOrders,
        inventoryStatus,
        customerAnalytics,
    } = useDashboardData();

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="แดชบอร์ด" />
                <div className="flex h-full flex-1 flex-col items-center justify-center p-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h2>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="แดชบอร์ด" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="แดชบอร์ด" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Sales Metrics */}
                <SalesMetrics {...salesMetrics} />

                {/* Main Dashboard Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Top Products */}
                    <TopProducts products={topProducts} />

                    {/* Recent Orders */}
                    <RecentOrders orders={recentOrders} />

                    {/* Inventory Status */}
                    <InventoryStatus {...inventoryStatus} />

                    {/* Customer Analytics */}
                    <CustomerAnalytics {...customerAnalytics} />

                    {/* Quick Actions - Spans 2 columns */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <QuickActions />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
