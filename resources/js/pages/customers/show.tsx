import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Phone, Mail, Calendar, MapPin, Star, ShoppingBag, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Customer {
    id: number;
    name: string;
    email: string | null;
    phone: string;
    address: string | null;
    birth_date: string | null;
    membership_tier: string;
    points: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    items_count?: number;
}

interface CustomerStats {
    total_orders: number;
    total_spent: number;
    avg_order_value: number;
    current_points: number;
    membership_tier: string;
    last_order_date: string | null;
}

interface ShowProps {
    customer: Customer;
    stats: CustomerStats;
    recent_orders: Order[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
    },
    {
        title: 'ลูกค้าทั้งหมด',
        href: '/customers',
    },
    {
        title: 'รายละเอียดลูกค้า',
        href: '',
    },
];

const getMembershipBadgeColor = (tier: string) => {
    switch (tier) {
        case 'platinum':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'gold':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'silver':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
            return 'bg-orange-100 text-orange-800 border-orange-200';
    }
};

const getMembershipLabel = (tier: string) => {
    switch (tier) {
        case 'platinum':
            return 'Platinum (แพลตินัม)';
        case 'gold':
            return 'Gold (โกลด์)';
        case 'silver':
            return 'Silver (ซิลเวอร์)';
        default:
            return 'Bronze (เบรนซ์)';
    }
};

export default function CustomerShow({ customer, stats, recent_orders }: ShowProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`รายละเอียด: ${customer.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">รายละเอียดลูกค้า</h1>
                        <p className="text-muted-foreground">{customer.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/customers/${customer.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                แก้ไข
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/customers">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                กลับ
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                                <CardDescription>
                                    ข้อมูลพื้นฐานของลูกค้า
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">ชื่อลูกค้า</label>
                                        <p className="font-semibold">{customer.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">เบอร์โทรศัพท์</label>
                                        <p className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {customer.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">อีเมล</label>
                                        <p className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            {customer.email || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">วันเกิด</label>
                                        <p className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(customer.birth_date)}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">ที่อยู่</label>
                                    <p className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 mt-0.5" />
                                        {customer.address || '-'}
                                    </p>
                                </div>
                                {customer.notes && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">บันทึกเพิ่มเติม</label>
                                        <p className="text-sm bg-muted p-3 rounded-md">{customer.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>ประวัติการสั่งซื้อล่าสุด</CardTitle>
                                <CardDescription>
                                    10 รายการสั่งซื้อล่าสุด
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recent_orders.length > 0 ? (
                                    <div className="space-y-3">
                                        {recent_orders.map((order) => (
                                            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">คำสั่งซื้อ #{order.id}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(order.created_at)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                                                    <Badge variant="outline">{order.status}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/orders?customer=${customer.id}`}>
                                                ดูทั้งหมด
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium">ยังไม่มีประวัติการสั่งซื้อ</h3>
                                        <p className="text-muted-foreground">ลูกค้านี้ยังไม่เคยสั่งซื้อสินค้า</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customer Stats & Membership */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>สถานะสมาชิก</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <Badge className={`text-lg px-4 py-2 ${getMembershipBadgeColor(customer.membership_tier)}`}>
                                        <Star className="h-4 w-4 mr-1" />
                                        {getMembershipLabel(customer.membership_tier)}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">แต้มสะสม</label>
                                    <p className="text-2xl font-bold text-primary">{customer.points.toLocaleString()} แต้ม</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>สถิติการซื้อ</CardTitle>
                                <CardDescription>
                                    ข้อมูลสถิติการซื้อของลูกค้า
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">จำนวนคำสั่งซื้อ</label>
                                        <p className="text-xl font-bold">{stats.total_orders}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">ยอดซื้อรวม</label>
                                        <p className="text-xl font-bold">{formatCurrency(stats.total_spent)}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">มูลค่าเฉลี่ย/คำสั่งซื้อ</label>
                                    <p className="text-lg font-semibold">{formatCurrency(stats.avg_order_value)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">คำสั่งซื้อล่าสุด</label>
                                    <p className="text-sm">{formatDate(stats.last_order_date)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>การจัดการ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full" asChild>
                                    <Link href={`/orders/create?customer=${customer.id}`}>
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        สร้างคำสั่งซื้อใหม่
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/customers/${customer.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        แก้ไขข้อมูล
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/reports/sales?customer=${customer.id}`}>
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        ดูรายงาน
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
