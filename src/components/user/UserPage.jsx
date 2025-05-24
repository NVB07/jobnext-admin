"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, MoreHorizontal, Search, UserPlus, Eye, Users, FileText, TrendingUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchUsers, fetchUserDetail, fetchUserStats, searchUsers, deleteUser } from "@/lib/api";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(20);
    const [userStats, setUserStats] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Load user stats on component mount
    useEffect(() => {
        const loadUserStats = async () => {
            try {
                const statsData = await fetchUserStats();
                if (statsData.success) {
                    setUserStats(statsData.stats);
                }
            } catch (error) {
                console.error("Error loading user stats:", error);
            }
        };
        loadUserStats();
    }, []);

    // Load users with pagination
    const loadUsers = useCallback(
        async (page = 1, searchQuery = searchTerm) => {
            try {
                setLoading(true);
                let data;

                // Check if we should use search API
                const hasSearchTerm = searchQuery.trim() !== "";

                if (hasSearchTerm) {
                    // Use search API
                    console.log("Using search API with:", { searchQuery });
                    data = await searchUsers({
                        search: searchQuery.trim(),
                        page,
                        perPage,
                    });
                } else {
                    // Use regular fetch API
                    console.log("Using regular fetch API");
                    data = await fetchUsers(page, perPage);
                }

                console.log("Users data:", data);
                setUsers(data.users || []);
                setPagination(data.pagination || {});
                setCurrentPage(page);
            } catch (error) {
                console.error("Error loading users:", error);
            } finally {
                setLoading(false);
            }
        },
        [searchTerm, perPage]
    );

    // Initial load
    useEffect(() => {
        loadUsers(1, ""); // Load with empty search initially
    }, []);

    // Debounced search effect
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchTerm !== "") {
                setCurrentPage(1);
                loadUsers(1, searchTerm);
            }
        }, 500); // 500ms debounce delay

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, loadUsers]);

    // Handle manual search (immediate)
    const handleSearch = () => {
        setCurrentPage(1);
        loadUsers(1, searchTerm);
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1);
        loadUsers(1, ""); // Load with empty search
    };

    // Load user detail
    const loadUserDetail = async (userId) => {
        try {
            setDetailLoading(true);
            const data = await fetchUserDetail(userId);
            if (data.success) {
                setUserDetail(data.data);
            }
        } catch (error) {
            console.error("Error loading user detail:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        loadUsers(page, searchTerm);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const { currentPage: current, totalPages } = pagination;
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, current - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    // Handle user deletion
    const handleDeleteUser = async (user) => {
        try {
            setDeleteLoading(true);
            const userId = user.firebaseData?.uid || user._id;
            const result = await deleteUser(userId);

            if (result.success) {
                // Reload current page
                await loadUsers(currentPage);
                // Reload stats
                const statsData = await fetchUserStats();
                if (statsData.success) {
                    setUserStats(statsData.stats);
                }
            } else {
                console.error("Delete failed:", result.error);
                alert("Lỗi khi xóa người dùng: " + (result.error || result.message));
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Lỗi khi xóa người dùng");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                <p className="text-muted-foreground">Quản lý tất cả người dùng trong hệ thống</p>
            </div>

            {/* User Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userStats.totalUsers || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Có hồ sơ</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userStats.usersWithProfile || 0}</div>
                        <p className="text-xs text-muted-foreground">{userStats.profileCompletionRate || 0}% hoàn thành</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Có CV PDF</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userStats.usersWithPDF || 0}</div>
                        <p className="text-xs text-muted-foreground">{userStats.pdfUploadRate || 0}% upload</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Người dùng mới</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userStats.recentUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">30 ngày qua</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Tìm kiếm theo tên, email..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            />
                            {loading && searchTerm.trim() !== "" && (
                                <div className="absolute right-2.5 top-2.5">
                                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                </div>
                            )}
                        </div>
                        <Button onClick={handleSearch} variant="outline">
                            <Search className="h-4 w-4" />
                        </Button>
                        {searchTerm.trim() && (
                            <Button onClick={handleClearSearch} variant="ghost" size="sm">
                                Xóa
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" className="h-9 gap-1">
                            <UserPlus className="h-4 w-4" />
                            Thêm người dùng
                        </Button>
                    </div>
                </div>

                {/* Search Status */}
                {/* {searchTerm.trim() !== "" && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <Search className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">Đang hiển thị kết quả tìm kiếm cho "{searchTerm.trim()}"</span>
                        <Button variant="ghost" size="sm" onClick={handleClearSearch} className="text-blue-600 hover:text-blue-800">
                            Xóa
                        </Button>
                    </div>
                )} */}
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên (tên trên firebase)</TableHead>
                            <TableHead>Tên hồ sơ</TableHead>
                            <TableHead>Email</TableHead>
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
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Không tìm thấy người dùng nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, index) => (
                                <TableRow key={user._id || index}>
                                    <TableCell className="font-medium">{(currentPage - 1) * perPage + index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {user.firebaseData?.photoURL && <img src={user.firebaseData.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />}
                                            <div>
                                                <div className="font-medium">{user.firebaseData?.displayName || "N/A"}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{user.userData?.profile?.Name || "N/A"}</div>
                                            {user.userData?.profile && (
                                                <div className="flex gap-1 mt-1">
                                                    <Badge variant="secondary" className="text-xs">
                                                        Profile
                                                    </Badge>
                                                    {user.userData?.PDF_CV_URL && (
                                                        <Badge variant="outline" className="text-xs">
                                                            PDF
                                                        </Badge>
                                                    )}
                                                    {user.savedJobs?.length > 0 && (
                                                        <Badge variant="default" className="text-xs">
                                                            {user.savedJobs.length} Jobs
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div>{user.firebaseData?.email || user.userData?.profile?.Email || "N/A"}</div>
                                            {user.firebaseData?.email && user.userData?.profile?.Email && user.firebaseData.email !== user.userData.profile.Email && (
                                                <div className="text-xs text-muted-foreground">DB: {user.userData.profile.Email}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-mono text-sm">{user.firebaseData?.uid ? user.firebaseData.uid.substring(0, 12) + "..." : "N/A"}</div>
                                    </TableCell>
                                    <TableCell>
                                        {user.firebaseData?.creationTime
                                            ? new Date(user.firebaseData.creationTime).toLocaleDateString("vi-VN")
                                            : user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                                            : "N/A"}
                                    </TableCell>
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
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                setSelectedUser(user);
                                                                loadUserDetail(user.firebaseData?.uid || user._id);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Xem chi tiết
                                                        </DropdownMenuItem>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Chi tiết người dùng</DialogTitle>
                                                            <DialogDescription>Thông tin đầy đủ của người dùng</DialogDescription>
                                                        </DialogHeader>
                                                        {detailLoading ? (
                                                            <div className="p-4 text-center">Đang tải...</div>
                                                        ) : userDetail ? (
                                                            <div className="space-y-6">
                                                                {/* Firebase Info */}
                                                                {userDetail.firebaseData && (
                                                                    <Card>
                                                                        <CardHeader>
                                                                            <CardTitle>Thông tin Firebase</CardTitle>
                                                                        </CardHeader>
                                                                        <CardContent className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <strong>UID:</strong> {userDetail.firebaseData.uid}
                                                                            </div>
                                                                            <div>
                                                                                <strong>Email:</strong> {userDetail.firebaseData.email}
                                                                            </div>
                                                                            <div>
                                                                                <strong>Display Name:</strong> {userDetail.firebaseData.displayName || "N/A"}
                                                                            </div>
                                                                            <div>
                                                                                <strong>Email Verified:</strong> {userDetail.firebaseData.emailVerified ? "Yes" : "No"}
                                                                            </div>
                                                                            <div>
                                                                                <strong>Disabled:</strong> {userDetail.firebaseData.disabled ? "Yes" : "No"}
                                                                            </div>
                                                                            <div>
                                                                                <strong>Last Sign In:</strong>{" "}
                                                                                {userDetail.firebaseData.lastSignInTime
                                                                                    ? new Date(userDetail.firebaseData.lastSignInTime).toLocaleString("vi-VN")
                                                                                    : "Never"}
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                )}

                                                                {/* Profile Info */}
                                                                {userDetail.user.userData?.profile && (
                                                                    <Card>
                                                                        <CardHeader>
                                                                            <CardTitle>Thông tin hồ sơ</CardTitle>
                                                                        </CardHeader>
                                                                        <CardContent className="grid grid-cols-2 gap-4">
                                                                            {Object.entries(userDetail.user.userData.profile).map(([key, value]) => (
                                                                                <div key={key}>
                                                                                    <strong>{key}:</strong> {value || "N/A"}
                                                                                </div>
                                                                            ))}
                                                                        </CardContent>
                                                                    </Card>
                                                                )}

                                                                {/* Saved Jobs */}
                                                                {userDetail.savedJobsDetails?.length > 0 && (
                                                                    <Card>
                                                                        <CardHeader>
                                                                            <CardTitle>Việc làm đã lưu ({userDetail.savedJobsDetails.length})</CardTitle>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                            <div className="space-y-2">
                                                                                {userDetail.savedJobsDetails.map((job, idx) => (
                                                                                    <div key={idx} className="p-2 border rounded">
                                                                                        <div className="font-medium">{job.title}</div>
                                                                                        <div className="text-sm text-muted-foreground">{job.company}</div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                )}

                                                                {/* Stats */}
                                                                <Card>
                                                                    <CardHeader>
                                                                        <CardTitle>Thống kê</CardTitle>
                                                                    </CardHeader>
                                                                    <CardContent className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <strong>Có hồ sơ:</strong> {userDetail.stats.hasProfile ? "Yes" : "No"}
                                                                        </div>
                                                                        <div>
                                                                            <strong>Có PDF CV:</strong> {userDetail.stats.hasPDF ? "Yes" : "No"}
                                                                        </div>
                                                                        <div>
                                                                            <strong>Có review:</strong> {userDetail.stats.hasReview ? "Yes" : "No"}
                                                                        </div>
                                                                        <div>
                                                                            <strong>Tổng job đã lưu:</strong> {userDetail.stats.totalSavedJobs}
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 text-center">Không thể tải thông tin chi tiết</div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                                <DropdownMenuSeparator />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Xóa người dùng
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Bạn có chắc chắn muốn xóa người dùng này?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Hành động này sẽ xóa hoàn toàn:
                                                                <br />• Tài khoản Firebase
                                                                <br />• Dữ liệu trong database
                                                                <br />• Tất cả CV đã tạo
                                                                <br />
                                                                <strong>Hành động này không thể hoàn tác!</strong>
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteUser(user)}
                                                                disabled={deleteLoading}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                {deleteLoading ? "Đang xóa..." : "Xóa hoàn toàn"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Hiển thị {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, pagination.totalUsers)}
                        trong tổng số {pagination.totalUsers} người dùng
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
                            Trước
                        </Button>
                        {getPageNumbers().map((pageNum) => (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                className="px-4"
                                onClick={() => handlePageChange(pageNum)}
                            >
                                {pageNum}
                            </Button>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= pagination.totalPages}>
                            Sau
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
