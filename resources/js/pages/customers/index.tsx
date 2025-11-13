import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter, Search, Users, Edit, Eye, Trash2, Star } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface Customer {
    id: number;
    name: string;
    email: string | null;
    phone: string;
    membership_tier: string;
    points: number;
    created_at: string;
    orders_count?: number;
    total_spent?: number;
}

interface PaginatedData {
    data: Customer[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface IndexProps {
    customers: PaginatedData;
    filters: {
        search?: string;
        membership_tier?: string;
    };
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
            return 'Platinum';
        case 'gold':
            return 'Gold';
        case 'silver':
            return 'Silver';
        default:
            return 'Bronze';
    }
};

export default function CustomersIndex({ customers, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [membershipTier, setMembershipTier] = useState(filters.membership_tier || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/customers', {
            search,
            membership_tier: membershipTier === 'all' ? '' : membershipTier,
        }, {
            preserveState: true,
        });
    };

    const handleFilter = (tier: string) => {
        setMembershipTier(tier);
        router.get('/customers', {
            search,
            membership_tier: tier === 'all' ? '' : tier,
        }, {
            preserveState: true,
        });
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: 'คุณแน่ใจว่าต้องการลบลูกค้านี้?',
            text: `คุณกำลังจะลบข้อมูลลูกค้า: ${name}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/customers/${id}`, {
                    onSuccess: () => {
                        Swal.fire(
                            'ลบสำเร็จ!',
                            'ข้อมูลลูกค้าถูกลบเรียบร้อยแล้ว',
                            'success'
                        );
                    },
                    onError: () => {
                        Swal.fire(
                            'เกิดข้อผิดพลาด!',
                            'ไม่สามารถลบข้อมูลลูกค้าได้',
                            'error'
                        );
                    }
                });
            }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
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
            <Head title="ลูกค้าทั้งหมด" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">ลูกค้าทั้งหมด</h1>
                        <p className="text-muted-foreground">จัดการข้อมูลลูกค้าในระบบ</p>
                    </div>
                    <Button asChild>
                        <Link href="/customers/create">
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มลูกค้าใหม่
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ค้นหาและกรอง</CardTitle>
                        <CardDescription>
                            ค้นหาลูกค้าตามชื่อหรือเบอร์โทรศัพท์
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="ค้นหาลูกค้า..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Button type="submit">
                                    <Search className="h-4 w-4 mr-2" />
                                    ค้นหา
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">ระดับสมาชิก:</span>
                                <Select value={membershipTier} onValueChange={handleFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="ทุกระดับ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทุกระดับ</SelectItem>
                                        <SelectItem value="bronze">Bronze</SelectItem>
                                        <SelectItem value="silver">Silver</SelectItem>
                                        <SelectItem value="gold">Gold</SelectItem>
                                        <SelectItem value="platinum">Platinum</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>รายชื่อลูกค้า ({customers.total})</CardTitle>
                        <CardDescription>
                            จัดการข้อมูลลูกค้าทั้งหมดในระบบ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {customers.data.length > 0 ? (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2">ชื่อลูกค้า</th>
                                                <th className="text-left p-2">เบอร์โทรศัพท์</th>
                                                <th className="text-left p-2">อีเมล</th>
                                                <th className="text-left p-2">ระดับสมาชิก</th>
                                                <th className="text-left p-2">แต้มสะสม</th>
                                                <th className="text-left p-2">ยอดซื้อรวม</th>
                                                <th className="text-left p-2">วันที่สมัคร</th>
                                                <th className="text-left p-2">จัดการ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customers.data.map((customer) => (
                                                <tr key={customer.id} className="border-b hover:bg-muted/50">
                                                    <td className="p-2">
                                                        <div>
                                                            <p className="font-medium">{customer.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {customer.orders_count || 0} คำสั่งซื้อ
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="p-2">{customer.phone}</td>
                                                    <td className="p-2">{customer.email || '-'}</td>
                                                    <td className="p-2">
                                                        <Badge className={`text-xs ${getMembershipBadgeColor(customer.membership_tier)}`}>
                                                            <Star className="h-3 w-3 mr-1" />
                                                            {getMembershipLabel(customer.membership_tier)}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-2">
                                                        <span className="font-medium">{customer.points.toLocaleString()}</span> แต้ม
                                                    </td>
                                                    <td className="p-2">
                                                        {customer.total_spent ? formatCurrency(customer.total_spent) : '-'}
                                                    </td>
                                                    <td className="p-2 text-sm">
                                                        {formatDate(customer.created_at)}
                                                    </td>
                                                    <td className="p-2">
                                                        <div className="flex gap-1">
                                                            <Button size="sm" variant="outline" asChild>
                                                                <Link href={`/customers/${customer.id}`}>
                                                                    <Eye className="h-3 w-3" />
                                                                </Link>
                                                            </Button>
                                                            <Button size="sm" variant="outline" asChild>
                                                                <Link href={`/customers/${customer.id}/edit`}>
                                                                    <Edit className="h-3 w-3" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDelete(customer.id, customer.name)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {customers.last_page > 1 && (
                                    <div className="flex justify-center gap-2 mt-4">
                                        {customers.current_page > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get('/customers', {
                                                    page: customers.current_page - 1,
                                                    search,
                                                    membership_tier: membershipTier,
                                                })}
                                            >
                                                ก่อนหน้า
                                            </Button>
                                        )}
                                        <span className="px-3 py-1 text-sm">
                                            หน้า {customers.current_page} จาก {customers.last_page}
                                        </span>
                                        {customers.current_page < customers.last_page && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get('/customers', {
                                                    page: customers.current_page + 1,
                                                    search,
                                                    membership_tier: membershipTier,
                                                })}
                                            >
                                                ถัดไป
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">ไม่พบลูกค้า</h3>
                                <p className="text-muted-foreground mt-2">
                                    {search || membershipTier ? 'ลองปรับเงื่อนไขการค้นหาหรือกรอง' : 'เริ่มต้นโดยการเพิ่มลูกค้าใหม่'}
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href="/customers/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        เพิ่มลูกค้าใหม่
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
