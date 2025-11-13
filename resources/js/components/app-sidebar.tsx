import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    ShoppingCart,
    Package,
    Users,
    ClipboardList,
    TrendingUp,
    Settings,
    ChefHat,
    Tag,
    Truck,
    FileText,
    PlusCircle
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'แดชบอร์ด',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const salesNavItems: NavItem[] = [
    {
        title: 'สร้างออเดอร์',
        href: '/orders/create',
        icon: PlusCircle,
    },
    {
        title: 'รายการออเดอร์',
        href: '/orders',
        icon: ClipboardList,
    },
];

const productNavItems: NavItem[] = [
    {
        title: 'สินค้าทั้งหมด',
        href: '/products',
        icon: Package,
    },
    {
        title: 'หมวดหมู่',
        href: '/categories',
        icon: Tag,
    },
];

const inventoryNavItems: NavItem[] = [
    {
        title: 'สต็อกวัตถุดิบ',
        href: '/inventory',
        icon: Truck,
    },
    {
        title: 'จัดการวัตถุดิบ',
        href: '/ingredients',
        icon: Package,
    },
    {
        title: 'บันทึกสต็อก',
        href: '/inventory/transactions',
        icon: ChefHat,
    },
];

const customerNavItems: NavItem[] = [
    {
        title: 'ลูกค้าทั้งหมด',
        href: '/customers',
        icon: Users,
    },
];

const reportNavItems: NavItem[] = [
    {
        title: 'รายงานขาย',
        href: '/reports/sales',
        icon: FileText,
    },
    {
        title: 'รายงานสต็อก',
        href: '/reports/inventory',
        icon: TrendingUp,
    },
];

const settingsNavItems: NavItem[] = [
    {
        title: 'ผู้ใช้งาน',
        href: '/settings/users',
        icon: Users,
    },
    {
        title: 'โปรโมชั่น',
        href: '/promotions',
        icon: Tag,
    },
    {
        title: 'การตั้งค่า',
        href: '/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                <SidebarGroup>
                    <SidebarGroupLabel>การขาย</SidebarGroupLabel>
                    <SidebarMenu>
                        {salesNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>สินค้า</SidebarGroupLabel>
                    <SidebarMenu>
                        {productNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>สต็อก</SidebarGroupLabel>
                    <SidebarMenu>
                        {inventoryNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>ลูกค้า</SidebarGroupLabel>
                    <SidebarMenu>
                        {customerNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>รายงาน</SidebarGroupLabel>
                    <SidebarMenu>
                        {reportNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>การตั้งค่า</SidebarGroupLabel>
                    <SidebarMenu>
                        {settingsNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
