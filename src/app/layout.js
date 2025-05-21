import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "JobNext Admin - Quản lý hệ thống tuyển dụng",
    description: "Trang quản lý hệ thống tuyển dụng JobNext",
};
import SideBar from "@/components/sideBar/SideBar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ToastProvider>
                    <SideBar />
                    <main className="flex-1 lg:ml-64">
                        <div className="flex h-16 items-center border-b bg-white shadow-sm px-4 lg:px-8">
                            <div className="ml-auto flex items-center gap-4">
                                <Button variant="outline" size="sm" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                                    <User className="h-4 w-4" />
                                    <span>Admin</span>
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 lg:p-8">{children}</div>
                    </main>
                </ToastProvider>
            </body>
        </html>
    );
}
