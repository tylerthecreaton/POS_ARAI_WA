import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, TrendingDown, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface LowStockItem {
    id: number;
    name: string;
    current_stock: number;
    min_stock: number;
    unit: string;
    cost_per_unit: number;
}

interface InventoryStatusProps {
    lowStockItems: LowStockItem[];
    totalIngredients: number;
    criticalItemsCount: number;
}

export default function InventoryStatus({
    lowStockItems,
    totalIngredients,
    criticalItemsCount,
}: InventoryStatusProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const getStockLevelVariant = (current: number, min: number) => {
        const ratio = current / min;
        if (ratio <= 0.5) return 'destructive';
        if (ratio <= 0.8) return 'secondary';
        return 'outline';
    };

    const getStockLevelText = (current: number, min: number) => {
        const ratio = current / min;
        if (ratio <= 0.5) return 'วัตถุดิบน้อยมาก';
        if (ratio <= 0.8) return 'วัตถุดิบน้อย';
        return 'วัตถุดิบใกล้หมด';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        สถานะสต็อก
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/inventory">จัดการสต็อก</Link>
                    </Button>
                </CardTitle>
                <CardDescription>
                    ภาพรวมสถานะวัตถุดิบในคลัง
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{totalIngredients}</div>
                        <div className="text-sm text-muted-foreground">วัตถุดิบทั้งหมด</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{criticalItemsCount}</div>
                        <div className="text-sm text-muted-foreground">ต้องเติมเต็ม</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        วัตถุดิบใกล้หมด
                    </div>

                    {lowStockItems.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            ไม่มีวัตถุดิบที่ต้องเติมเต็มในขณะนี้
                        </div>
                    ) : (
                        lowStockItems.slice(0, 5).map((item) => {
                            const stockRatio = item.current_stock / item.min_stock;
                            const isCritical = stockRatio <= 0.5;

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        {isCritical ? (
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-amber-600" />
                                        )}
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant={getStockLevelVariant(
                                                        item.current_stock,
                                                        item.min_stock,
                                                    )}
                                                    className="text-xs"
                                                >
                                                    {getStockLevelText(
                                                        item.current_stock,
                                                        item.min_stock,
                                                    )}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatNumber(item.current_stock)} /{' '}
                                                    {formatNumber(item.min_stock)} {item.unit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">
                                            {formatCurrency(item.cost_per_unit)} / {item.unit}
                                        </div>
                                        <Button size="sm" variant="outline" className="mt-1">
                                            <Plus className="h-3 w-3 mr-1" />
                                            เติม
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {lowStockItems.length > 5 && (
                        <div className="text-center pt-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/inventory?filter=low-stock">
                                    ดูวัตถุดิบที่ต้องเติมทั้งหมด ({lowStockItems.length})
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
