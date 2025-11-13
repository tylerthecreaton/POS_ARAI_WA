import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Folder } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
    products_count: number;
    created_at: string;
    updated_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
    },
    {
        title: 'หมวดหมู่สินค้า',
        href: '/categories',
    },
];

export default function CategoriesIndex() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories', {
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
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?')) {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const response = await fetch(`/api/categories/${id}`, {
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
                    fetchCategories(); // Refresh the list
                } else {
                    alert(data.message || 'ไม่สามารถลบหมวดหมู่ได้');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('เกิดข้อผิดพลาดในการลบหมวดหมู่');
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="หมวดหมู่สินค้า" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">หมวดหมู่สินค้า</h1>
                        <p className="text-muted-foreground">จัดการหมวดหมู่สินค้าในระบบ</p>
                    </div>
                    <Button asChild>
                        <Link href="/categories/create">
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มหมวดหมู่ใหม่
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>รายการหมวดหมู่สินค้า</CardTitle>
                        <CardDescription>
                            จัดการหมวดหมู่สินค้าทั้งหมดในระบบ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-12">
                                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">ยังไม่มีหมวดหมู่ในระบบ</h3>
                                <p className="text-muted-foreground mt-2">
                                    เริ่มต้นโดยการเพิ่มหมวดหมู่ใหม่
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href="/categories/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        เพิ่มหมวดหมู่ใหม่
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4 font-medium">ชื่อหมวดหมู่</th>
                                            <th className="text-left p-4 font-medium">รายละเอียด</th>
                                            <th className="text-left p-4 font-medium">สถานะ</th>
                                            <th className="text-left p-4 font-medium">จำนวนสินค้า</th>
                                            <th className="text-left p-4 font-medium">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category) => (
                                            <tr key={category.id} className="border-b hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="font-medium">{category.name}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                                                        {category.description || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                                        {category.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">{category.products_count} รายการ</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={`/categories/${category.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(category.id)}
                                                            disabled={category.products_count > 0}
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
