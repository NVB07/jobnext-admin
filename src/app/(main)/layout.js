import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthLayout from "@/components/AuthLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "JobNext Admin - Quản lý hệ thống tuyển dụng",
    description: "Trang quản lý hệ thống tuyển dụng JobNext",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ToastProvider>
                    <AuthProvider>
                        <AuthLayout>{children}</AuthLayout>
                    </AuthProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
