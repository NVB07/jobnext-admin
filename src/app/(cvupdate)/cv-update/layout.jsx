// "use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const inter = Inter({ subsets: ["latin"] });

// import AuthContextProvider from "@/context/AuthContextProvider";

export const metadata = {
    title: "JobNext Admin | Trình quản lý CV",
    description: "Trình quản lý CV cho hệ thống JobNext",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function CVUpdateLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} antialiased w-full`}>
                <ToastProvider>
                    <AuthProvider>
                        <ProtectedRoute>{children}</ProtectedRoute>
                    </AuthProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
