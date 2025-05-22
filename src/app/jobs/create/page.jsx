"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Link2 } from "lucide-react";
import removeAccents from "remove-accents";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createJob } from "@/lib/api";
import { jobCategoriesMap, experienceLevelsMap } from "@/lib/constants";

export default function CreateJob() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        jobSource: "admin",
        contact: "",
        title: "",
        alias: "",
        company: "",
        companyAlias: "",
        companyLogo: "",
        location: "",
        locationVI: "",
        salary: "",
        jobLevel: "",
        jobLevelVI: "",
        groupJobFunctionV3Name: "",
        groupJobFunctionV3NameVI: "",
        jobRequirement: "",
        description: "",
        url: "",
        skills: "",
        expiredOn: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [date, setDate] = useState();

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const updatedData = { ...prev, jobSource: "admin", [name]: value };

            // Auto-populate English fields from Vietnamese inputs
            if (name === "locationVI") {
                updatedData.location = removeAccents(value);
            }

            if (name === "title") {
                updatedData.alias = removeAccents(value);
            }

            if (name === "company") {
                updatedData.companyAlias = removeAccents(value);
            }

            return updatedData;
        });
    };

    // Handle category selection
    const handleCategoryChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            groupJobFunctionV3Name: value,
            groupJobFunctionV3NameVI: jobCategoriesMap[value],
        }));
    };

    // Handle job level selection
    const handleJobLevelChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            jobLevel: value,
            jobLevelVI: experienceLevelsMap[value],
        }));
    };

    // Handle date selection for expiration
    const handleDateSelect = (selectedDate) => {
        setDate(selectedDate);
        setFormData((prev) => ({
            ...prev,
            expiredOn: selectedDate,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Format the skills as needed for the API

            const updatedFormData = {
                ...formData,
            };

            await createJob(updatedFormData);
            router.push("/jobs");
        } catch (err) {
            console.error("Error creating job:", err);
            setError("Có lỗi xảy ra khi tạo công việc. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Thêm công việc mới</h1>
                <Button onClick={() => router.back()} variant="outline">
                    Quay lại
                </Button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cơ bản</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="title" className="font-medium">
                                    Tiêu đề công việc *
                                </label>
                                <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Nhập tiêu đề công việc" />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="company" className="font-medium">
                                    Tên công ty *
                                </label>
                                <Input id="company" name="company" value={formData.company} onChange={handleChange} required placeholder="Nhập tên công ty" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="companyLogo" className="font-medium">
                                    Logo công ty (URL)
                                </label>
                                <Input
                                    id="companyLogo"
                                    name="companyLogo"
                                    value={formData.companyLogo}
                                    onChange={handleChange}
                                    placeholder="Nhập URL logo công ty (không bắt buộc)"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="locationVI" className="font-medium">
                                    Địa điểm *
                                </label>
                                <Input
                                    id="locationVI"
                                    name="locationVI"
                                    value={formData.locationVI}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ví dụ: Thành phố Hồ Chí Minh"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="category" className="font-medium">
                                    Ngành nghề *
                                </label>
                                <Select onValueChange={handleCategoryChange} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn ngành nghề" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(jobCategoriesMap).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="jobLevel" className="font-medium">
                                    Cấp bậc *
                                </label>
                                <Select onValueChange={handleJobLevelChange} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn cấp bậc" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(experienceLevelsMap).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="salary" className="font-medium">
                                    Lương *
                                </label>
                                <Input
                                    id="salary"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ví dụ: 1500 - 2500 USD hoặc Thỏa thuận"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="expiredOn" className="font-medium">
                                    Ngày hết hạn *
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "dd/MM/yyyy") : "Chọn ngày hết hạn"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus disabled={(date) => date < new Date()} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Chi tiết công việc</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="description" className="font-medium">
                                Mô tả công việc *
                            </label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Nhập mô tả chi tiết về công việc"
                                className="min-h-[200px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="jobRequirement" className="font-medium">
                                Yêu cầu ứng viên *
                            </label>
                            <Textarea
                                id="jobRequirement"
                                name="jobRequirement"
                                value={formData.jobRequirement}
                                onChange={handleChange}
                                required
                                placeholder="Nhập yêu cầu về ứng viên"
                                className="min-h-[200px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="contact" className="font-medium">
                                Liên hệ *
                            </label>
                            <Textarea
                                className="min-h-[100px]"
                                id="contact"
                                required
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                placeholder="Ứng tuyển công việc vui lòng liên hệ Zalo, Facebook, liên kết hoặc mail"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="url" className="font-medium">
                                URL công việc
                            </label>
                            <div className="flex">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Link2 className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <Input id="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://example.com/job" className="pl-10" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="skills" className="font-medium">
                                Kỹ năng yêu cầu *
                            </label>
                            <Input
                                id="skills"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                required
                                placeholder="Các kỹ năng yêu cầu, phân cách bằng dấu phẩy (,). Ví dụ: React, Node.js, MongoDB"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Hủy bỏ
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Tạo công việc"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
