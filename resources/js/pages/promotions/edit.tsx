import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, Plus, X, Tag, Calculator } from 'lucide-react';
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
}

interface EditProps {
    promotion: Promotion;
    products?: Product[];
    categories?: Category[];
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
        title: 'แก้ไขโปรโมชั่น',
        href: '/promotions/edit',
    },
];

export default function PromotionsEdit({ promotion, products = [], categories = [] }: EditProps) {
    const [formData, setFormData] = useState({
        name: promotion.name || '',
        description: promotion.description || '',
        promotion_type: promotion.promotion_type || 'percentage' as 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_item' | 'points_multiplier',
        discount_value: promotion.discount_value?.toString() || '',
        min_order_amount: promotion.min_order_amount?.toString() || '',
        max_discount_amount: promotion.max_discount_amount?.toString() || '',
        start_date: promotion.start_date ? new Date(promotion.start_date).toISOString().slice(0, 16) : '',
        end_date: promotion.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : '',
        is_active: promotion.is_active ?? true,
        usage_limit: promotion.usage_limit?.toString() || '',
        usage_count: promotion.usage_count || 0,
        required_points: promotion.required_points?.toString() || '',
        points_multiplier: promotion.points_multiplier?.toString() || '',
        free_product_id: promotion.free_product_id?.toString() || '',
        buy_quantity: promotion.buy_quantity?.toString() || '',
        get_quantity: promotion.get_quantity?.toString() || '',
        applicable_product_ids: promotion.applicable_products?.map(p => p.id) || [],
        applicable_category_ids: promotion.applicable_categories?.map(c => c.id) || [],
    });

    const [showPreview, setShowPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const promotionTypes = [
        { value: 'percentage', label: 'ส่วนลดเปอร์เซ็นต์', icon: '%' },
        { value: 'fixed_amount', label: 'ส่วนลดคงที่', icon: '฿' },
        { value: 'buy_one_get_one', label: 'ซื้อ 1 แถม 1', icon: '1+1' },
        { value: 'free_item', label: 'แถมฟรี', icon: '🎁' },
        { value: 'points_multiplier', label: 'คูณแต้ม', icon: 'x' },
    ];

    useEffect(() => {
        // Load products and categories if not provided
        if (products.length === 0 || categories.length === 0) {
            fetchInitialData();
        }
    }, []);

    const fetchInitialData = async () => {
        try {
            const [productsResponse, categoriesResponse] = await Promise.all([
                fetch('/api/products/active', {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                }),
                fetch('/api/categories/active', {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                }),
            ]);

            if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                if (productsData.success) {
                    // Update products in form data
                }
            }

            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                if (categoriesData.success) {
                    // Update categories in form data
                }
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleProductToggle = (productId: number) => {
        setFormData(prev => ({
            ...prev,
            applicable_product_ids: prev.applicable_product_ids.includes(productId)
                ? prev.applicable_product_ids.filter(id => id !== productId)
                : [...prev.applicable_product_ids, productId]
        }));
    };

    const handleCategoryToggle = (categoryId: number) => {
        setFormData(prev => ({
            ...prev,
            applicable_category_ids: prev.applicable_category_ids.includes(categoryId)
                ? prev.applicable_category_ids.filter(id => id !== categoryId)
                : [...prev.applicable_category_ids, categoryId]
        }));
    };

    const calculatePreview = () => {
        return {
            type: formData.promotion_type,
            discount: formData.discount_value,
            minOrder: formData.min_order_amount,
            maxDiscount: formData.max_discount_amount,
            applicableProducts: formData.applicable_product_ids.length,
            applicableCategories: formData.applicable_category_ids.length,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const submitData = {
                ...formData,
                discount_value: parseFloat(formData.discount_value) || 0,
                min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                required_points: formData.required_points ? parseInt(formData.required_points) : null,
                points_multiplier: formData.points_multiplier ? parseFloat(formData.points_multiplier) : null,
                free_product_id: formData.free_product_id ? parseInt(formData.free_product_id) : null,
                buy_quantity: formData.buy_quantity ? parseInt(formData.buy_quantity) : null,
                get_quantity: formData.get_quantity ? parseInt(formData.get_quantity) : null,
            };

            router.put(`/promotions/${promotion.id}`, submitData, {
                onSuccess: () => {
                    Swal.fire({
                        title: 'สำเร็จ!',
                        text: 'อัปเดตโปรโมชั่นเรียบร้อยแล้ว',
                        icon: 'success',
                        confirmButtonText: 'ตกลง',
                    });
                },
                onError: (errors) => {
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด',
                        text: 'ไม่สามารถอัปเดตโปรโมชั่นได้ กรุณาตรวจสอบข้อมูล',
                        icon: 'error',
                        confirmButtonText: 'ตกลง',
                    });
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error updating promotion:', error);
            setIsSubmitting(false);
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'เกิดข้อผิดพลาดในการอัปเดตโปรโมชั่น กรุณาลองใหม่อีกครั้ง',
                icon: 'error',
                confirmButtonText: 'ตกลง',
            });
        }
    };

    const getPromotionTypeFields = () => {
        switch (formData.promotion_type) {
            case 'percentage':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="discount_value">ส่วนลด (%)</Label>
                                <Input
                                    id="discount_value"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="10"
                                    value={formData.discount_value}
                                    onChange={(e) => handleInputChange('discount_value', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="max_discount_amount">ส่วนลดสูงสุด (บาท)</Label>
                                <Input
                                    id="max_discount_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="100"
                                    value={formData.max_discount_amount}
                                    onChange={(e) => handleInputChange('max_discount_amount', e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                );
            case 'fixed_amount':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="discount_value">ส่วนลด (บาท)</Label>
                            <Input
                                id="discount_value"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="100"
                                value={formData.discount_value}
                                onChange={(e) => handleInputChange('discount_value', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="min_order_amount">ยอดซื้อขั้นต่ำ (บาท)</Label>
                            <Input
                                id="min_order_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="500"
                                value={formData.min_order_amount}
                                onChange={(e) => handleInputChange('min_order_amount', e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 'buy_one_get_one':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="buy_quantity">ซื้อ (ชิ้น)</Label>
                            <Input
                                id="buy_quantity"
                                type="number"
                                min="1"
                                placeholder="1"
                                value={formData.buy_quantity}
                                onChange={(e) => handleInputChange('buy_quantity', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="get_quantity">แถม (ชิ้น)</Label>
                            <Input
                                id="get_quantity"
                                type="number"
                                min="1"
                                placeholder="1"
                                value={formData.get_quantity}
                                onChange={(e) => handleInputChange('get_quantity', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                );
            case 'free_item':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="buy_quantity">ซื้อ (ชิ้น)</Label>
                            <Input
                                id="buy_quantity"
                                type="number"
                                min="1"
                                placeholder="2"
                                value={formData.buy_quantity}
                                onChange={(e) => handleInputChange('buy_quantity', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="free_product_id">สินค้าแถม</Label>
                            <Select value={formData.free_product_id} onValueChange={(value) => handleInputChange('free_product_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกสินค้าแถม" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                            {product.name} (฿{product.price})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 'points_multiplier':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="points_multiplier">คูณแต้ม (เท่า)</Label>
                            <Input
                                id="points_multiplier"
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="2"
                                value={formData.points_multiplier}
                                onChange={(e) => handleInputChange('points_multiplier', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="required_points">แต้มขั้นต่ำ</Label>
                            <Input
                                id="required_points"
                                type="number"
                                min="0"
                                placeholder="100"
                                value={formData.required_points}
                                onChange={(e) => handleInputChange('required_points', e.target.value)}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="แก้ไขโปรโมชั่น" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">แก้ไขโปรโมชั่น</h1>
                        <p className="text-muted-foreground">แก้ไขข้อมูลโปรโมชั่น: {promotion.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            ดูตัวอย่าง
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/promotions">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                กลับ
                            </Link>
                        </Button>
                    </div>
                </div>

                {showPreview && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                ตัวอย่างโปรโมชั่น
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">ประเภท:</p>
                                    <Badge>{promotionTypes.find(t => t.value === formData.promotion_type)?.label}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">ชื่อ:</p>
                                    <p className="text-sm">{formData.name || 'ยังไม่ได้ระบุ'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">สินค้าที่เลือก:</p>
                                    <p className="text-sm">{formData.applicable_product_ids.length} รายการ</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">หมวดหมู่ที่เลือก:</p>
                                    <p className="text-sm">{formData.applicable_category_ids.length} รายการ</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
                                    <CardDescription>ข้อมูลทั่วไปของโปรโมชั่น</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">ชื่อโปรโมชั่น</Label>
                                        <Input
                                            id="name"
                                            placeholder="โปรโมชั่นลดราคา 10%"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">รายละเอียด</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="รายละเอียดโปรโมชั่น..."
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="promotion_type">ประเภทโปรโมชั่น</Label>
                                        <Select value={formData.promotion_type} onValueChange={(value: any) => handleInputChange('promotion_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกประเภทโปรโมชั่น" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {promotionTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{type.icon}</span>
                                                            {type.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>เงื่อนไขโปรโมชั่น</CardTitle>
                                    <CardDescription>กำหนดเงื่อนไขและค่าของโปรโมชั่น</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {getPromotionTypeFields()}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="start_date">วันที่เริ่มต้น</Label>
                                            <Input
                                                id="start_date"
                                                type="datetime-local"
                                                value={formData.start_date}
                                                onChange={(e) => handleInputChange('start_date', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="end_date">วันที่สิ้นสุด</Label>
                                            <Input
                                                id="end_date"
                                                type="datetime-local"
                                                value={formData.end_date}
                                                onChange={(e) => handleInputChange('end_date', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="usage_limit">จำนวนครั้งที่ใช้ได้</Label>
                                            <Input
                                                id="usage_limit"
                                                type="number"
                                                min="1"
                                                placeholder="100"
                                                value={formData.usage_limit}
                                                onChange={(e) => handleInputChange('usage_limit', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_active"
                                                checked={formData.is_active}
                                                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                                            />
                                            <Label htmlFor="is_active">เปิดใช้งานทันที</Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>สินค้าที่ใช้ได้</CardTitle>
                                    <CardDescription>เลือกสินค้าที่สามารถใช้โปรโมชั่นนี้ได้</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {products.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">ไม่มีสินค้าในระบบ</p>
                                        ) : (
                                            products.map((product) => (
                                                <div key={product.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`product-${product.id}`}
                                                        checked={formData.applicable_product_ids.includes(product.id)}
                                                        onCheckedChange={() => handleProductToggle(product.id)}
                                                    />
                                                    <Label htmlFor={`product-${product.id}`} className="text-sm">
                                                        {product.name} (฿{product.price})
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>หมวดหมู่ที่ใช้ได้</CardTitle>
                                    <CardDescription>เลือกหมวดหมู่ที่สามารถใช้โปรโมชั่นนี้ได้</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {categories.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">ไม่มีหมวดหมู่ในระบบ</p>
                                        ) : (
                                            categories.map((category) => (
                                                <div key={category.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`category-${category.id}`}
                                                        checked={formData.applicable_category_ids.includes(category.id)}
                                                        onCheckedChange={() => handleCategoryToggle(category.id)}
                                                    />
                                                    <Label htmlFor={`category-${category.id}`} className="text-sm">
                                                        {category.name}
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/promotions">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                ยกเลิก
                            </Link>
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
