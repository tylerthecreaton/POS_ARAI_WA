import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package } from 'lucide-react';

interface TopProduct {
    id: number;
    name: string;
    category: string;
    price: number;
    sold_quantity: number;
    revenue: number;
    image_url?: string;
}

interface TopProductsProps {
    products: TopProduct[];
}

export default function TopProducts({ products }: TopProductsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('th-TH').format(num);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    สินค้าขายดี
                </CardTitle>
                <CardDescription>
                    สินค้าที่มียอดขายสูงสุดในช่วง 7 วันล่าสุด
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {products.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            ไม่มีข้อมูลสินค้าขายดีในช่วงเวลานี้
                        </div>
                    ) : (
                        products.map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {product.category}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {formatCurrency(product.price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <span className="font-medium">
                                            {formatNumber(product.sold_quantity)} ชิ้น
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {formatCurrency(product.revenue)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
