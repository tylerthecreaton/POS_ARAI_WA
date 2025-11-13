import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
    },
    {
        title: 'ลูกค้าทั้งหมด',
        href: '/customers',
    },
    {
        title: 'เพิ่มลูกค้าใหม่',
        href: '/customers/create',
    },
];

export default function CustomerCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        birth_date: '',
        membership_tier: 'bronze',
        points: 0,
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customers', {
            onSuccess: () => {
                Swal.fire({
                    title: 'เพิ่มลูกค้าสำเร็จ!',
                    text: 'ข้อมูลลูกค้าใหม่ถูกบันทึกเรียบร้อยแล้ว',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'ตกลง'
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด!',
                    text: 'ไม่สามารถบันทึกข้อมูลลูกค้าได้ กรุณาตรวจสอบข้อมูลอีกครั้ง',
                    icon: 'error',
                    confirmButtonColor: '#ef4444',
                    confirmButtonText: 'ตกลง'
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="เพิ่มลูกค้าใหม่" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">เพิ่มลูกค้าใหม่</h1>
                        <p className="text-muted-foreground">กรอกข้อมูลลูกค้าใหม่ในระบบ</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/customers">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            กลับ
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลลูกค้า</CardTitle>
                        <CardDescription>
                            กรอกข้อมูลพื้นฐานของลูกค้า
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">ชื่อลูกค้า *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="กรอกชื่อลูกค้า"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="กรอกเบอร์โทรศัพท์"
                                        required
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">อีเมล</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="กรอกอีเมล (ถ้ามี)"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">วันเกิด</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                    />
                                    {errors.birth_date && (
                                        <p className="text-sm text-red-600">{errors.birth_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">ที่อยู่</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('address', e.target.value)}
                                    placeholder="กรอกที่อยู่ของลูกค้า"
                                    rows={3}
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-600">{errors.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="membership_tier">ระดับสมาชิก</Label>
                                    <Select
                                        value={data.membership_tier}
                                        onValueChange={(value) => setData('membership_tier', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกระดับสมาชิก" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bronze">Bronze (เบรนซ์)</SelectItem>
                                            <SelectItem value="silver">Silver (ซิลเวอร์)</SelectItem>
                                            <SelectItem value="gold">Gold (โกลด์)</SelectItem>
                                            <SelectItem value="platinum">Platinum (แพลตินัม)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.membership_tier && (
                                        <p className="text-sm text-red-600">{errors.membership_tier}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="points">แต้มสะสม</Label>
                                    <Input
                                        id="points"
                                        type="number"
                                        min="0"
                                        value={data.points}
                                        onChange={(e) => setData('points', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    {errors.points && (
                                        <p className="text-sm text-red-600">{errors.points}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                                    placeholder="กรอกบันทึกเพิ่มเติมเกี่ยวกับลูกค้า"
                                    rows={3}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/customers">ยกเลิก</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    บันทึกข้อมูล
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
