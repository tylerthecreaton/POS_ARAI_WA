import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    cost?: number;
    image_url?: string;
    is_active: boolean;
    is_available: boolean;
    sku?: string;
    barcode?: string;
    category: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    id: string;
}

export default function ProductsShow({ id }: Props) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'แดชบอร์ด',
            href: '/dashboard',
        },
        {
            title: 'สินค้าทั้งหมด',
            href: '/products',
        },
        {
            title: product?.name || 'รายละเอียดสินค้า',
            href: `/products/${id}`,
        },
    ];

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${id}`, {
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
            console.log('Product data from API:', data.data);
            if (data.success) {
                setProduct(data.data);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const response = await fetch(`/api/products/${id}`, {
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
                    router.visit('/products');
                } else {
                    alert(data.message || 'ไม่สามารถลบสินค้าได้');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('เกิดข้อผิดพลาดในการลบสินค้า');
            }
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="รายละเอียดสินค้า" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!product) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="ไม่พบสินค้า" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium">ไม่พบสินค้า</h3>
                        <p className="text-muted-foreground mt-2">ไม่พบสินค้าที่คุณกำลังค้นหา</p>
                        <Button className="mt-4" asChild>
                            <Link href="/products">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                กลับไปหน้ารายการสินค้า
                            </Link>
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/products">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                กลับ
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{product.name}</h1>
                            <p className="text-muted-foreground">รายละเอียดสินค้า</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                แก้ไข
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            ลบ
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Image Section */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>รูปภาพสินค้า</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {product.image_url && !imageError ? (
                                    <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden">
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                console.error('Image failed to load:', product.image_url);
                                                console.error('Error event:', e);
                                                setImageError(true);
                                            }}
                                            onLoad={(e) => {
                                                console.log('Image loaded successfully:', product.image_url);
                                                console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-64 lg:h-80 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                                        <svg
                                            className="w-16 h-16 text-gray-400 mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <p className="text-gray-500 text-sm">ไม่มีรูปภาพสินค้า</p>
                                        {imageError && product.image_url && (
                                            <p className="text-xs text-red-500 mt-2">ไม่สามารถโหลดรูปภาพได้</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>สถานะ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">สถานะการใช้งาน</span>
                                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                        {product.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">สถานะการขาย</span>
                                    <Badge variant={product.is_available ? 'default' : 'secondary'}>
                                        {product.is_available ? 'พร้อมขาย' : 'ไม่พร้อมขาย'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Product Details Section */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>ข้อมูลสินค้า</CardTitle>
                                <CardDescription>รายละเอียดข้อมูลสินค้า</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">ชื่อสินค้า</p>
                                        <p className="text-lg font-semibold">{product.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">หมวดหมู่</p>
                                        <Badge variant="outline" className="text-sm">{product.category.name}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">ราคาขาย</p>
                                        <p className="text-lg font-semibold text-green-600">฿{Number(product.price).toFixed(2)}</p>
                                    </div>
                                    {product.cost && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">ต้นทุน</p>
                                            <p className="text-lg font-medium text-orange-600">฿{Number(product.cost).toFixed(2)}</p>
                                        </div>
                                    )}
                                    {product.sku && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">SKU</p>
                                            <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded">{product.sku}</p>
                                        </div>
                                    )}
                                    {product.barcode && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Barcode</p>
                                            <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded">{product.barcode}</p>
                                        </div>
                                    )}
                                </div>

                                {product.description && (
                                    <div className="border-t pt-4">
                                        <p className="text-sm font-medium text-muted-foreground mb-2">รายละเอียด</p>
                                        <p className="text-base leading-relaxed bg-gray-50 p-4 rounded-lg">{product.description}</p>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">ข้อมูลเพิ่มเติม</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">สร้างเมื่อ:</span>
                                            <p className="font-medium">{new Date(product.created_at).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">อัพเดทล่าสุด:</span>
                                            <p className="font-medium">{new Date(product.updated_at).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
