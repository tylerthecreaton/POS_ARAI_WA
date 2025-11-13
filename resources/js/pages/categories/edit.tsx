import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
}

interface FormData {
    name: string;
    description: string;
    is_active: boolean;
}

interface Props {
    id: string;
}

export default function CategoriesEdit({ id }: Props) {
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        is_active: true,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'แดชบอร์ด',
            href: '/dashboard',
        },
        {
            title: 'หมวดหมู่สินค้า',
            href: '/categories',
        },
        {
            title: category?.name || 'แก้ไขหมวดหมู่',
            href: `/categories/${id}/edit`,
        },
    ];

    useEffect(() => {
        fetchCategory();
    }, [id]);

    const fetchCategory = async () => {
        try {
            const response = await fetch(`/api/categories/${id}`, {
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
                const cat = data.data;
                setCategory(cat);
                setFormData({
                    name: cat.name || '',
                    description: cat.description || '',
                    is_active: cat.is_active,
                });
            }
        } catch (error) {
            console.error('Error fetching category:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrors(errorData.errors);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                router.visit('/categories');
            }
        } catch (error) {
            console.error('Error updating category:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const updateFormData = (key: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="แก้ไขหมวดหมู่" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!category) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="ไม่พบหมวดหมู่" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium">ไม่พบหมวดหมู่</h3>
                        <p className="text-muted-foreground mt-2">ไม่พบหมวดหมู่ที่คุณกำลังค้นหา</p>
                        <Button className="mt-4" asChild>
                            <Link href="/categories">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                กลับไปหน้ารายการหมวดหมู่
                            </Link>
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`แก้ไข ${category.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/categories">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                กลับ
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">แก้ไขหมวดหมู่</h1>
                            <p className="text-muted-foreground">แก้ไขข้อมูลหมวดหมู่: {category.name}</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลหมวดหมู่</CardTitle>
                        <CardDescription>
                            แก้ไขข้อมูลหมวดหมู่ในระบบ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">ชื่อหมวดหมู่ *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateFormData('name', e.target.value)}
                                    placeholder="กรอกชื่อหมวดหมู่"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">รายละเอียด</Label>
                                <textarea
                                    id="description"
                                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.description}
                                    onChange={(e) => updateFormData('description', e.target.value)}
                                    placeholder="กรอกรายละเอียดหมวดหมู่..."
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => updateFormData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active">สถานะการใช้งาน</Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/categories">ยกเลิก</Link>
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
