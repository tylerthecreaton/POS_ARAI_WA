import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, TrendingUp, Star, Award } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface TopCustomer {
    id: number;
    name: string;
    phone: string;
    total_orders: number;
    total_spent: number;
    points: number;
}

interface CustomerAnalyticsProps {
    newCustomersThisMonth: number;
    totalCustomers: number;
    repeatCustomersCount: number;
    repeatCustomerRate: number;
    topCustomers: TopCustomer[];
}

export default function CustomerAnalytics({
    newCustomersThisMonth,
    totalCustomers,
    repeatCustomersCount,
    repeatCustomerRate,
    topCustomers,
}: CustomerAnalyticsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('th-TH').format(num);
    };

    const getCustomerBadgeVariant = (points: number) => {
        if (points >= 1000) return 'default';
        if (points >= 500) return 'secondary';
        return 'outline';
    };

    const getCustomerLevel = (points: number) => {
        if (points >= 1000) return 'VIP';
        if (points >= 500) return 'Gold';
        if (points >= 200) return 'Silver';
        return 'Bronze';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        ลูกค้า
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/customers">ดูทั้งหมด</Link>
                    </Button>
                </CardTitle>
                <CardDescription>
                    ภาพรวมข้อมูลลูกค้าและพฤติกรรมการซื้อ
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold">{formatNumber(totalCustomers)}</div>
                        <div className="text-sm text-muted-foreground">ลูกค้าทั้งหมด</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {formatNumber(newCustomersThisMonth)}
                        </div>
                        <div className="text-sm text-muted-foreground">ลูกค้าใหม่เดือนนี้</div>
                    </div>
                </div>

                <div className="mb-4 p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium">ลูกค้าประจำ</span>
                        </div>
                        <div className="text-right">
                            <div className="font-bold">
                                {formatNumber(repeatCustomersCount)} ({repeatCustomerRate.toFixed(1)}%)
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 font-medium">
                        <Award className="h-4 w-4 text-amber-600" />
                        ลูกค้ายอดเยี่ยม
                    </div>

                    {topCustomers.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            ไม่มีข้อมูลลูกค้าในขณะนี้
                        </div>
                    ) : (
                        topCustomers.map((customer, index) => (
                            <div
                                key={customer.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium">{customer.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge
                                                variant={getCustomerBadgeVariant(customer.points)}
                                                className="text-xs flex items-center gap-1"
                                            >
                                                <Star className="h-3 w-3" />
                                                {getCustomerLevel(customer.points)}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {customer.phone}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">
                                        {formatCurrency(customer.total_spent)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatNumber(customer.total_orders)} ออเดอร์
                                    </div>
                                    <div className="text-xs text-amber-600">
                                        {formatNumber(customer.points)} คะแนน
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
