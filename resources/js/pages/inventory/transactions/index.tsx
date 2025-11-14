import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Settings, Calendar, Package } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
}

interface StockTransaction {
    id: number;
    ingredient_id: number;
    ingredient: Ingredient;
    transaction_type: 'in' | 'out' | 'adjustment';
    quantity: number;
    unit_cost?: number;
    notes?: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: StockTransaction[];
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
        title: 'ประวัติการเคลื่อนไหว',
        href: '/inventory/transactions',
    },
];

const transactionTypes = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'in', label: 'นำเข้า' },
    { value: 'out', label: 'นำออก' },
    { value: 'adjustment', label: 'ปรับปรุง' },
];

export default function StockTransactionsIndex() {
    const [transactions, setTransactions] = useState<StockTransaction[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [pagination, setPagination] = useState<PaginatedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        ingredient_id: 'all',
        transaction_type: 'all',
        start_date: '',
        end_date: '',
    });

    const fetchTransactions = (page = 1) => {
        setLoading(true);
        let url = `/api/stock-transactions?page=${page}`;

        // Add filters to URL
        Object.entries(filters).forEach(([key, value]) => {
            if (!value) return;
            if (key === 'ingredient_id' && value === 'all') return;
            if (key === 'transaction_type' && value === 'all') return;
            url += `&${key}=${value}`;
        });

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setTransactions(data.data.data);
                    setPagination(data.data);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching transactions:', error);
                setLoading(false);
            });
    };

    const fetchIngredients = () => {
        fetch('/api/ingredients')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setIngredients(data.data);
                }
            })
            .catch(error => {
                console.error('Error fetching ingredients:', error);
            });
    };

    useEffect(() => {
        fetchTransactions();
        fetchIngredients();
    }, []);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            if (searchTerm) {
                // Filter transactions client-side for search
                const filtered = transactions.filter(transaction =>
                    transaction.ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                // Update display with filtered results
                if (pagination) {
                    setPagination({
                        ...pagination,
                        data: filtered,
                        total: filtered.length
                    });
                }
            } else {
                fetchTransactions();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
    };

    const applyFilters = () => {
        fetchTransactions(1);
    };

    const clearFilters = () => {
        setFilters({
            ingredient_id: 'all',
            transaction_type: 'all',
            start_date: '',
            end_date: '',
        });
        setSearchTerm('');
        fetchTransactions(1);
    };

    const getTransactionTypeInfo = (type: string) => {
        switch (type) {
            case 'in':
                return { label: 'นำเข้า', color: 'default' as const, icon: TrendingUp };
            case 'out':
                return { label: 'นำออก', color: 'secondary' as const, icon: TrendingDown };
            case 'adjustment':
                return { label: 'ปรับปรุง', color: 'outline' as const, icon: Settings };
            default:
                return { label: type, color: 'outline' as const, icon: Settings };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handlePageChange = (url: string) => {
        if (url) {
            const page = new URL(url).searchParams.get('page');
            fetchTransactions(page ? parseInt(page) : 1);
        }
    };

    const displayedTransactions = searchTerm ?
        transactions.filter(transaction =>
            transaction.ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()))
        ) : transactions;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ประวัติการเคลื่อนไหวสต็อก" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">ประวัติการเคลื่อนไหวสต็อก</h1>
                        <p className="text-muted-foreground">ดูประวัติการนำเข้า นำออก และปรับปรุงสต็อกวัตถุดิบ</p>
                    </div>
                    <Button asChild>
                        <Link href="/inventory/transactions/create">
                            <Plus className="h-4 w-4 mr-2" />
                            บันทึกสต็อก
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ค้นหาและกรอง</CardTitle>
                        <CardDescription>
                            ค้นหาและกรองประวัติการเคลื่อนไหวสต็อก
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="ค้นหาตามชื่อวัตถุดิบหรือหมายเหตุ..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ingredient_id">วัตถุดิบ</Label>
                                    <Select
                                        value={filters.ingredient_id}
                                        onValueChange={(value) => handleFilterChange('ingredient_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกวัตถุดิบ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ทั้งหมด</SelectItem>
                                            {ingredients.map((ingredient) => (
                                                <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                                                    {ingredient.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="transaction_type">ประเภท</Label>
                                    <Select
                                        value={filters.transaction_type}
                                        onValueChange={(value) => handleFilterChange('transaction_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกประเภท" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transactionTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">วันที่เริ่มต้น</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={filters.start_date}
                                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">วันที่สิ้นสุด</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={filters.end_date}
                                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={applyFilters}>
                                    <Filter className="h-4 w-4 mr-2" />
                                    กรอง
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    ล้างตัวกรอง
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
                        ) : displayedTransactions.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">ไม่พบประวัติการเคลื่อนไหว</h3>
                                <p className="text-muted-foreground mt-2">
                                    {searchTerm || Object.values(filters).some(v => v)
                                        ? 'ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือการกรอง'
                                        : 'ยังไม่มีการบันทึกการเคลื่อนไหวของสต็อก'}
                                </p>
                                {!searchTerm && !Object.values(filters).some(v => v) && (
                                    <Button asChild className="mt-4">
                                        <Link href="/inventory/transactions/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            บันทึกสต็อก
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4">วันที่เวลา</th>
                                            <th className="text-left p-4">วัตถุดิบ</th>
                                            <th className="text-left p-4">ประเภท</th>
                                            <th className="text-left p-4">ปริมาณ</th>
                                            <th className="text-left p-4">ราคา/หน่วย</th>
                                            <th className="text-left p-4">มูลค่ารวม</th>
                                            <th className="text-left p-4">หมายเหตุ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedTransactions.map((transaction) => {
                                            const typeInfo = getTransactionTypeInfo(transaction.transaction_type);
                                            const TypeIcon = typeInfo.icon;
                                            const totalValue = transaction.unit_cost ?
                                                transaction.quantity * transaction.unit_cost : 0;

                                            return (
                                                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            {formatDate(transaction.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-medium">
                                                        {transaction.ingredient.name}
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant={typeInfo.color} className="flex items-center gap-1 w-fit">
                                                            <TypeIcon className="h-3 w-3" />
                                                            {typeInfo.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 font-medium">
                                                        {transaction.quantity} {transaction.ingredient.unit}
                                                    </td>
                                                    <td className="p-4">
                                                        {transaction.unit_cost ? `฿${transaction.unit_cost}` : '-'}
                                                    </td>
                                                    <td className="p-4 font-medium">
                                                        {totalValue > 0 ? `฿${totalValue.toFixed(2)}` : '-'}
                                                    </td>
                                                    <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                                                        {transaction.notes || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {pagination && pagination.last_page > 1 && (
                            <div className="flex items-center justify-between p-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    แสดง {pagination.from} ถึง {pagination.to} จากทั้งหมด {pagination.total} รายการ
                                </div>
                                <div className="flex gap-1">
                                    {pagination.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && handlePageChange(link.url)}
                                            className="min-w-[40px]"
                                        >
                                            {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
