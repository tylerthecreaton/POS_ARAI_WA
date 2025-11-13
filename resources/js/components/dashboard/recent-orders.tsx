import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, ChefHat, Package, XCircle, Eye } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
}

interface RecentOrder {
    id: number;
    customer_name: string;
    total_amount: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    order_type: 'walk_in' | 'pre_order';
    created_at: string;
    items: OrderItem[];
}

interface RecentOrdersProps {
    orders: RecentOrder[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
        }).format(amount);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'preparing':
                return <ChefHat className="h-4 w-4" />;
            case 'ready':
                return <Package className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'preparing':
                return 'default';
            case 'ready':
                return 'outline';
            case 'completed':
                return 'default';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'รอดำเนินการ';
            case 'preparing':
                return 'กำลังเตรียม';
            case 'ready':
                return 'พร้อมรับ';
            case 'completed':
                return 'เสร็จสิ้น';
            case 'cancelled':
                return 'ยกเลิก';
            default:
                return status;
        }
    };

    const getOrderTypeText = (type: string) => {
        return type === 'walk_in' ? 'หน้าร้าน' : 'สั่งล่วงหน้า';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    ออเดอร์ล่าสุด
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/orders">ดูทั้งหมด</Link>
                    </Button>
                </CardTitle>
                <CardDescription>
                    ออเดอร์ 5 รายการล่าสุดในระบบ
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            ไม่มีออเดอร์ในระบบ
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm font-medium">
                                        #{order.id}
                                    </div>
                                    <div>
                                        <p className="font-medium">{order.customer_name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {getOrderTypeText(order.order_type)}
                                            </Badge>
                                            <Badge
                                                variant={getStatusBadgeVariant(order.status)}
                                                className="text-xs flex items-center gap-1"
                                            >
                                                {getStatusIcon(order.status)}
                                                {getStatusText(order.status)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">
                                        {formatCurrency(order.total_amount)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatTime(order.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
