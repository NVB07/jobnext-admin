"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, FileText, LayoutDashboard, LogOut, Menu, Settings, User, PieChart, Building2 } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Quản lý người dùng",
        href: "/users",
        icon: User,
    },
    {
        title: "Quản lý công việc",
        href: "/jobs",
        icon: Briefcase,
        subItems: [
            {
                title: "Danh sách công việc",
                href: "/jobs",
                icon: Briefcase,
            },
            {
                title: "Công việc theo ngành nghề",
                href: "/jobs/categories",
                icon: PieChart,
            },
            {
                title: "Công việc theo công ty",
                href: "/companies",
                icon: Building2,
            },
        ],
    },
    {
        title: "Quản lý CV mẫu",
        href: "/cv",
        icon: FileText,
    },
    {
        title: "Cài đặt",
        href: "/settings",
        icon: Settings,
    },
];

export default function SideBar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [expandedItems, setExpandedItems] = useState([]);
    const pathname = usePathname();

    const toggleExpand = (index) => {
        if (expandedItems.includes(index)) {
            setExpandedItems(expandedItems.filter((item) => item !== index));
        } else {
            setExpandedItems([...expandedItems, index]);
        }
    };

    const renderNavItems = (items, isSubmenu = false) => {
        return items.map((item, index) => (
            <li key={isSubmenu ? `sub-${item.href}` : item.href}>
                {item.subItems ? (
                    <div className="space-y-1">
                        <button
                            onClick={() => toggleExpand(index)}
                            className={cn(
                                "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                pathname === item.href || pathname.startsWith(item.href + "/")
                                    ? "bg-blue-800/50 text-white"
                                    : "text-blue-200 hover:bg-blue-800/30 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-purple-300" : "text-blue-400")} />
                                {item.title}
                            </div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={cn("h-4 w-4 transition-transform", expandedItems.includes(index) ? "rotate-180" : "")}
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        {expandedItems.includes(index) && <ul className="ml-6 space-y-1 mt-1">{renderNavItems(item.subItems, true)}</ul>}
                    </div>
                ) : (
                    <Link
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                            pathname === item.href ? "bg-blue-800/50 text-white" : "text-blue-200 hover:bg-blue-800/30 hover:text-white"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-purple-300" : "text-blue-400")} />
                        {item.title}
                    </Link>
                )}
            </li>
        ));
    };

    return (
        <div>
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-10 hidden w-64 flex-col bg-gradient-to-b from-blue-900 to-indigo-900 transition-all duration-300 lg:flex",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center border-b border-blue-800 px-4">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
                        <BarChart3 className="h-6 w-6 text-blue-300" />
                        <span className="text-xl">Admin Portal</span>
                    </Link>
                </div>
                <nav className="flex-1 overflow-auto p-3">
                    <ul className="space-y-1.5">{renderNavItems(navItems)}</ul>
                </nav>
                <div className="border-t border-blue-800 p-4">
                    <Link
                        href="/login"
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-blue-800/30"
                    >
                        <LogOut className="h-5 w-5" />
                        Đăng xuất
                    </Link>
                </div>
            </aside>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="fixed left-4 top-3 z-40 lg:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-gradient-to-b from-blue-900 to-indigo-900 border-r-0">
                    <div className="flex h-16 items-center border-b border-blue-800 px-4">
                        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
                            <BarChart3 className="h-6 w-6 text-blue-300" />
                            <span className="text-xl">Admin Portal</span>
                        </Link>
                    </div>
                    <nav className="flex-1 overflow-auto p-3">
                        <ul className="space-y-1.5">{renderNavItems(navItems)}</ul>
                    </nav>
                    <div className="border-t border-blue-800 p-4">
                        <Link
                            href="/login"
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-blue-800/30"
                        >
                            <LogOut className="h-5 w-5" />
                            Đăng xuất
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
