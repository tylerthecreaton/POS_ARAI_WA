import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search, Truck, AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
    },
    {
        title: 'สต็อกวัตถุดิบ',
        href: '/inventory',
    },
];

export default function InventoryIndex() {
    const [stockSummary, setStockSummary] = useState({
        total: 0,
        lowStock: 0,
        outOfStock: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch stock summary from API
        fetch('/api/stock-transactions/summary')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const ingredients = data.data;
                    const total = ingredients.length;
                    const lowStock = ingredients.filter((item: any) => item.is_low_stock && item.current_stock > 0).length;
                    const outOfStock = ingredients.filter((item: any) => item.current_stock === 0).length;

                    setStockSummary({ total, lowStock, outOfStock });
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching stock summary:', error);
                setLoading(false);
            });
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="สต็อกวัตถุดิบ" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">สต็อกวัตถุดิบ</h1>
                        <p className="text-muted-foreground">จัดการวัตถุดิบและสต็อกในระบบ</p>
                    </div>
                    <Button asChild>
                        <Link href="/inventory/transactions/create">
                            <Plus className="h-4 w-4 mr-2" />
                            บันทึกสต็อก
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                วัตถุดิบทั้งหมด
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '...' : stockSummary.total}</div>
                            <p className="text-xs text-muted-foreground">รายการ</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                วัตถุดิบใกล้หมด
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{loading ? '...' : stockSummary.lowStock}</div>
                            <p className="text-xs text-muted-foreground">รายการ</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-600" />
                                วัตถุดิบหมด
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{loading ? '...' : stockSummary.outOfStock}</div>
                            <p className="text-xs text-muted-foreground">รายการ</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>การจัดการด่วน</CardTitle>
                        <CardDescription>
                            เข้าถึงหน้าจัดการวัตถุดิบและบันทึกการเคลื่อนไหวสต็อก
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 md:grid-cols-2">
                            <Button asChild className="w-full">
                                <Link href="/ingredients">
                                    <Package className="h-4 w-4 mr-2" />
                                    จัดการวัตถุดิบ
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/inventory/transactions">
                                    <Truck className="h-4 w-4 mr-2" />
                                    ประวัติการเคลื่อนไหว
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {stockSummary.total === 0 && !loading && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="text-center py-12">
                                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">ยังไม่มีวัตถุดิบในระบบ</h3>
                                <p className="text-muted-foreground mt-2">
                                    เริ่มต้นโดยการเพิ่มวัตถุดิบใหม่
                                </p>
                                <div className="flex gap-2 justify-center mt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/inventory/transactions">
                                            ดูประวัติการเคลื่อนไหว
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/ingredients/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            เพิ่มวัตถุดิบ
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
