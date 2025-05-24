"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Play, Square, RefreshCw, Clock, TrendingUp, AlertTriangle, CheckCircle, Calendar, Building, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { getCrawlStatus, startManualCrawl, stopCrawl, getJobsToday, getExpiredJobs, deleteExpiredJobs } from "@/lib/api";

export default function CrawlPage() {
    const [crawlData, setCrawlData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [crawlLoading, setCrawlLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [todayJobs, setTodayJobs] = useState([]);
    const [expiredJobs, setExpiredJobs] = useState([]);
    const [todayPagination, setTodayPagination] = useState({});
    const [expiredPagination, setExpiredPagination] = useState({});
    const [error, setError] = useState(null);

    // Load crawl status with error handling - chỉ update status, không reload jobs
    const loadCrawlStatusOnly = useCallback(async () => {
        try {
            setError(null);
            const data = await getCrawlStatus();
            if (data.success) {
                setCrawlData((prevData) => {
                    // Chỉ update nếu có thay đổi thực sự
                    if (
                        !prevData ||
                        prevData.crawlStatus?.currentPage !== data.data.crawlStatus?.currentPage ||
                        prevData.crawlStatus?.isRunning !== data.data.crawlStatus?.isRunning ||
                        prevData.crawlStatus?.jobsProcessed !== data.data.crawlStatus?.jobsProcessed
                    ) {
                        return data.data;
                    }
                    return prevData;
                });
            }
        } catch (error) {
            console.error("Error loading crawl status:", error);
            // Không set error khi chỉ update status để tránh interrupt crawl
        }
    }, []);

    // Load full crawl status with error handling - load toàn bộ data
    const loadFullCrawlStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getCrawlStatus();
            if (data.success) {
                setCrawlData(data.data);
            } else {
                setError("Không thể tải trạng thái crawl");
            }
        } catch (error) {
            console.error("Error loading crawl status:", error);
            setError("Lỗi kết nối API");
        } finally {
            setLoading(false);
        }
    }, []);

    // Load today's jobs with error handling
    const loadTodayJobs = useCallback(async (page = 1) => {
        try {
            const data = await getJobsToday(page, 10);
            if (data.success) {
                setTodayJobs(data.data || []);
                setTodayPagination(data.pagination || {});
            }
        } catch (error) {
            console.error("Error loading today's jobs:", error);
        }
    }, []);

    // Load expired jobs with error handling
    const loadExpiredJobs = useCallback(async (page = 1) => {
        try {
            const data = await getExpiredJobs(page, 10);
            if (data.success) {
                setExpiredJobs(data.data || []);
                setExpiredPagination(data.pagination || {});
            }
        } catch (error) {
            console.error("Error loading expired jobs:", error);
        }
    }, []);

    // Initial load - load toàn bộ data
    useEffect(() => {
        loadFullCrawlStatus();
        loadTodayJobs();
        loadExpiredJobs();
    }, [loadFullCrawlStatus, loadTodayJobs, loadExpiredJobs]);

    // Auto refresh khi crawl đang chạy - CHỈ refresh status, KHÔNG reload jobs
    useEffect(() => {
        let interval;
        if (crawlData?.crawlStatus?.isRunning) {
            interval = setInterval(() => {
                loadCrawlStatusOnly(); // Chỉ load status, không load jobs
            }, 5000); // Tăng từ 3s lên 5s để giảm flicker
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [crawlData?.crawlStatus?.isRunning, loadCrawlStatusOnly]);

    // Handle start crawl
    const handleStartCrawl = useCallback(async () => {
        try {
            setCrawlLoading(true);
            setError(null);
            const result = await startManualCrawl();
            if (result.success) {
                await loadFullCrawlStatus(); // Load full status after starting
                // Không reload jobs ngay, để auto-refresh handle
            } else {
                setError("Lỗi khi bắt đầu crawl: " + result.message);
            }
        } catch (error) {
            console.error("Error starting crawl:", error);
            setError("Lỗi khi bắt đầu crawl");
        } finally {
            setCrawlLoading(false);
        }
    }, [loadFullCrawlStatus]);

    // Handle stop crawl
    const handleStopCrawl = useCallback(async () => {
        try {
            setError(null);
            const result = await stopCrawl();
            if (result.success) {
                await loadFullCrawlStatus(); // Load full status after stopping
                await loadTodayJobs(); // Reload jobs after stopping để show new data
            } else {
                setError("Lỗi khi dừng crawl: " + result.message);
            }
        } catch (error) {
            console.error("Error stopping crawl:", error);
            setError("Lỗi khi dừng crawl");
        }
    }, [loadFullCrawlStatus, loadTodayJobs]);

    // Handle delete expired jobs
    const handleDeleteExpiredJobs = useCallback(async () => {
        try {
            setDeleteLoading(true);
            setError(null);
            const result = await deleteExpiredJobs();
            if (result.success) {
                // Reload data after deletion
                await loadFullCrawlStatus();
                await loadExpiredJobs();
                // Show success message
                alert(`✅ ${result.message}`);
            } else {
                setError("Lỗi khi xóa jobs hết hạn: " + result.message);
            }
        } catch (error) {
            console.error("Error deleting expired jobs:", error);
            setError("Lỗi khi xóa jobs hết hạn");
        } finally {
            setDeleteLoading(false);
        }
    }, [loadFullCrawlStatus, loadExpiredJobs]);

    // Memoized format functions để tránh re-render không cần thiết
    const formatDuration = useCallback((ms) => {
        if (!ms) return "N/A";
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("vi-VN");
    }, []);

    // Memoized values để tránh re-render
    const { crawlStatus, todayJobsCount, expiredJobsCount } = useMemo(() => {
        return crawlData || { crawlStatus: null, todayJobsCount: 0, expiredJobsCount: 0 };
    }, [crawlData]);

    const progressValue = useMemo(() => {
        return crawlStatus?.totalPages ? (crawlStatus.currentPage / crawlStatus.totalPages) * 100 : 0;
    }, [crawlStatus?.currentPage, crawlStatus?.totalPages]);

    // Error state
    if (error) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý Crawl Jobs</h1>
                    <p className="text-muted-foreground">Quản lý việc thu thập dữ liệu công việc từ VietnamWorks</p>
                </div>

                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Lỗi</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>

                <Button onClick={loadFullCrawlStatus} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Thử lại
                </Button>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý Crawl Jobs</h1>
                <p className="text-muted-foreground">Quản lý việc thu thập dữ liệu công việc từ VietnamWorks</p>
            </div>

            {/* Status Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {crawlStatus?.isRunning ? (
                                <Badge variant="default" className="bg-green-600">
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    Đang chạy
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Dừng</Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Lần chạy cuối: {formatDate(crawlStatus?.lastRun)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs hôm nay</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayJobsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Ngày {new Date().toLocaleDateString("vi-VN")}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs hết hạn</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{expiredJobsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Cần xử lý</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tiến độ</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {crawlStatus?.isRunning ? `${crawlStatus.currentPage || 0}/${crawlStatus.totalPages || "?"}` : "Không chạy"}
                        </div>
                        {crawlStatus?.isRunning && <Progress value={progressValue} className="mt-2" />}
                    </CardContent>
                </Card>
            </div>

            {/* Control Panel */}
            <Card>
                <CardHeader>
                    <CardTitle>Điều khiển Crawl</CardTitle>
                    <CardDescription>Crawl tự động chạy vào 0h hàng ngày. Bạn có thể chạy thủ công khi cần.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    {!crawlStatus?.isRunning ? (
                        <Button onClick={handleStartCrawl} disabled={crawlLoading} className="bg-green-600 hover:bg-green-700">
                            {crawlLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                            Bắt đầu Crawl
                        </Button>
                    ) : (
                        <Button onClick={handleStopCrawl} variant="destructive">
                            <Square className="h-4 w-4 mr-2" />
                            Dừng Crawl
                        </Button>
                    )}

                    <Button onClick={loadFullCrawlStatus} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Làm mới
                    </Button>

                    {expiredJobsCount > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={deleteLoading}>
                                    {deleteLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                    Xóa Jobs hết hạn ({expiredJobsCount})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận xóa jobs hết hạn</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc chắn muốn xóa tất cả <strong>{expiredJobsCount} jobs đã hết hạn</strong>?
                                        <br />
                                        <br />
                                        <strong>Hành động này không thể hoàn tác!</strong>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteExpiredJobs} className="bg-red-600 hover:bg-red-700">
                                        Xóa tất cả
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardContent>
            </Card>

            {/* Crawl Status Details */}
            {crawlStatus?.isRunning && (
                <Alert>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <AlertTitle>Crawl đang chạy</AlertTitle>
                    <AlertDescription>
                        Đang xử lý trang {crawlStatus.currentPage || 0}/{crawlStatus.totalPages || "?"} - Đã thu thập {crawlStatus.jobsProcessed || 0} jobs - Thời gian
                        chạy: {crawlStatus.startTime ? formatDuration(new Date() - new Date(crawlStatus.startTime)) : "N/A"}
                        {crawlStatus.errors?.length > 0 && <div className="mt-2 text-red-600">Có {crawlStatus.errors.length} lỗi xảy ra</div>}
                    </AlertDescription>
                </Alert>
            )}

            {/* Jobs Tables */}
            <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="today">Jobs hôm nay ({todayJobsCount || 0})</TabsTrigger>
                    <TabsTrigger value="expired">Jobs hết hạn ({expiredJobsCount || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jobs được thu thập hôm nay</CardTitle>
                            <CardDescription>Danh sách công việc mới được crawl trong ngày {new Date().toLocaleDateString("vi-VN")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {todayJobs.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tiêu đề</TableHead>
                                            <TableHead>Công ty</TableHead>
                                            <TableHead>Địa điểm</TableHead>
                                            <TableHead>Lương</TableHead>
                                            <TableHead>Hết hạn</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {todayJobs.map((job, index) => (
                                            <TableRow key={job._id || index}>
                                                <TableCell className="font-medium">{job.title}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {job.companyLogo && <img src={job.companyLogo} alt="Logo" className="w-6 h-6 rounded" />}
                                                        {job.company}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{job.locationVI || job.location}</TableCell>
                                                <TableCell>{job.salary || "Thỏa thuận"}</TableCell>
                                                <TableCell>{job.expiredOn ? formatDate(job.expiredOn) : "N/A"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">Chưa có jobs nào được crawl hôm nay</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expired" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Jobs đã hết hạn</CardTitle>
                                <CardDescription>Danh sách công việc đã hết hạn cần được xử lý</CardDescription>
                            </div>
                            {expiredJobs.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={deleteLoading}>
                                            {deleteLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                            Xóa tất cả
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Xác nhận xóa jobs hết hạn</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Bạn có chắc chắn muốn xóa tất cả jobs đã hết hạn?
                                                <br />
                                                <strong>Hành động này không thể hoàn tác!</strong>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteExpiredJobs} className="bg-red-600 hover:bg-red-700">
                                                Xóa tất cả
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </CardHeader>
                        <CardContent>
                            {expiredJobs.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tiêu đề</TableHead>
                                            <TableHead>Công ty</TableHead>
                                            <TableHead>Địa điểm</TableHead>
                                            <TableHead>Lương</TableHead>
                                            <TableHead>Hết hạn</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expiredJobs.map((job, index) => (
                                            <TableRow key={job._id || index}>
                                                <TableCell className="font-medium">{job.title}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {job.companyLogo && <img src={job.companyLogo} alt="Logo" className="w-6 h-6 rounded" />}
                                                        {job.company}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{job.locationVI || job.location}</TableCell>
                                                <TableCell>{job.salary || "Thỏa thuận"}</TableCell>
                                                <TableCell className="text-red-600">{job.expiredOn ? formatDate(job.expiredOn) : "N/A"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">Không có jobs hết hạn</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
