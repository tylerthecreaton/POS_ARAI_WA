import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect } from 'react';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    current_stock: number;
    min_stock: number;
    cost_per_unit: number;
}

interface PageProps {
    ingredient: Ingredient;
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
    {
        title: 'แก้ไขวัตถุดิบ',
        href: '',
    },
];

export default function IngredientEdit({ id }: { id: string }) {
    const pageProps = usePage().props as any;
    const ingredient = pageProps.ingredient as Ingredient;

    const { data, setData, put, processing, errors, reset } = useForm({
        name: ingredient.name || '',
        unit: ingredient.unit || '',
        current_stock: ingredient.current_stock?.toString() || '',
        min_stock: ingredient.min_stock?.toString() || '',
        cost_per_unit: ingredient.cost_per_unit?.toString() || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/ingredients/${id}`, {
            onSuccess: () => {
                // Success message is handled by the backend redirect
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="แก้ไขวัตถุดิบ" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/ingredients">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            กลับ
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">แก้ไขวัตถุดิบ</h1>
                        <p className="text-muted-foreground">แก้ไขข้อมูลวัตถุดิบในระบบ</p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>ข้อมูลวัตถุดิบ</CardTitle>
                        <CardDescription>
                            แก้ไขข้อมูลพื้นฐานของวัตถุดิบ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">ชื่อวัตถุดิบ *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="เช่น น้ำตาลทราย"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit">หน่วยนับ *</Label>
                                    <Input
                                        id="unit"
                                        type="text"
                                        value={data.unit}
                                        onChange={(e) => setData('unit', e.target.value)}
                                        placeholder="เช่น กิโลกรัม, ขวด, ถุง"
                                        required
                                    />
                                    {errors.unit && (
                                        <p className="text-sm text-red-600">{errors.unit}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="current_stock">สต็อกปัจจุบัน *</Label>
                                    <Input
                                        id="current_stock"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.current_stock}
                                        onChange={(e) => setData('current_stock', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.current_stock && (
                                        <p className="text-sm text-red-600">{errors.current_stock}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="min_stock">สต็อกขั้นต่ำ *</Label>
                                    <Input
                                        id="min_stock"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.min_stock}
                                        onChange={(e) => setData('min_stock', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.min_stock && (
                                        <p className="text-sm text-red-600">{errors.min_stock}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cost_per_unit">ราคาต่อหน่วย *</Label>
                                <Input
                                    id="cost_per_unit"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.cost_per_unit}
                                    onChange={(e) => setData('cost_per_unit', e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                                {errors.cost_per_unit && (
                                    <p className="text-sm text-red-600">{errors.cost_per_unit}</p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                </Button>
                                <Button asChild variant="outline" type="button">
                                    <Link href="/ingredients">ยกเลิก</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
                        <CardDescription>
                            คำแนะนำเกี่ยวกับการแก้ไขข้อมูล
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-medium">การแก้ไขสต็อก</h4>
                            <p className="text-sm text-muted-foreground">
                                หากต้องการบันทึกการเคลื่อนไหวของสต็อก (นำเข้า/ออก)
                                ควรใช้หน้า "บันทึกสต็อก" แทนการแก้ไขสต็อกปัจจุบันโดยตรง
                                เพื่อให้มีบันทึกประวัติการเคลื่อนไหวที่สมบูรณ์
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium">ผลกระทบ</h4>
                            <p className="text-sm text-muted-foreground">
                                การแก้ไขข้อมูลวัตถุดิบจะมีผลต่อการคำนวณต้นทุนในอนาคต
                                แต่จะไม่มีผลต่อประวัติการทำรายการที่เกิดขึ้นแล้ว
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
