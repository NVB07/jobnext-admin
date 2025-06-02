"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import MDView from "@/components/MDView";
import { Plus, Edit, Trash2, Search, Eye, BarChart3, FileText, Calendar, Tag, Loader2 } from "lucide-react";

const BlogPage = () => {
    const router = useRouter();
    const toast = useToast();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlogs, setSelectedBlogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [stats, setStats] = useState(null);

    // Fetch blogs
    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/blogs?page=${currentPage}&perPage=${perPage}&search=${searchQuery}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setBlogs(data.data);
                setTotalPages(data.pagination.totalPages);
                setTotalBlogs(data.pagination.totalBlogs);
            } else {
                toast.error("Lỗi khi tải danh sách blog");
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/blogs/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Delete blog
    const handleDeleteBlog = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/blogs/${selectedBlog._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success("Xóa blog thành công");
                setIsDeleteDialogOpen(false);
                setSelectedBlog(null);
                fetchBlogs();
            } else {
                const error = await response.json();
                toast.error(error.message || "Lỗi khi xóa blog");
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            toast.error("Lỗi kết nối server");
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/blogs/bulk`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ blogIds: selectedBlogs }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.message);
                setIsBulkDeleteDialogOpen(false);
                setSelectedBlogs([]);
                fetchBlogs();
            } else {
                const error = await response.json();
                toast.error(error.message || "Lỗi khi xóa blog");
            }
        } catch (error) {
            console.error("Error bulk deleting blogs:", error);
            toast.error("Lỗi kết nối server");
        }
    };

    // Effects
    useEffect(() => {
        fetchBlogs();
    }, [currentPage, perPage, searchQuery]);

    useEffect(() => {
        if (isStatsModalOpen) {
            fetchStats();
        }
    }, [isStatsModalOpen]);

    // Open view modal
    const openViewModal = (blog) => {
        setSelectedBlog(blog);
        setIsViewModalOpen(true);
    };

    // Open delete dialog
    const openDeleteDialog = (blog) => {
        setSelectedBlog(blog);
        setIsDeleteDialogOpen(true);
    };

    // Navigate to create page
    const handleCreateBlog = () => {
        router.push("/blog/create");
    };

    // Navigate to edit page
    const handleEditBlog = (blogId) => {
        router.push(`/blog/edit/${blogId}`);
    };

    // Handle checkbox change
    const handleCheckboxChange = (blogId, checked) => {
        if (checked) {
            setSelectedBlogs((prev) => [...prev, blogId]);
        } else {
            setSelectedBlogs((prev) => prev.filter((id) => id !== blogId));
        }
    };

    // Select all blogs
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedBlogs(blogs.map((blog) => blog._id));
        } else {
            setSelectedBlogs([]);
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Blog</h1>
                    <p className="text-muted-foreground">Tổng cộng {totalBlogs} blog</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsStatsModalOpen(true)} variant="outline">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Thống kê
                    </Button>
                    <Button onClick={handleCreateBlog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo Blog
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="search">Tìm kiếm</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Tìm theo tiêu đề hoặc tag..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="perPage">Hiển thị</Label>
                            <Select value={perPage.toString()} onValueChange={(value) => setPerPage(parseInt(value))}>
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedBlogs.length > 0 && (
                            <Button variant="destructive" onClick={() => setIsBulkDeleteDialogOpen(true)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa ({selectedBlogs.length})
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Blog Table */}
            <Card>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox checked={selectedBlogs.length === blogs.length && blogs.length > 0} onCheckedChange={handleSelectAll} />
                                    </TableHead>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead>Tác giả</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blogs.map((blog) => (
                                    <TableRow key={blog._id}>
                                        <TableCell>
                                            <Checkbox checked={selectedBlogs.includes(blog._id)} onCheckedChange={(checked) => handleCheckboxChange(blog._id, checked)} />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="max-w-xs truncate">{blog.title}</div>
                                        </TableCell>
                                        <TableCell>{blog.authorUid}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {blog.tags?.slice(0, 2).map((tag, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {blog.tags?.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{blog.tags.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(blog.createdAt).toLocaleDateString("vi-VN")}</TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="ghost" onClick={() => openViewModal(blog)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleEditBlog(blog._id)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(blog)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-6">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                                Trước
                            </Button>
                            <span className="text-sm">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Blog Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi Tiết Blog</DialogTitle>
                    </DialogHeader>
                    {selectedBlog && (
                        <div className="space-y-4">
                            <div>
                                <Label>Tiêu đề</Label>
                                <p className="text-lg font-medium">{selectedBlog.title}</p>
                            </div>
                            <div>
                                <Label>Tác giả</Label>
                                <p>{selectedBlog.authorUid}</p>
                            </div>
                            <div>
                                <Label>Tags</Label>
                                <div className="flex gap-2 flex-wrap mt-1">
                                    {selectedBlog.tags?.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label>Ngày tạo</Label>
                                <p>{new Date(selectedBlog.createdAt).toLocaleString("vi-VN")}</p>
                            </div>

                            <div>
                                <Label>Nội dung</Label>
                                <div className="mt-2 p-4 border rounded-lg max-h-96 overflow-y-auto prose max-w-none">
                                    <MDView content={selectedBlog.content} />
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Statistics Modal */}
            <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Thống Kê Blog</DialogTitle>
                    </DialogHeader>
                    {stats && (
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Tổng Blog
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalBlogs}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Blog 30 ngày qua
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.recentBlogs}</div>
                                </CardContent>
                            </Card>
                            <Card className="col-span-2">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center">
                                        <Tag className="w-4 h-4 mr-2" />
                                        Top Tags
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {stats.tagStats?.slice(0, 5).map((tag, index) => (
                                            <div key={index} className="flex justify-between">
                                                <span>{tag._id}</span>
                                                <Badge variant="outline">{tag.count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>Bạn có chắc chắn muốn xóa blog "{selectedBlog?.title}"? Hành động này không thể hoàn tác.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBlog}>Xóa</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>Bạn có chắc chắn muốn xóa {selectedBlogs.length} blog đã chọn? Hành động này không thể hoàn tác.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete}>Xóa</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BlogPage;
