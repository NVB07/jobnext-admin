"use client";

import { useState, useEffect } from "react";
import { Download, MoreHorizontal, Search, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchUsers } from "@/lib/api";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                const data = await fetchUsers();
                console.log("Users data:", data);
                setUsers(data.users || []);
            } catch (error) {
                console.error("Error loading users:", error);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    // Filter users based on search term
    const filteredUsers = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (user._id || "").toLowerCase().includes(searchLower) ||
            (user.uid || "").toLowerCase().includes(searchLower) ||
            (user.userData?.profile?.Name || "").toLowerCase().includes(searchLower) ||
            (user.userData?.profile?.Email || "").toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                <p className="text-muted-foreground">Quản lý tất cả người dùng trong hệ thống</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Tìm kiếm người dùng..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" className="h-9 gap-1">
                        <UserPlus className="h-4 w-4" />
                        Thêm người dùng
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Số điện thoại</TableHead>
                            <TableHead>UID</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Không tìm thấy người dùng nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user, index) => (
                                <TableRow key={user._id || index}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{user.userData?.profile?.Name || "N/A"}</TableCell>
                                    <TableCell>{user.userData?.profile?.Email || "N/A"}</TableCell>
                                    <TableCell>{user.userData?.profile?.Phone_Number || "N/A"}</TableCell>
                                    <TableCell>{user.uid || "N/A"}</TableCell>
                                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Mở menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                                                <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Xóa người dùng</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" disabled>
                    Trước
                </Button>
                <Button variant="outline" size="sm" className="px-4 font-medium">
                    1
                </Button>
                <Button variant="outline" size="sm" className="px-4">
                    2
                </Button>
                <Button variant="outline" size="sm" className="px-4">
                    3
                </Button>
                <Button variant="outline" size="sm">
                    Sau
                </Button>
            </div>
        </div>
    );
}
