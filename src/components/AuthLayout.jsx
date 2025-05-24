"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import SideBar from "@/components/sideBar/SideBar";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const AuthLayout = ({ children }) => {
    const { isAuthenticated, admin, logout, loading } = useAuth();
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Login page - no sidebar, no protection
    if (isLoginPage) {
        return children;
    }

    // Protected pages - require authentication
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
                <SideBar />
                <main className="flex-1 lg:ml-64">
                    {/* Header */}
                    <div className="flex h-16 items-center border-b bg-white shadow-sm px-4 lg:px-8">
                        <div className="ml-auto flex items-center gap-4">
                            {admin && (
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="sm" className="gap-2 cursor-default  text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                                        <User className="h-4 w-4" />

                                        <span className="font-medium">{admin.email}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={logout}
                                        className="gap-2 cursor-pointer bg-red-500 text-white hover:bg-red-600 hover:text-white"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Đăng xuất</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="p-4 lg:p-8">{children}</div>
                </main>
            </div>
        </ProtectedRoute>
    );
};

export default AuthLayout;
