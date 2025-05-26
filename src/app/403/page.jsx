"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Home } from "lucide-react";

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <Shield className="h-24 w-24 text-red-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Truy cập bị từ chối</h2>
                    <p className="text-gray-600 mb-8">Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với tài khoản admin để tiếp tục.</p>
                </div>

                <div className="space-y-4">
                    <Button onClick={() => router.push("/login")} className="w-full gap-2">
                        <Home className="h-4 w-4" />
                        Đăng nhập Admin
                    </Button>

                    <Button variant="outline" onClick={() => router.back()} className="w-full gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                </div>
            </div>
        </div>
    );
}
