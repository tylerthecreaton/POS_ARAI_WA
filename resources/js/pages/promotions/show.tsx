import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Calendar, TrendingUp, Tag, Package, Users, BarChart3 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface Product {
    id: number;
    name: string;
    price: number;
}

interface Category {
    id: number;
    name: string;
}

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
    applicable_products?: Product[];
    applicable_categories?: Category[];
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    promotion: Promotion;
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
    {
        title: 'รายละเอียดโปรโมชั่น',
        href: `/promotions/${usePage().props.id}`,
    },
];

export default function PromotionsShow({ promotion }: ShowProps) {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [promotion.id]);

    const fetchAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
            const response = await fetch(`/api/promotions/${promotion.id}/analytics`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAnalytics(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoadingAnalytics(false);
        }
    };

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

    const getDiscountDisplay = (promotion: Promotion) => {
        switch (promotion.promotion_type) {
            case 'percentage':
                return `${promotion.discount_value}%`;
            case 'fixed_amount':
                return new Intl.NumberFormat('th-TH', {
                    style: 'currency',
                    currency: 'THB',
                }).format(promotion.discount_value);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
        }).format(amount);
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

    const handleDelete = async () => {
        Swal.fire({
            title: 'ยืนยันการลบโปรโมชั่น',
            text: `คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชั่น "${promotion.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`,
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
                    const response = await fetch(`/api/promotions/${promotion.id}`, {
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
                        }).then(() => {
                            window.location.href = '/promotions';
                        });
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`รายละเอียดโปรโมชั่น: ${promotion.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{promotion.name}</h1>
                        <p className="text-muted-foreground">รายละเอียดข้อมูลโปรโมชั่น</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={`/promotions/${promotion.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                แก้ไข
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            ลบ
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/promotions">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                กลับรายการ
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tag className="h-5 w-5" />
                                    ข้อมูลโปรโมชั่น
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">ชื่อโปรโมชั่น</p>
                                        <p className="font-medium">{promotion.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">ประเภท</p>
                                        <Badge className={`text-xs ${getPromotionTypeColor(promotion.promotion_type)}`}>
                                            {getPromotionTypeLabel(promotion.promotion_type)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">ส่วนลด</p>
                                        <p className="font-medium">{getDiscountDisplay(promotion)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">สถานะ</p>
                                        <Badge variant={isPromotionActive(promotion) ? 'default' : 'secondary'}>
                                            {isPromotionActive(promotion) ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}
                                        </Badge>
                                    </div>
                                </div>

                                {promotion.description && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">รายละเอียด</p>
                                        <p className="text-sm">{promotion.description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">วันที่เริ่มต้น</p>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(promotion.start_date)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">วันที่สิ้นสุด</p>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(promotion.end_date)}
                                        </div>
                                    </div>
                                </div>

                                {(promotion.min_order_amount || promotion.max_discount_amount || promotion.usage_limit) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {promotion.min_order_amount && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">ยอดซื้อขั้นต่ำ</p>
                                                <p className="font-medium">{formatCurrency(promotion.min_order_amount)}</p>
                                            </div>
                                        )}
                                        {promotion.max_discount_amount && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">ส่วนลดสูงสุด</p>
                                                <p className="font-medium">{formatCurrency(promotion.max_discount_amount)}</p>
                                            </div>
                                        )}
                                        {promotion.usage_limit && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">จำกัดครั้งที่ใช้ได้</p>
                                                <p className="font-medium">{promotion.usage_limit} ครั้ง</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">จำนวนครั้งที่ใช้ไป</p>
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            <span className="font-medium">{promotion.usage_count}</span>
                                            {promotion.usage_limit && (
                                                <span className="text-muted-foreground"> / {promotion.usage_limit}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">สร้างเมื่อ</p>
                                        <p className="font-medium">{formatDate(promotion.created_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    สินค้าและหมวดหมู่ที่ใช้ได้
                                </CardTitle>
                                <CardDescription>
                                    สินค้าและหมวดหมู่ที่สามารถใช้โปรโมชั่นนี้ได้
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {promotion.applicable_products && promotion.applicable_products.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">สินค้าที่เลือก ({promotion.applicable_products.length} รายการ)</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                                {promotion.applicable_products.map((product) => (
                                                    <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                                                        <div>
                                                            <p className="font-medium text-sm">{product.name}</p>
                                                            <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            {product.name}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {promotion.applicable_categories && promotion.applicable_categories.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">หมวดหมู่ที่เลือก ({promotion.applicable_categories.length} รายการ)</p>
                                            <div className="flex flex-wrap gap-2">
                                                {promotion.applicable_categories.map((category) => (
                                                    <Badge key={category.id} variant="secondary" className="text-xs">
                                                        {category.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(!promotion.applicable_products || promotion.applicable_products.length === 0) &&
                                     (!promotion.applicable_categories || promotion.applicable_categories.length === 0) && (
                                        <p className="text-sm text-muted-foreground">
                                            โปรโมชั่นนี้สามารถใช้กับทุกสินค้าและหมวดหมู่ในระบบ
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {loadingAnalytics ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <p className="ml-2 text-muted-foreground">กำลังโหลดข้อมูลวิเคราะห์...</p>
                                </CardContent>
                            </Card>
                        ) : analytics ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        สถิติการใช้งาน
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-4 border rounded">
                                            <p className="text-sm font-medium text-muted-foreground">ยอดส่วนลดทั้งหมด</p>
                                            <p className="text-2xl font-bold text-primary">
                                                {formatCurrency(analytics.total_discount || 0)}
                                            </p>
                                        </div>
                                        <div className="p-4 border rounded">
                                            <p className="text-sm font-medium text-muted-foreground">จำนวนคำสั่งซื้อที่ใช้โปรโมชั่น</p>
                                            <p className="text-2xl font-bold text-primary">
                                                {analytics.orders_count || 0} คำสั่งซื้อ
                                            </p>
                                        </div>
                                        <div className="p-4 border rounded">
                                            <p className="text-sm font-medium text-muted-foreground">ยอดเงินที่ประหยัดได้</p>
                                            <p className="text-2xl font-bold text-primary">
                                                {formatCurrency(analytics.total_savings || 0)}
                                            </p>
                                        </div>
                                        <div className="p-4 border rounded">
                                            <p className="text-sm font-medium text-muted-foreground">อัตราการความนิยม</p>
                                            <div className="flex items-center gap-2">
                                                <div className="text-center">
                                                    <p className="text-sm text-muted-foreground">เฉลี่</p>
                                                    <p className="text-lg font-bold text-green-600">
                                                        {Math.round((analytics.orders_count || 0) * 100 / (analytics.total_orders || 1))}%
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-muted-foreground">ปานกลาง</p>
                                                    <p className="text-lg font-bold text-orange-600">
                                                        {Math.round((analytics.orders_count || 0) * 100 / (analytics.total_orders || 1))}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-muted-foreground mb-2">ประสิทภาพระหวด</p>
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span>วันที่มีการใช้งานสูงสุด:</span>
                                                <span className="font-medium">{analytics.peak_usage_date || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>จำนวนการใช้งานเฉลี่ย:</span>
                                                <span className="font-medium">{analytics.daily_avg_usage || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>ยอดเฉลี่ยที่ลูกค้าใช้:</span>
                                                <span className="font-medium">{formatCurrency(analytics.avg_order_value || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">ไม่สามารถแสดงสถิติ</h3>
                                    <p className="text-muted-foreground">
                                        ไม่สามารถโหลดข้อมูลสถิติการใช้งานของโปรโมชั่นนี้ได้ในขณะนี้
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
