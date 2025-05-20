"use client";

import { useState, useEffect } from "react";
import { fetchCompanies } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Companies() {
    const [companies, setCompanies] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 9,
        totalPages: 0,
        totalCompanies: 0,
    });
    const [loading, setLoading] = useState(true);

    const loadCompanies = async (page = 1, perPage = 9) => {
        try {
            setLoading(true);
            // Fetch companies with pagination
            const response = await fetchCompanies(page, perPage);

            // Transform data to match the component structure
            const formattedCompanies = response.companies.map((item) => ({
                name: item.company,
                count: item.totalJobs,
                logo: item.companyLogo,
            }));

            setCompanies(formattedCompanies);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Error loading companies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies(1, 9);
    }, []);

    // Navigate to a specific page
    const goToPage = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            loadCompanies(page, pagination.perPage);
        }
    };

    // Calculate total number of jobs on current page
    const totalJobs = companies.reduce((sum, company) => sum + company.count, 0);

    // Calculate percentage for each company
    const calculatePercentage = (count) => {
        if (!totalJobs) return 0;
        return Math.round((count / totalJobs) * 100);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Công việc theo công ty</h1>
                <p className="text-muted-foreground">
                    Hiển thị số lượng công việc theo từng công ty
                    {pagination.totalCompanies > 0 && ` (${pagination.totalCompanies} công ty)`}
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                        <Card key={index}>
                            <CardHeader>
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-4 w-24 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-2 w-full mb-4" />
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {companies.map((company, index) => (
                            <Card key={index}>
                                <CardHeader className="">
                                    <CardTitle className="text-lg font-medium flex items-center justify-between">
                                        <span className="truncate">{company.name}</span>
                                        <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {calculatePercentage(company.count)}%
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{company.count} công việc</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Progress
                                        value={calculatePercentage(company.count)}
                                        className="h-2"
                                        style={{ "--indicator-color": `hsl(${(index * 25) % 360},70%,50%)` }}
                                    />
                                    <div className="flex items-center gap-3 mt-4">
                                        {company.logo && (
                                            <div className="w-10 h-10 overflow-hidden rounded flex items-center justify-center bg-gray-100">
                                                <img
                                                    src={company.logo}
                                                    alt={company.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.src = "https://placehold.co/100x100?text=Logo";
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-col text-sm">
                                            <p className="font-medium">{company.name}</p>
                                            <p className="text-muted-foreground">{calculatePercentage(company.count)}% thị phần công việc</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination UI */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <Button variant="outline" size="icon" onClick={() => goToPage(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1">
                                {[...Array(pagination.totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    // Show limited page buttons to avoid cluttering
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === pagination.totalPages ||
                                        (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={pageNumber}
                                                variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => goToPage(pageNumber)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {pageNumber}
                                            </Button>
                                        );
                                    }

                                    // Add ellipsis for skipped pages
                                    if (
                                        (pageNumber === 2 && pagination.currentPage > 3) ||
                                        (pageNumber === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                                    ) {
                                        return <span key={pageNumber}>...</span>;
                                    }

                                    return null;
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => goToPage(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {!loading && companies.length === 0 && <p className="text-center py-4">Không có dữ liệu công ty nào.</p>}
        </div>
    );
}
