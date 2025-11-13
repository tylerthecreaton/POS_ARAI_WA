import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter, Search, Package, Edit, Trash2, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    is_available: boolean;
    category: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface Category {
    id: number;
    name: string;
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
];

export default function ProductsIndex() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedCategory]);

    const fetchProducts = async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedCategory && selectedCategory !== 'all') params.append('category_id', selectedCategory);

            const response = await fetch(`/api/products?${params.toString()}`, {
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
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

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

            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleDelete = async (id: number) => {
        Swal.fire({
            title: 'ยืนยันการลบสินค้า',
            text: 'คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบสินค้า',
            cancelButtonText: 'ยกเลิก',
        }).then(async (result) => {
            if (result.isConfirmed) {
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
                        Swal.fire({
                            title: 'สำเร็จ!',
                            text: 'ลบสินค้าเรียบร้อยแล้ว',
                            icon: 'success',
                            confirmButtonText: 'ตกลง',
                        });
                        fetchProducts(); // Refresh the list
                    } else {
                        Swal.fire({
                            title: 'เกิดข้อผิดพลาด',
                            text: data.message || 'ไม่สามารถลบสินค้าได้',
                            icon: 'error',
                            confirmButtonText: 'ตกลง',
                        });
                    }
                } catch (error) {
                    console.error('Error deleting product:', error);
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด',
                        text: 'เกิดข้อผิดพลาดในการลบสินค้า กรุณาลองใหม่อีกครั้ง',
                        icon: 'error',
                        confirmButtonText: 'ตกลง',
                    });
                }
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="สินค้าทั้งหมด" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">สินค้าทั้งหมด</h1>
                        <p className="text-muted-foreground">จัดการสินค้าในระบบ</p>
                    </div>
                    <Button asChild>
                        <Link href="/products/create">
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มสินค้าใหม่
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ค้นหาและกรอง</CardTitle>
                        <CardDescription>
                            ค้นหาสินค้าตามชื่อหรือหมวดหมู่
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="ค้นหาสินค้า..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
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
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">ไม่พบสินค้าในระบบ</h3>
                                <p className="text-muted-foreground mt-2">
                                    {searchTerm || selectedCategory
                                        ? 'ลองปรับเงื่อนไขการค้นหาหรือกรอง'
                                        : 'เริ่มต้นโดยการเพิ่มสินค้าใหม่'}
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href="/products/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        เพิ่มสินค้าใหม่
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4 font-medium">สินค้า</th>
                                            <th className="text-left p-4 font-medium">หมวดหมู่</th>
                                            <th className="text-left p-4 font-medium">ราคา</th>
                                            <th className="text-left p-4 font-medium">สถานะ</th>
                                            <th className="text-left p-4 font-medium">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id} className="border-b hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {product.image_url && (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="w-10 h-10 rounded object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-medium">{product.name}</div>
                                                            {product.description && (
                                                                <div className="text-sm text-muted-foreground max-w-xs truncate">
                                                                    {product.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline">{product.category.name}</Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium">฿{Number(product.price).toFixed(2)}</div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={product.is_available ? 'default' : 'secondary'}>
                                                        {product.is_available ? 'พร้อมขาย' : 'ไม่พร้อมขาย'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/products/${product.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/products/${product.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(product.id)}
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
