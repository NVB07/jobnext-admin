"use client";

import { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Plus, Search, SlidersHorizontal, X, Loader2, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
import { searchJobs, deleteJob } from "@/lib/api";
import { jobCategoriesMap, experienceLevelsMap, jobSourcesMap } from "@/lib/constants";
export default function Jobs() {
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [jobCategory, setJobCategory] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [jobSource, setJobSource] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 20,
        totalPages: 1,
        totalJobs: 0,
    });

    // Count active filters
    const activeFiltersCount = [jobCategory, experienceLevel, jobSource].filter(Boolean).length;

    const popoverRef = useRef(null);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                setLoading(true);
                const data = await searchJobs(pagination.currentPage, pagination.perPage);

                setJobs(data.jobs || []);
                setPagination(data.pagination || pagination);
            } catch (error) {
                console.error("Error loading jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, []);

    // Chuyển trang
    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: newPage }));
            handleSearch(null, newPage);
        }
    };

    // Handle search with filters
    const handleSearch = async (e, page = pagination.currentPage) => {
        if (e) e.preventDefault();

        setLoading(true);
        try {
            const filters = {
                skill: searchTerm,
                category: jobCategory,
                jobLevel: experienceLevel,
                jobSource: jobSource,
            };

            const data = await searchJobs(page, pagination.perPage, filters);
            console.log("Jobs data:", data);
            setJobs(data.jobs || []);
            setPagination(data.pagination || { ...pagination, currentPage: page });
        } catch (error) {
            console.error("Error searching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Navigate to job detail page
    const handleViewJobDetail = (jobId) => {
        router.push(`/jobs/${jobId}`);
    };

    // Delete job
    const handleDeleteClick = (job) => {
        setJobToDelete(job);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!jobToDelete) return;

        setDeleteLoading(true);
        try {
            await deleteJob(jobToDelete._id);
            // Refresh job list after deletion
            setJobs(jobs.filter((job) => job._id !== jobToDelete._id));
            // Update total count in pagination
            setPagination((prev) => ({
                ...prev,
                totalJobs: prev.totalJobs - 1,
            }));
        } catch (error) {
            console.error("Error deleting job:", error);
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
            setJobToDelete(null);
        }
    };

    // Clear filter helpers
    const clearJobCategory = () => setJobCategory("");
    const clearExperienceLevel = () => setExperienceLevel("");
    const clearJobSource = () => setJobSource("");

    // Handle opening job details dialog

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý công việc</h1>
                <p className="text-muted-foreground">Quản lý tất cả các công việc đã đăng</p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-1 items-start h-16 gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Tìm kiếm công việc, kỹ năng..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Selected filters display */}
                        <div className="min-[990px]:flex items-center gap-1 ml-2 mt-1 hidden">
                            {jobCategory && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-foreground/10 rounded-md text-sm">
                                    <span className="truncate max-w-[100px]">{jobCategoriesMap[jobCategory] || jobCategory}</span>
                                    <button type="button" onClick={clearJobCategory} className="text-gray-500 hover:text-gray-700">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            {experienceLevel && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-foreground/10 rounded-md text-sm">
                                    <span className="truncate max-w-[100px]">{experienceLevelsMap[experienceLevel] || experienceLevel}</span>
                                    <button type="button" onClick={clearExperienceLevel} className="text-gray-500 hover:text-gray-700">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            {jobSource && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-foreground/10 rounded-md text-sm">
                                    <span className="truncate max-w-[100px]">{jobSourcesMap[jobSource] || jobSource}</span>
                                    <button type="button" onClick={clearJobSource} className="text-gray-500 hover:text-gray-700">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filters popover */}
                    <div ref={popoverRef}>
                        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 relative bg-foreground/5"
                                    type="button"
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    <SlidersHorizontal className="h-4 w-4 text-foreground/70" />
                                    {activeFiltersCount > 0 && <p className="absolute pr-1 bottom-0 text-sm right-0">{activeFiltersCount}</p>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" alignOffset={-53} align="end">
                                <div className="grid gap-4 w-full">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Ngành nghề</h4>
                                        <div className="flex gap-1">
                                            <Select value={jobCategory} className="w-full" onValueChange={setJobCategory}>
                                                <SelectTrigger className="w-full">
                                                    <div className="truncate w-[200px] text-left">
                                                        <SelectValue placeholder="Chọn ngành nghề" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent align="end">
                                                    <SelectGroup>
                                                        {Object.entries(jobCategoriesMap).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <Button variant="ghost" onClick={clearJobCategory} className="h-9 w-9 bg-foreground/10">
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Kinh nghiệm</h4>
                                        <div className="flex gap-1">
                                            <Select value={experienceLevel} className="flex-1" onValueChange={setExperienceLevel}>
                                                <SelectTrigger>
                                                    <div className="truncate w-[200px] text-left">
                                                        <SelectValue placeholder="Chọn kinh nghiệm" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent align="end">
                                                    <SelectGroup>
                                                        {Object.entries(experienceLevelsMap).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <Button variant="ghost" onClick={clearExperienceLevel} className="h-9 w-9 bg-foreground/10">
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Nguồn</h4>
                                        <div className="flex gap-1">
                                            <Select value={jobSource} className="flex-1" onValueChange={setJobSource}>
                                                <SelectTrigger>
                                                    <div className="truncate w-[200px] text-left">
                                                        <SelectValue placeholder="Chọn nguồn" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent align="end">
                                                    <SelectGroup>
                                                        {Object.entries(jobSourcesMap).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <Button variant="ghost" onClick={clearJobSource} className="h-9 w-9 bg-foreground/10">
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Search button */}
                    <Button type="submit" size="icon" className="h-9 w-9 min-h-9 min-w-9">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-start gap-2">
                    <Button size="sm" variant="outline" type="button" className="h-9 gap-1" onClick={() => router.push("/jobs/create")}>
                        <Plus className="h-4 w-4" />
                        Thêm công việc mới
                    </Button>
                </div>
            </form>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Công ty</TableHead>
                            <TableHead>Địa điểm</TableHead>
                            <TableHead>Ngành nghề</TableHead>
                            <TableHead>Mức lương</TableHead>
                            <TableHead>Cấp bậc</TableHead>
                            <TableHead>Nguồn</TableHead>
                            <TableHead>Ngày hết hạn</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    Không tìm thấy công việc nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job, index) => (
                                <TableRow key={job._id || index}>
                                    <TableCell className="font-medium">{(pagination.currentPage - 1) * pagination.perPage + index + 1}</TableCell>
                                    <TableCell>
                                        <Link href={`/jobs/${job._id}`} className="text-blue-600 hover:underline">
                                            {job.title || "N/A"}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{job.company || "N/A"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">{job.locationVI || job.location || "N/A"}</div>
                                    </TableCell>
                                    <TableCell>{job.groupJobFunctionV3NameVI || job.groupJobFunctionV3Name || "N/A"}</TableCell>
                                    <TableCell>{job.salary || "Thỏa thuận"}</TableCell>
                                    <TableCell>{job.jobLevelVI || job.jobLevel || "N/A"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">{job.jobSource || "N/A"}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">{job.expiredOn ? new Date(job.expiredOn).toLocaleDateString("vi-VN") : "N/A"}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Mở menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleViewJobDetail(job._id)}>Xem chi tiết</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/jobs/edit/${job._id}`)}>Chỉnh sửa</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(job)}>
                                                    Xóa công việc
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Job detail dialog */}

            {/* Delete job confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa công việc</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa công việc &quot;{jobToDelete?.title}&quot;? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700 text-white">
                            {deleteLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                <>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Xóa
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" disabled={pagination.currentPage <= 1} onClick={() => changePage(pagination.currentPage - 1)}>
                    Trước
                </Button>

                <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }).map((_, index) => {
                        const pageNumber = index + 1;

                        // Show first page, last page, and pages around current page
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
                                    onClick={() => changePage(pageNumber)}
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
                            return (
                                <span key={pageNumber} className="px-1">
                                    ...
                                </span>
                            );
                        }

                        return null;
                    })}
                </div>

                <Button variant="outline" size="sm" disabled={pagination.currentPage >= pagination.totalPages} onClick={() => changePage(pagination.currentPage + 1)}>
                    Sau
                </Button>
            </div>
        </div>
    );
}
