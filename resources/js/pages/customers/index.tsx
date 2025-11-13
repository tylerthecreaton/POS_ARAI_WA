import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search, Users } from 'lucide-react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
    },
    {
        title: 'ลูกค้าทั้งหมด',
        href: '/customers',
    },
];

export default function CustomersIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ลูกค้าทั้งหมด" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">ลูกค้าทั้งหมด</h1>
                        <p className="text-muted-foreground">จัดการข้อมูลลูกค้าในระบบ</p>
                    </div>
                    <Button asChild>
                        <Link href="/customers/create">
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มลูกค้าใหม่
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ค้นหาและกรอง</CardTitle>
                        <CardDescription>
                            ค้นหาลูกค้าตามชื่อหรือเบอร์โทรศัพท์
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาลูกค้า..."
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
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">ยังไม่มีลูกค้าในระบบ</h3>
                            <p className="text-muted-foreground mt-2">
                                เริ่มต้นโดยการเพิ่มลูกค้าใหม่
                            </p>
                            <Button className="mt-4" asChild>
                                <Link href="/customers/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    เพิ่มลูกค้าใหม่
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
