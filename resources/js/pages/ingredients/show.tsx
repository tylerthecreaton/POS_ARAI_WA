import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Package, AlertTriangle, TrendingDown, Plus, History } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    current_stock: number;
    min_stock: number;
    cost_per_unit: number;
}

interface StockTransaction {
    id: number;
    transaction_type: 'in' | 'out' | 'adjustment';
    quantity: number;
    unit_cost?: number;
    notes?: string;
    created_at: string;
}

interface PageProps {
    ingredient: Ingredient;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
    },
    {
        title: 'สต็อกวัตถุดิบ',
        href: '/inventory',
    },
    {
        title: 'จัดการวัตถุดิบ',
        href: '/ingredients',
    },
    {
        title: 'รายละเอียดวัตถุดิบ',
        href: '',
    },
];

export default function IngredientShow({ id }: { id: string }) {
    const pageProps = usePage().props as any;
    const ingredient = pageProps.ingredient as Ingredient;

    const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch stock transactions for this ingredient
        fetch(`/api/ingredients/${id}/stock`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setStockTransactions(data.data.stock_transactions || []);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching stock transactions:', error);
                setLoading(false);
            });
    }, [id]);

    const getStockStatus = () => {
        if (ingredient.current_stock === 0) {
            return { label: 'หมด', color: 'destructive', icon: TrendingDown };
        } else if (ingredient.current_stock <= ingredient.min_stock) {
            return { label: 'ใกล้หมด', color: 'secondary', icon: AlertTriangle };
        }
        return { label: 'ปกติ', color: 'default', icon: Package };
    };

    const getTransactionTypeLabel = (type: string) => {
        switch (type) {
            case 'in':
                return { label: 'นำเข้า', color: 'default' as const };
            case 'out':
                return { label: 'นำออก', color: 'secondary' as const };
            case 'adjustment':
                return { label: 'ปรับปรุง', color: 'outline' as const };
            default:
                return { label: type, color: 'outline' as const };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const status = getStockStatus();
    const StatusIcon = status.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`รายละเอียด: ${ingredient.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/ingredients">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                กลับ
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{ingredient.name}</h1>
                            <p className="text-muted-foreground">รายละเอียดวัตถุดิบ</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/inventory/transactions/create?ingredient_id=${id}`}>
                                <Plus className="h-4 w-4 mr-2" />
                                บันทึกสต็อก
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/ingredients/${id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                แก้ไข
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">สต็อกปัจจุบัน</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${
                                ingredient.current_stock === 0 ? 'text-red-600' :
                                ingredient.current_stock <= ingredient.min_stock ? 'text-amber-600' : ''
                            }`}>
                                {ingredient.current_stock} {ingredient.unit}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">สต็อกขั้นต่ำ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {ingredient.min_stock} {ingredient.unit}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">ราคาต่อหน่วย</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ฿{ingredient.cost_per_unit}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">สถานะ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={status.color as any} className="flex items-center gap-1 w-fit">
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            ประวัติการเคลื่อนไหวสต็อก
                        </CardTitle>
                        <CardDescription>
                            10 รายการล่าสุด
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                <p className="text-muted-foreground mt-2">กำลังโหลด...</p>
                            </div>
                        ) : stockTransactions.length === 0 ? (
                            <div className="text-center py-8">
                                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">ยังไม่มีประวัติการเคลื่อนไหว</h3>
                                <p className="text-muted-foreground mt-2">
                                    เริ่มต้นโดยการบันทึกการนำเข้าหรือนำออกสต็อก
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href={`/inventory/transactions/create?ingredient_id=${id}`}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        บันทึกสต็อก
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3">วันที่เวลา</th>
                                            <th className="text-left p-3">ประเภท</th>
                                            <th className="text-left p-3">ปริมาณ</th>
                                            <th className="text-left p-3">ราคา/หน่วย</th>
                                            <th className="text-left p-3">หมายเหตุ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockTransactions.map((transaction) => {
                                            const typeInfo = getTransactionTypeLabel(transaction.transaction_type);

                                            return (
                                                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                                                    <td className="p-3">
                                                        {formatDate(transaction.created_at)}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant={typeInfo.color}>
                                                            {typeInfo.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 font-medium">
                                                        {transaction.quantity} {ingredient.unit}
                                                    </td>
                                                    <td className="p-3">
                                                        {transaction.unit_cost ? `฿${transaction.unit_cost}` : '-'}
                                                    </td>
                                                    <td className="p-3 text-sm text-muted-foreground">
                                                        {transaction.notes || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {stockTransactions.length > 0 && (
                            <div className="mt-4 text-center">
                                <Button asChild variant="outline">
                                    <Link href="/inventory/transactions">
                                        ดูประวัติทั้งหมด
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
