import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Eye, Trash2, Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    current_stock: number;
    min_stock: number;
    cost_per_unit: number;
    is_low_stock: boolean;
    last_transaction?: {
        date: string;
        type: string;
        quantity: number;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: Ingredient[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    links: PaginationLink[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
    },
    {
        title: 'สต็อกวัตถุดิบ',
        href: '/inventory',
    },
    {
        title: 'จัดการวัตถุดิบ',
        href: '/ingredients',
    },
];

export default function IngredientsIndex() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [pagination, setPagination] = useState<PaginatedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, low_stock, out_of_stock

    const fetchIngredients = (page = 1, search = '', filterType = 'all') => {
        setLoading(true);
        let url = `/api/ingredients`;

        // Apply client-side filtering since the API doesn't support these filters yet
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    let filteredIngredients = data.data;

                    // Apply filters
                    if (filterType === 'low_stock') {
                        filteredIngredients = filteredIngredients.filter((item: Ingredient) =>
                            item.is_low_stock && item.current_stock > 0
                        );
                    } else if (filterType === 'out_of_stock') {
                        filteredIngredients = filteredIngredients.filter((item: Ingredient) =>
                            item.current_stock === 0
                        );
                    }

                    // Apply search filter
                    if (search) {
                        filteredIngredients = filteredIngredients.filter((item: Ingredient) =>
                            item.name.toLowerCase().includes(search.toLowerCase())
                        );
                    }

                    // Create a mock pagination object for compatibility
                    const mockPagination: PaginatedData = {
                        data: filteredIngredients,
                        current_page: 1,
                        from: 1,
                        last_page: 1,
                        per_page: filteredIngredients.length,
                        to: filteredIngredients.length,
                        total: filteredIngredients.length,
                        links: []
                    };

                    setIngredients(filteredIngredients);
                    setPagination(mockPagination);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching ingredients:', error);
                setLoading(false);
                // Set empty array on error to prevent undefined errors
                setIngredients([]);
                setPagination(null);
            });
    };

    useEffect(() => {
        fetchIngredients(1, searchTerm, filter);
    }, [searchTerm, filter]);

    const handleDelete = (id: number) => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบวัตถุดิบนี้?')) {
            router.delete(`/ingredients/${id}`, {
                onSuccess: () => {
                    fetchIngredients(1, searchTerm, filter);
                }
            });
        }
    };

    const getStockStatus = (ingredient: Ingredient) => {
        if (ingredient.current_stock === 0) {
            return { label: 'หมด', color: 'destructive', icon: TrendingDown };
        } else if (ingredient.is_low_stock) {
            return { label: 'ใกล้หมด', color: 'secondary', icon: AlertTriangle };
        }
        return { label: 'ปกติ', color: 'default', icon: Package };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="จัดการวัตถุดิบ" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">จัดการวัตถุดิบ</h1>
                        <p className="text-muted-foreground">เพิ่ม แก้ไข และจัดการวัตถุดิบในระบบ</p>
                    </div>
                    <Button asChild>
                        <Link href="/ingredients/create">
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มวัตถุดิบ
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ค้นหาและกรอง</CardTitle>
                        <CardDescription>
                            ค้นหาวัตถุดิบตามชื่อหรือสถานะสต็อก
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="ค้นหาวัตถุดิบ..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={filter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setFilter('all')}
                                >
                                    ทั้งหมด
                                </Button>
                                <Button
                                    variant={filter === 'low_stock' ? 'default' : 'outline'}
                                    onClick={() => setFilter('low_stock')}
                                >
                                    ใกล้หมด
                                </Button>
                                <Button
                                    variant={filter === 'out_of_stock' ? 'default' : 'outline'}
                                    onClick={() => setFilter('out_of_stock')}
                                >
                                    หมด
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="text-muted-foreground mt-2">กำลังโหลด...</p>
                            </div>
                        ) : (!ingredients || ingredients.length === 0) ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">ไม่พบวัตถุดิบ</h3>
                                <p className="text-muted-foreground mt-2">
                                    {searchTerm || filter !== 'all'
                                        ? 'ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือการกรอง'
                                        : 'เริ่มต้นโดยการเพิ่มวัตถุดิบใหม่'}
                                </p>
                                {!searchTerm && filter === 'all' && (
                                    <Button asChild className="mt-4">
                                        <Link href="/ingredients/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            เพิ่มวัตถุดิบ
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4">ชื่อวัตถุดิบ</th>
                                            <th className="text-left p-4">สต็อกปัจจุบัน</th>
                                            <th className="text-left p-4">สต็อกขั้นต่ำ</th>
                                            <th className="text-left p-4">ราคา/หน่วย</th>
                                            <th className="text-left p-4">สถานะ</th>
                                            <th className="text-left p-4">การจัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ingredients.map((ingredient) => {
                                            const status = getStockStatus(ingredient);
                                            const StatusIcon = status.icon;

                                            return (
                                                <tr key={ingredient.id} className="border-b hover:bg-muted/50">
                                                    <td className="p-4">
                                                        <div className="font-medium">{ingredient.name}</div>
                                                        <div className="text-sm text-muted-foreground">หน่วย: {ingredient.unit}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`font-medium ${
                                                            ingredient.current_stock === 0 ? 'text-red-600' :
                                                            ingredient.is_low_stock ? 'text-amber-600' : ''
                                                        }`}>
                                                            {ingredient.current_stock}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">{ingredient.min_stock}</td>
                                                    <td className="p-4">฿{ingredient.cost_per_unit}</td>
                                                    <td className="p-4">
                                                        <Badge variant={status.color as any} className="flex items-center gap-1 w-fit">
                                                            <StatusIcon className="h-3 w-3" />
                                                            {status.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={`/ingredients/${ingredient.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={`/ingredients/${ingredient.id}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(ingredient.id)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
