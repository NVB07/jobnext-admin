"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const CVUpdateHeader = () => {
    const { admin, logout } = useAuth();
    const router = useRouter();

    const handleBackToAdmin = () => {
        router.push("/cv");
    };

    return (
        <div className="flex h-16 items-center justify-between border-b bg-white shadow-sm px-4 lg:px-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleBackToAdmin} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại Admin
                </Button>
                <h1 className="text-lg font-semibold text-gray-900">Trình quản lý CV</h1>
            </div>

            {admin && (
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 cursor-default text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{admin.email}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={logout} className="gap-2 cursor-pointer bg-red-500 text-white hover:bg-red-600 hover:text-white">
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất</span>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CVUpdateHeader;
