import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Percent } from 'lucide-react';

interface SalesMetricsProps {
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
}

export default function SalesMetrics({
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    orderCount,
    averageOrderValue,
    revenueGrowth,
    orderGrowth,
    customerGrowth,
}: SalesMetricsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('th-TH').format(num);
    };

    const MetricCard = ({
        title,
        value,
        description,
        icon: Icon,
        trend,
        trendValue
    }: {
        title: string;
        value: string;
        description: string;
        icon: any;
        trend?: 'up' | 'down';
        trendValue?: number;
    }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
                {trend && trendValue !== undefined && (
                    <div className="mt-2">
                        <Badge variant={trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                            {trend === 'up' ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(trendValue).toFixed(1)}%
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="รายได้วันนี้"
                value={formatCurrency(dailyRevenue)}
                description="รายได้รวมในวันนี้"
                icon={DollarSign}
                trend={revenueGrowth >= 0 ? 'up' : 'down'}
                trendValue={revenueGrowth}
            />
            <MetricCard
                title="จำนวนออเดอร์"
                value={formatNumber(orderCount)}
                description="ออเดอร์ทั้งหมดวันนี้"
                icon={ShoppingCart}
                trend={orderGrowth >= 0 ? 'up' : 'down'}
                trendValue={orderGrowth}
            />
            <MetricCard
                title="มูลค่าออเดอร์เฉลี่ย"
                value={formatCurrency(averageOrderValue)}
                description="มูลค่าเฉลี่ยต่อออเดอร์"
                icon={Percent}
            />
            <MetricCard
                title="ลูกค้าใหม่"
                value={formatNumber(Math.floor(customerGrowth))}
                description="ลูกค้าใหม่ในสัปดาห์นี้"
                icon={Users}
                trend={customerGrowth >= 0 ? 'up' : 'down'}
                trendValue={customerGrowth}
            />
        </div>
    );
}
