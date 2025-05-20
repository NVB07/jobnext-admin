"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, Globe, MoreHorizontal, Plus, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchJobs, searchJobs } from "@/lib/api";

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [jobCategory, setJobCategory] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 20,
        totalPages: 1,
        totalJobs: 0,
    });

    // Count active filters
    const activeFiltersCount = [jobCategory, experienceLevel].filter(Boolean).length;

    const popoverRef = useRef(null);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                setLoading(true);
                const data = await searchJobs(pagination.currentPage, pagination.perPage);
                console.log("Jobs data:", data);
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
            handleSearch();
        }
    };

    // Handle search with filters
    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        setLoading(true);
        try {
            const filters = {
                skill: searchTerm,
                category: jobCategory,
                jobLevel: experienceLevel,
            };

            const data = await searchJobs(pagination.currentPage, pagination.perPage, filters);
            setJobs(data.jobs || []);
            setPagination(data.pagination || pagination);
        } catch (error) {
            console.error("Error searching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Clear filter helpers
    const clearJobCategory = () => setJobCategory("");
    const clearExperienceLevel = () => setExperienceLevel("");

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
                    <Button size="sm" variant="outline" type="button" className="h-9 gap-1">
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
                                    <TableCell>{job.title || "N/A"}</TableCell>
                                    <TableCell>{job.company || "N/A"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">{job.locationVI || job.location || "N/A"}</div>
                                    </TableCell>
                                    <TableCell>{job.groupJobFunctionV3NameVI || job.groupJobFunctionV3Name || "N/A"}</TableCell>
                                    <TableCell>{job.salary || "Thỏa thuận"}</TableCell>
                                    <TableCell>{job.jobLevelVI || job.jobLevel || "N/A"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">{job.expiredOn ? new Date(job.expiredOn).toLocaleDateString("vi-VN") : "N/A"}</div>
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
                                                <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                                                <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Xóa công việc</DropdownMenuItem>
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
                <Button variant="outline" size="sm" disabled={pagination.currentPage <= 1} onClick={() => changePage(pagination.currentPage - 1)}>
                    Trước
                </Button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    // Hiển thị các trang xung quanh trang hiện tại
                    let pageToShow = i + 1;
                    if (pagination.totalPages > 5 && pagination.currentPage > 3) {
                        pageToShow = pagination.currentPage - 2 + i;
                        if (pageToShow > pagination.totalPages) {
                            pageToShow = pagination.totalPages - (4 - i);
                        }
                    }

                    return (
                        <Button
                            key={pageToShow}
                            variant="outline"
                            size="sm"
                            className={`px-4 ${pagination.currentPage === pageToShow ? "font-medium bg-blue-100" : ""}`}
                            onClick={() => changePage(pageToShow)}
                        >
                            {pageToShow}
                        </Button>
                    );
                })}
                <Button variant="outline" size="sm" disabled={pagination.currentPage >= pagination.totalPages} onClick={() => changePage(pagination.currentPage + 1)}>
                    Sau
                </Button>
            </div>
        </div>
    );
}

// Job categories mapping
const jobCategoriesMap = {
    "Academic/Education": "Học thuật/Giáo dục",
    "Accounting/Auditing": "Kế toán/Kiểm toán",
    "Administration/Office Support": "Hành chính/Hỗ trợ văn phòng",
    "Agriculture/Livestock/Fishery": "Nông nghiệp/Chăn nuôi/Thủy sản",
    "Architecture/Construction": "Kiến trúc/Xây dựng",
    "Art, Media & Printing/Publishing": "Nghệ thuật, Truyền thông & In ấn/Xuất bản",
    "Banking & Financial Services": "Ngân hàng & Dịch vụ tài chính",
    "CEO & General Management": "CEO & Quản lý chung",
    "Customer Service": "Dịch vụ khách hàng",
    Design: "Thiết kế",
    "Engineering & Sciences": "Kỹ thuật & Khoa học",
    "Food and Beverage": "Thực phẩm và Đồ uống",
    "Government/NGO": "Chính phủ/Tổ chức phi chính phủ",
    "Healthcare/Medical Services": "Chăm sóc sức khỏe/Dịch vụ y tế",
    "Hospitality/Tourism": "Khách sạn/Du lịch",
    "Human Resources/Recruitment": "Nhân sự/Tuyển dụng",
    "Information Technology/Telecommunications": "Công nghệ thông tin/Viễn thông",
    Insurance: "Bảo hiểm",
    Legal: "Pháp lý",
    "Logistics/Import Export/Warehouse": "Hậu cần/Xuất nhập khẩu/Kho bãi",
    Manufacturing: "Sản xuất",
    "Marketing, Advertising/Communications": "Marketing, Quảng cáo/Truyền thông",
    Pharmacy: "Dược phẩm",
    "Real Estate": "Bất động sản",
    "Retail/Consumer Products": "Bán lẻ/Sản phẩm tiêu dùng",
    Sales: "Bán hàng",
    Technician: "Kỹ thuật viên",
    "Textiles, Garments/Footwear": "Dệt may, May mặc/Giày dép",
    Transportation: "Vận tải",
    Others: "Khác",
};

// Experience levels mapping
const experienceLevelsMap = {
    "Intern/Student": "Thực tập sinh/Sinh viên",
    "Fresher/Entry level": "Mới tốt nghiệp/Mới vào nghề",
    "Experienced \\(non-manager\\)": "Có kinh nghiệm (không phải quản lý)",
    Manager: "Quản lý",
    "Director and above": "Giám đốc trở lên",
};
