import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search, Truck, AlertTriangle } from 'lucide-react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
    },
    {
        title: 'สต็อกวัตถุดิบ',
        href: '/inventory',
    },
];

export default function InventoryIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="สต็อกวัตถุดิบ" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">สต็อกวัตถุดิบ</h1>
                        <p className="text-muted-foreground">จัดการวัตถุดิบและสต็อกในระบบ</p>
                    </div>
                    <Button asChild>
                        <Link href="/inventory/transactions/create">
                            <Plus className="h-4 w-4 mr-2" />
                            บันทึกสต็อก
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">วัตถุดิบทั้งหมด</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">48</div>
                            <p className="text-xs text-muted-foreground">รายการ</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">วัตถุดิบใกล้หมด</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">5</div>
                            <p className="text-xs text-muted-foreground">รายการ</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">วัตถุดิบหมด</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">2</div>
                            <p className="text-xs text-muted-foreground">รายการ</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ค้นหาและกรอง</CardTitle>
                        <CardDescription>
                            ค้นหาวัตถุดิบตามชื่อ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาวัตถุดิบ..."
                                    className="pl-8 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                กรอง
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="text-center py-12">
                            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">ยังไม่มีวัตถุดิบในระบบ</h3>
                            <p className="text-muted-foreground mt-2">
                                เริ่มต้นโดยการเพิ่มวัตถุดิบใหม่
                            </p>
                            <div className="flex gap-2 justify-center mt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/inventory/transactions">
                                        ดูประวัติการเคลื่อนไหว
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/inventory/transactions/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        บันทึกสต็อก
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
