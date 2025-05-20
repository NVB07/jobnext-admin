"use client";

import { useState, useEffect } from "react";
import { Download, FileText, MoreHorizontal, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchCvTemplates } from "@/lib/api";

export default function CVTemplate() {
    const [templates, setTemplates] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                setLoading(true);
                const data = await fetchCvTemplates();
                console.log("CV Templates data:", data);
                setTemplates(data.templates || []);
            } catch (error) {
                console.error("Error loading CV templates:", error);
            } finally {
                setLoading(false);
            }
        };

        loadTemplates();
    }, []);

    // Filter templates based on search term
    const filteredTemplates = templates.filter((template) => {
        const searchLower = searchTerm.toLowerCase();
        return (template.name || "").toLowerCase().includes(searchLower);
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý CV mẫu</h1>
                <p className="text-muted-foreground">Quản lý tất cả các mẫu CV trong hệ thống</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Tìm kiếm mẫu CV..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" className="h-9 gap-1">
                        <Plus className="h-4 w-4" />
                        Thêm mẫu CV mới
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tên mẫu</TableHead>
                            <TableHead>Xem trước</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : filteredTemplates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Không tìm thấy mẫu CV nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTemplates.map((template, index) => (
                                <TableRow key={template._id || index}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            {template.name || "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {template.preview ? (
                                            <a href={template.preview} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">
                                                Xem trước
                                            </a>
                                        ) : (
                                            "Không có"
                                        )}
                                    </TableCell>
                                    <TableCell>{template.createdAt ? new Date(template.createdAt).toLocaleDateString("vi-VN") : "N/A"}</TableCell>
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
                                                <DropdownMenuItem className="text-red-600">Xóa mẫu CV</DropdownMenuItem>
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
                <Button variant="outline" size="sm">
                    Sau
                </Button>
            </div>
        </div>
    );
}
