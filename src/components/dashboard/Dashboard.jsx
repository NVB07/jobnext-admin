"use client";

import { useState, useEffect } from "react";
import { ArrowUp, Briefcase, Building, FileText, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchDashboardData, fetchTopCompanies, fetchJobCategories } from "@/lib/api";

export default function DashboardPage() {
    const [data, setData] = useState({
        users: [],
        jobs: [],
        cvTemplates: [],
        statistics: {
            totalUsers: 0,
            totalJobs: 0,
            totalTemplates: 0,
        },
    });
    const [topCompanies, setTopCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobCategories, setJobCategories] = useState([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                const result = await fetchDashboardData();
                setData(result);

                // Lấy danh sách phân loại công việc theo ngành nghề
                const categories = await fetchJobCategories();
                setJobCategories(categories || []);

                // Lấy top công ty
                const companies = await fetchTopCompanies(5);
                setTopCompanies(companies || []);
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Lấy số liệu từ thống kê
    const { totalUsers, totalJobs, totalTemplates } = data.statistics || {};

    // Tính tổng số lượng công việc từ dữ liệu phân loại
    const totalCategorizedJobs = jobCategories.reduce((sum, category) => sum + category.count, 0);

    // Tính phần trăm cho từng ngành nghề
    const calculatePercentage = (count) => {
        if (!totalCategorizedJobs) return 0;
        return Math.round((count / totalCategorizedJobs) * 100);
    };

    // Sắp xếp các ngành nghề theo số lượng giảm dần
    const sortedCategories = [...jobCategories].sort((a, b) => b.count - a.count);

    // Lấy 5 công việc mới nhất
    const latestJobs = [...data.jobs].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 5);

    if (loading) {
        return <div className="flex items-center justify-center h-96">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Dashboard</h1>
                <p className="text-muted-foreground">Tổng quan về hệ thống quản lý tuyển dụng</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border-blue-100 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                        <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                        <User className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-900">{totalUsers || 0}</div>
                    </CardContent>
                </Card>
                <Card className="border-purple-100 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                        <CardTitle className="text-sm font-medium">Tổng công việc</CardTitle>
                        <Briefcase className="h-4 w-4 text-purple-100" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-purple-900">{totalJobs || 0}</div>
                    </CardContent>
                </Card>
                <Card className="border-indigo-100 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                        <CardTitle className="text-sm font-medium">Tổng CV mẫu</CardTitle>
                        <FileText className="h-4 w-4 text-indigo-100" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-indigo-900">{totalTemplates || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-blue-100 shadow-md ">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                        <CardTitle>Công việc theo ngành nghề</CardTitle>
                        <CardDescription className="text-blue-100">Phân bố công việc theo các ngành nghề </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {sortedCategories.slice(0, 5).map((category, index) => {
                            const percentage = calculatePercentage(category.count);
                            return (
                                <div className="space-y-2" key={index}>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="truncate max-w-[300px]">{category.categoryVI || category.category}</div>
                                        <div className="font-medium">{percentage}%</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={percentage} className="h-2" style={{ "--indicator-color": "#3b82f6" }} />
                                        <span className="text-xs text-gray-500 min-w-[40px]">{category.count}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {jobCategories.length === 0 && <div className="text-center py-4 text-muted-foreground">Chưa có dữ liệu</div>}
                    </CardContent>
                    <CardFooter>
                        <Link href="/jobs/categories" className="w-full">
                            <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                                Xem chi tiết
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card className="border-purple-100 shadow-md flex flex-col justify-between">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                        <CardTitle>Công ty có nhiều việc làm nhất</CardTitle>
                        <CardDescription className="text-purple-100">Top công ty đăng tuyển nhiều việc làm</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {topCompanies.map((company, index) => {
                            if (index < 5) {
                                return (
                                    <div className="flex items-center justify-between" key={index}>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <div className="font-medium">{company.company || "Không xác định"}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {company.groupJobFunctionV3NameVI || company.groupJobFunctionV3Name || "Đa ngành nghề"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-blue-700">{company.totalJobs} việc làm</div>
                                    </div>
                                );
                            }
                        })}
                        {topCompanies.length === 0 && <div className="text-center py-4 text-muted-foreground">Chưa có dữ liệu</div>}
                    </CardContent>
                    <CardFooter>
                        <Link href="/companies" className="w-full">
                            <Button variant="outline" size="sm" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800">
                                Xem tất cả công ty
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            <Card className="border-indigo-100 shadow-md">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle>Việc làm mới nhất</CardTitle>
                    <CardDescription className="text-indigo-100">Các công việc mới được đăng gần đây</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    {latestJobs.map((job, index) => (
                        <div className="space-y-2" key={index}>
                            <div className="flex justify-between">
                                <div className="font-medium text-blue-800">{job.title}</div>
                                <div className="text-sm text-muted-foreground">
                                    {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString("vi-VN") : "Không có ngày"}
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {job.company || "Không xác định"} - {job.locationVI || job.location || "Không xác định"}
                            </div>
                        </div>
                    ))}
                    {latestJobs.length === 0 && <div className="text-center py-4 text-muted-foreground">Chưa có dữ liệu</div>}
                </CardContent>
                <CardFooter>
                    <Link href="/jobs" className="w-full">
                        <Button variant="outline" size="sm" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
                            Xem tất cả công việc
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
