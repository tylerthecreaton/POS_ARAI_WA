import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter, Search, Tag, Edit, Trash2, Eye, Calendar, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface Promotion {
    id: number;
    name: string;
    description?: string;
    promotion_type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_item' | 'points_multiplier';
    discount_value: number;
    min_order_amount?: number;
    max_discount_amount?: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    usage_limit?: number;
    usage_count: number;
    required_points?: number;
    points_multiplier?: number;
    free_product_id?: number;
    buy_quantity?: number;
    get_quantity?: number;
    created_at: string;
    updated_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
    },
    {
        title: 'โปรโมชั่นทั้งหมด',
        href: '/promotions',
    },
];

const getPromotionTypeLabel = (type: string) => {
    switch (type) {
        case 'percentage':
            return 'ส่วนลดเปอร์เซ็นต์';
        case 'fixed_amount':
            return 'ส่วนลดคงที่';
        case 'buy_one_get_one':
            return 'ซื้อ 1 แถม 1';
        case 'free_item':
            return 'แถมฟรี';
        case 'points_multiplier':
            return 'คูณแต้ม';
        default:
            return type;
    }
};

const getPromotionTypeColor = (type: string) => {
    switch (type) {
        case 'percentage':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'fixed_amount':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'buy_one_get_one':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'free_item':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'points_multiplier':
            return 'bg-pink-100 text-pink-800 border-pink-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

export default function PromotionsIndex() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    useEffect(() => {
        fetchPromotions();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPromotions();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedType, selectedStatus]);

    const fetchPromotions = async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedType && selectedType !== 'all') params.append('promotion_type', selectedType);
            if (selectedStatus && selectedStatus !== 'all') params.append('is_active', selectedStatus);

            const response = await fetch(`/api/promotions?${params.toString()}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setPromotions(data.data);
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        Swal.fire({
            title: 'ยืนยันการลบโปรโมชั่น',
            text: 'คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชั่นนี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบโปรโมชั่น',
            cancelButtonText: 'ยกเลิก',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    const response = await fetch(`/api/promotions/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN': csrfToken || '',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    if (data.success) {
                        Swal.fire({
                            title: 'สำเร็จ!',
                            text: 'ลบโปรโมชั่นเรียบร้อยแล้ว',
                            icon: 'success',
                            confirmButtonText: 'ตกลง',
                        });
                        fetchPromotions(); // Refresh the list
                    } else {
                        Swal.fire({
                            title: 'เกิดข้อผิดพลาด',
                            text: data.message || 'ไม่สามารถลบโปรโมชั่นได้',
                            icon: 'error',
                            confirmButtonText: 'ตกลง',
                        });
                    }
                } catch (error) {
                    console.error('Error deleting promotion:', error);
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด',
                        text: 'เกิดข้อผิดพลาดในการลบโปรโมชั่น กรุณาลองใหม่อีกครั้ง',
                        icon: 'error',
                        confirmButtonText: 'ตกลง',
                    });
                }
            }
        });
    };

    const getDiscountDisplay = (promotion: Promotion) => {
        switch (promotion.promotion_type) {
            case 'percentage':
                return `${promotion.discount_value}%`;
            case 'fixed_amount':
                return formatCurrency(promotion.discount_value);
            case 'buy_one_get_one':
                return 'ซื้อ 1 แถม 1';
            case 'free_item':
                return `แถมฟรี (ซื้อ ${promotion.buy_quantity || 1})`;
            case 'points_multiplier':
                return `x${promotion.points_multiplier} แต้ม`;
            default:
                return promotion.discount_value.toString();
        }
    };

    const isPromotionActive = (promotion: Promotion) => {
        if (!promotion.is_active) return false;

        const now = new Date();
        const startDate = new Date(promotion.start_date);
        const endDate = new Date(promotion.end_date);

        if (now < startDate) return false;
        if (now > endDate) return false;
        if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) return false;

        return true;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="โปรโมชั่นทั้งหมด" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">โปรโมชั่นทั้งหมด</h1>
                        <p className="text-muted-foreground">จัดการโปรโมชั่นในระบบ</p>
                    </div>
                    <Button asChild>
                        <Link href="/promotions/create">
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มโปรโมชั่นใหม่
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ค้นหาและกรอง</CardTitle>
                        <CardDescription>
                            ค้นหาโปรโมชั่นตามชื่อหรือประเภท
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="ค้นหาโปรโมชั่น..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="ประเภทโปรโมชั่น" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทุกประเภท</SelectItem>
                                    <SelectItem value="percentage">ส่วนลดเปอร์เซ็นต์</SelectItem>
                                    <SelectItem value="fixed_amount">ส่วนลดคงที่</SelectItem>
                                    <SelectItem value="buy_one_get_one">ซื้อ 1 แถม 1</SelectItem>
                                    <SelectItem value="free_item">แถมฟรี</SelectItem>
                                    <SelectItem value="points_multiplier">คูณแต้ม</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="สถานะ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทุกสถานะ</SelectItem>
                                    <SelectItem value="true">ใช้งานอยู่</SelectItem>
                                    <SelectItem value="false">ไม่ใช้งาน</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : promotions.length === 0 ? (
                            <div className="text-center py-12">
                                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">ไม่พบโปรโมชั่นในระบบ</h3>
                                <p className="text-muted-foreground mt-2">
                                    {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                                        ? 'ลองปรับเงื่อนไขการค้นหาหรือกรอง'
                                        : 'เริ่มต้นโดยการเพิ่มโปรโมชั่นใหม่'}
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href="/promotions/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        เพิ่มโปรโมชั่นใหม่
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4 font-medium">โปรโมชั่น</th>
                                            <th className="text-left p-4 font-medium">ประเภท</th>
                                            <th className="text-left p-4 font-medium">ส่วนลด</th>
                                            <th className="text-left p-4 font-medium">วันที่</th>
                                            <th className="text-left p-4 font-medium">สถานะ</th>
                                            <th className="text-left p-4 font-medium">การใช้งาน</th>
                                            <th className="text-left p-4 font-medium">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {promotions.map((promotion) => (
                                            <tr key={promotion.id} className="border-b hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div>
                                                        <div className="font-medium">{promotion.name}</div>
                                                        {promotion.description && (
                                                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                                                                {promotion.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={`text-xs ${getPromotionTypeColor(promotion.promotion_type)}`}>
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {getPromotionTypeLabel(promotion.promotion_type)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium">{getDiscountDisplay(promotion)}</div>
                                                    {promotion.min_order_amount && (
                                                        <div className="text-sm text-muted-foreground">
                                                            ขั้นต่ำ {formatCurrency(promotion.min_order_amount)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={isPromotionActive(promotion) ? 'default' : 'secondary'}>
                                                        {isPromotionActive(promotion) ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <TrendingUp className="h-3 w-3" />
                                                            {promotion.usage_count}
                                                            {promotion.usage_limit && ` / ${promotion.usage_limit}`}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/promotions/${promotion.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/promotions/${promotion.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(promotion.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
