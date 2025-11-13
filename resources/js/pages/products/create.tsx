import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import ImageUpload from '@/components/ui/image-upload';

interface Category {
    id: number;
    name: string;
    is_active: boolean;
}

interface FormData {
    name: string;
    description: string;
    category_id: string;
    price: string;
    cost: string;
    image_url: string;
    image: File | null;
    is_active: boolean;
    is_available: boolean;
    sku: string;
    barcode: string;
}

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
        title: 'เพิ่มสินค้าใหม่',
        href: '/products/create',
    },
];

export default function ProductsCreate() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '',
        description: '',
        category_id: '',
        price: '',
        cost: '',
        image_url: '',
        image: null,
        is_active: true,
        is_available: true,
        sku: '',
        barcode: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories/active', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        Swal.fire({
            title: 'ยืนยันการเพิ่มสินค้า',
            text: 'คุณต้องการเพิ่มสินค้านี้ในระบบหรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
        }).then((result) => {
            if (result.isConfirmed) {
                // Create FormData for file upload
                const formData = new FormData();
                formData.append('category_id', data.category_id);
                formData.append('name', data.name);
                formData.append('description', data.description);
                formData.append('price', data.price);
                formData.append('cost', data.cost);
                formData.append('image_url', data.image_url);
                if (data.image) {
                    formData.append('image', data.image);
                }
                formData.append('is_active', data.is_active ? '1' : '0');
                formData.append('is_available', data.is_available ? '1' : '0');
                formData.append('sku', data.sku);
                formData.append('barcode', data.barcode);

                // Use XMLHttpRequest for file upload
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/products');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Accept', 'application/json');

                xhr.onload = function() {
                    if (xhr.status === 200 || xhr.status === 201 || xhr.status === 302) {
                        // The storeWeb method returns a redirect, not JSON
                        // Check if the response is HTML (redirect page) or JSON
                        const contentType = xhr.getResponseHeader('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            // If it's JSON, parse it
                            try {
                                const response = JSON.parse(xhr.responseText);
                                if (response.success) {
                                    Swal.fire({
                                        title: 'สำเร็จ!',
                                        text: 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว',
                                        icon: 'success',
                                        confirmButtonText: 'ตกลง',
                                    }).then(() => {
                                        window.location.href = '/products';
                                    });
                                }
                            } catch (e) {
                                // JSON parsing failed, treat as success
                                Swal.fire({
                                    title: 'สำเร็จ!',
                                    text: 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว',
                                    icon: 'success',
                                    confirmButtonText: 'ตกลง',
                                }).then(() => {
                                    window.location.href = '/products';
                                });
                            }
                        } else {
                            // HTML response (redirect), treat as success
                            Swal.fire({
                                title: 'สำเร็จ!',
                                text: 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว',
                                icon: 'success',
                                confirmButtonText: 'ตกลง',
                            }).then(() => {
                                window.location.href = '/products';
                            });
                        }
                    } else {
                        Swal.fire({
                            title: 'เกิดข้อผิดพลาด',
                            text: 'ไม่สามารถเพิ่มสินค้าได้ กรุณาตรวจสอบข้อมูลอีกครั้ง',
                            icon: 'error',
                            confirmButtonText: 'ตกลง',
                        });
                    }
                };

                xhr.onerror = function() {
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด',
                        text: 'ไม่สามารถเพิ่มสินค้าได้ กรุณาตรวจสอบข้อมูลอีกครั้ง',
                        icon: 'error',
                        confirmButtonText: 'ตกลง',
                    });
                };

                // Add CSRF token
                const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (token) {
                    formData.append('_token', token);
                }

                xhr.send(formData);
            }
        });
    };

    const updateFormData = (key: keyof FormData, value: any) => {
        setData(key, value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="เพิ่มสินค้าใหม่" />
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
                            <h1 className="text-2xl font-bold">เพิ่มสินค้าใหม่</h1>
                            <p className="text-muted-foreground">เพิ่มสินค้าใหม่ในระบบ</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลสินค้า</CardTitle>
                        <CardDescription>
                            กรอกข้อมูลสินค้าใหม่ที่ต้องการเพิ่มในระบบ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">ชื่อสินค้า *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => updateFormData('name', e.target.value)}
                                        placeholder="กรอกชื่อสินค้า"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">หมวดหมู่ *</Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(value) => updateFormData('category_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกหมวดหมู่" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && (
                                        <p className="text-sm text-destructive">{errors.category_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">ราคาขาย *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => updateFormData('price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-destructive">{errors.price}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cost">ต้นทุน</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.cost}
                                        onChange={(e) => updateFormData('cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.cost && (
                                        <p className="text-sm text-destructive">{errors.cost}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        type="text"
                                        value={data.sku}
                                        onChange={(e) => updateFormData('sku', e.target.value)}
                                        placeholder="SKU"
                                    />
                                    {errors.sku && (
                                        <p className="text-sm text-destructive">{errors.sku}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="barcode">Barcode</Label>
                                    <Input
                                        id="barcode"
                                        type="text"
                                        value={data.barcode}
                                        onChange={(e) => updateFormData('barcode', e.target.value)}
                                        placeholder="Barcode"
                                    />
                                    {errors.barcode && (
                                        <p className="text-sm text-destructive">{errors.barcode}</p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="image_url">URL รูปภาพ</Label>
                                    <Input
                                        id="image_url"
                                        type="url"
                                        value={data.image_url}
                                        onChange={(e) => updateFormData('image_url', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {errors.image_url && (
                                        <p className="text-sm text-destructive">{errors.image_url}</p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <ImageUpload
                                        value={data.image ? URL.createObjectURL(data.image) : ''}
                                        onChange={(file) => updateFormData('image', file)}
                                    />
                                    {errors.image && (
                                        <p className="text-sm text-destructive">{errors.image}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">รายละเอียดสินค้า</Label>
                                <textarea
                                    id="description"
                                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.description}
                                    onChange={(e) => updateFormData('description', e.target.value)}
                                    placeholder="กรอกรายละเอียดสินค้า..."
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => updateFormData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active">สถานะการใช้งาน</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_available"
                                        checked={data.is_available}
                                        onCheckedChange={(checked) => updateFormData('is_available', checked as boolean)}
                                    />
                                    <Label htmlFor="is_available">สินค้าพร้อมขาย</Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/products">ยกเลิก</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
