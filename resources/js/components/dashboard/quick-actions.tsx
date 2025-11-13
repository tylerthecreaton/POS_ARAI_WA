import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    Plus,
    FileText,
    Tag,
    Truck,
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface QuickAction {
    title: string;
    description: string;
    icon: any;
    href: string;
    variant: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
    color: string;
}

const quickActions: QuickAction[] = [
    {
        title: 'สร้างออเดอร์ใหม่',
        description: 'เปิดหน้าจอขายสินค้า',
        icon: ShoppingCart,
        href: '/orders/create',
        variant: 'default',
        color: 'text-blue-600',
    },
    {
        title: 'เพิ่มสินค้า',
        description: 'เพิ่มสินค้าใหม่ในระบบ',
        icon: Package,
        href: '/products/create',
        variant: 'outline',
        color: 'text-green-600',
    },
    {
        title: 'เพิ่มลูกค้า',
        description: 'ลงทะเบียนลูกค้าใหม่',
        icon: Users,
        href: '/customers/create',
        variant: 'outline',
        color: 'text-purple-600',
    },
    {
        title: 'บันทึกสต็อก',
        description: 'บันทึกการเคลื่อนไหววัตถุดิบ',
        icon: Truck,
        href: '/inventory/transactions/create',
        variant: 'outline',
        color: 'text-orange-600',
    },
    {
        title: 'สร้างโปรโมชั่น',
        description: 'สร้างโปรโมชั่นใหม่',
        icon: Tag,
        href: '/promotions/create',
        variant: 'outline',
        color: 'text-red-600',
    },
    {
        title: 'รายงานขาย',
        description: 'ดูรายงานการขาย',
        icon: FileText,
        href: '/reports/sales',
        variant: 'secondary',
        color: 'text-gray-600',
    },
];

export default function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    การทำงานด่วน
                </CardTitle>
                <CardDescription>
                    เข้าถึงฟังก์ชันที่ใช้บ่อยในระบบ POS
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                        <Button
                            key={action.href}
                            variant={action.variant}
                            className="h-auto p-4 justify-start flex-col items-start space-y-2"
                            asChild
                        >
                            <Link href={action.href}>
                                <div className="flex items-center w-full">
                                    <action.icon className={`h-5 w-5 mr-3 ${action.color}`} />
                                    <div className="text-left">
                                        <div className="font-medium">{action.title}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {action.description}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
