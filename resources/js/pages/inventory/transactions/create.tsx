import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Package, TrendingUp, TrendingDown, Settings } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    current_stock: number;
    min_stock: number;
    cost_per_unit: number;
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
        title: 'บันทึกสต็อก',
        href: '/inventory/transactions/create',
    },
];

const transactionTypes = [
    { value: 'in', label: 'นำเข้า', icon: TrendingUp, description: 'เพิ่มสต็อกวัตถุดิบ' },
    { value: 'out', label: 'นำออก', icon: TrendingDown, description: 'ลดสต็อกวัตถุดิบ' },
    { value: 'adjustment', label: 'ปรับปรุง', icon: Settings, description: 'ตั้งค่าสต็อกเป็นค่าที่กำหนด' },
];

export default function StockTransactionCreate() {
    const pageProps = usePage().props as any;
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedIngredientId = urlParams.get('ingredient_id');

    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        ingredient_id: preselectedIngredientId || '',
        transaction_type: 'in',
        quantity: '',
        unit_cost: '',
        notes: '',
    });

    useEffect(() => {
        // Fetch ingredients for dropdown
        fetch('/api/ingredients')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setIngredients(data.data);

                    // If preselected ingredient, set it
                    if (preselectedIngredientId) {
                        const ingredient = data.data.find((ing: Ingredient) => ing.id.toString() === preselectedIngredientId);
                        if (ingredient) {
                            setSelectedIngredient(ingredient);
                            setData('unit_cost', ingredient.cost_per_unit.toString());
                        }
                    }
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching ingredients:', error);
                setLoading(false);
            });
    }, [preselectedIngredientId]);

    const handleIngredientChange = (ingredientId: string) => {
        const ingredient = ingredients.find(ing => ing.id.toString() === ingredientId);
        setSelectedIngredient(ingredient || null);
        setData('ingredient_id', ingredientId);

        if (ingredient) {
            setData('unit_cost', ingredient.cost_per_unit.toString());
        }
    };

    const handleTransactionTypeChange = (type: string) => {
        setData('transaction_type', type);

        // Clear quantity when changing transaction type to avoid confusion
        setData('quantity', '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/inventory/transactions', {
            onSuccess: () => {
                reset();
                setSelectedIngredient(null);
            },
        });
    };

    const getTransactionTypeInfo = (type: string) => {
        return transactionTypes.find(t => t.value === type) || transactionTypes[0];
    };

    const currentTransactionType = getTransactionTypeInfo(data.transaction_type);
    const TransactionIcon = currentTransactionType.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="บันทึกสต็อก" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/inventory/transactions">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            กลับ
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">บันทึกสต็อก</h1>
                        <p className="text-muted-foreground">บันทึกการเคลื่อนไหวของวัตถุดิบในระบบ</p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>ข้อมูลการเคลื่อนไหว</CardTitle>
                        <CardDescription>
                            กรอกข้อมูลการนำเข้า นำออก หรือปรับปรุงสต็อกวัตถุดิบ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="ingredient_id">วัตถุดิบ *</Label>
                                <Select
                                    value={data.ingredient_id}
                                    onValueChange={handleIngredientChange}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกวัตถุดิบ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ingredients.map((ingredient) => (
                                            <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{ingredient.name}</span>
                                                    <span className="text-sm text-muted-foreground ml-2">
                                                        {ingredient.current_stock} {ingredient.unit}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.ingredient_id && (
                                    <p className="text-sm text-red-600">{errors.ingredient_id}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="transaction_type">ประเภทการเคลื่อนไหว *</Label>
                                    <Select
                                        value={data.transaction_type}
                                        onValueChange={handleTransactionTypeChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกประเภท" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transactionTypes.map((type) => {
                                                const Icon = type.icon;
                                                return (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="h-4 w-4" />
                                                            <div>
                                                                <div>{type.label}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {type.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {errors.transaction_type && (
                                        <p className="text-sm text-red-600">{errors.transaction_type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">
                                        ปริมาณ *
                                        {selectedIngredient && (
                                            <span className="text-sm text-muted-foreground ml-1">
                                                ({selectedIngredient.unit})
                                            </span>
                                        )}
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.quantity && (
                                        <p className="text-sm text-red-600">{errors.quantity}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_cost">ราคาต่อหน่วย</Label>
                                    <Input
                                        id="unit_cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.unit_cost}
                                        onChange={(e) => setData('unit_cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.unit_cost && (
                                        <p className="text-sm text-red-600">{errors.unit_cost}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">หมายเหตุ</Label>
                                <Input
                                    id="notes"
                                    type="text"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="เช่น สั่งซื้อจากผู้ขาย A, ใช้ในการผลิตสินค้า B"
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>

                            {selectedIngredient && (
                                <Card className="bg-muted/30">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package className="h-4 w-4" />
                                            <h4 className="font-medium">ข้อมูลวัตถุดิบปัจจุบัน</h4>
                                        </div>
                                        <div className="grid gap-2 text-sm">
                                            <div>สต็อกปัจจุบัน: <span className="font-medium">{selectedIngredient.current_stock} {selectedIngredient.unit}</span></div>
                                            <div>สต็อกขั้นต่ำ: <span className="font-medium">{selectedIngredient.min_stock} {selectedIngredient.unit}</span></div>
                                            {data.transaction_type === 'out' && (
                                                <div className="text-amber-600">
                                                    หมายเหตุ: สต็อกคงเหลือหลังการนำออกจะเป็น {Math.max(0, selectedIngredient.current_stock - parseFloat(data.quantity || '0'))} {selectedIngredient.unit}
                                                </div>
                                            )}
                                            {data.transaction_type === 'adjustment' && (
                                                <div className="text-blue-600">
                                                    หมายเหตุ: สต็อกจะถูกตั้งค่าเป็น {data.quantity || '0'} {selectedIngredient.unit}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing || !data.ingredient_id}>
                                    <TransactionIcon className="h-4 w-4 mr-2" />
                                    {processing ? 'กำลังบันทึก...' : `บันทึก${currentTransactionType.label}`}
                                </Button>
                                <Button asChild variant="outline" type="button">
                                    <Link href="/inventory/transactions">ยกเลิก</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
