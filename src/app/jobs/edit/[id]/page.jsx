"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import removeAccents from "remove-accents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { getJob, updateJob } from "@/lib/api";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { jobCategoriesMap, experienceLevelsMap } from "@/lib/constants";
export default function EditJob() {
    const { id } = useParams();
    const router = useRouter();
    const toast = useToast();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        contact: "",
        location: "",
        locationVI: "",
        groupJobFunctionV3Name: "",
        groupJobFunctionV3NameVI: "",
        description: "",
        jobRequirement: "",
        jobLevel: "",
        jobLevelVI: "",
        salary: "",
        skills: "",
        expiredOn: "",
        url: "",
        companyLogo: "",
    });

    // Load job data
    useEffect(() => {
        async function fetchJobData() {
            try {
                setLoading(true);
                const jobData = await getJob(id);
                setJob(jobData);

                // Format expiration date to YYYY-MM-DD for input field
                let formattedDate = "";
                if (jobData.expiredOn) {
                    const date = new Date(jobData.expiredOn);
                    formattedDate = date.toISOString().split("T")[0];
                }
                setFormData({
                    title: jobData.title || "",
                    company: jobData.company || "",
                    location: jobData.location || "",
                    locationVI: jobData.locationVI || "",
                    contact: jobData.contact || "",
                    groupJobFunctionV3Name: jobData.groupJobFunctionV3Name || "",
                    groupJobFunctionV3NameVI: jobData.groupJobFunctionV3NameVI || "",
                    jobLevel: jobData.jobLevel === "Experienced (non-manager)" ? "Experienced \\(non-manager\\)" : jobData.jobLevel || "",
                    description: jobData.description || "",
                    jobRequirement: jobData.jobRequirement || "",
                    jobLevelVI: jobData.jobLevelVI || "",
                    salary: jobData.salary || "",
                    skills: jobData.skills || "",
                    expiredOn: formattedDate,
                    url: jobData.url || "",
                    companyLogo: jobData.companyLogo || "",
                });
            } catch (error) {
                console.error("Error fetching job:", error);
                toast.error("Không thể tải thông tin công việc");
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchJobData();
        }
    }, [id, toast]);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        if (name === "locationVI") {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                location: removeAccents(value),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handle select field changes
    const handleSelectChange = (name) => (value) => {
        console.log(name, value);
        if (name === "groupJobFunctionV3Name") {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                groupJobFunctionV3NameVI: jobCategoriesMap[value],
            }));
        } else if (name === "jobLevel") {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                jobLevelVI: experienceLevelsMap[value],
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.title || !formData.company) {
            toast.error("Vui lòng nhập đầy đủ tiêu đề và tên công ty");
            return;
        }

        try {
            setSaving(true);
            await updateJob(id, formData);
            toast.success("Thông tin công việc đã được cập nhật");
            router.push(`/jobs/${id}`);
        } catch (error) {
            console.error("Error updating job:", error);
            toast.error("Không thể cập nhật công việc");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Đang tải thông tin công việc...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-red-500 font-medium">Không tìm thấy thông tin công việc</p>
                <Link href="/jobs" className="mt-4">
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách công việc
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <Link href={`/jobs/${id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Quay lại</span>
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-blue-900">Chỉnh sửa công việc</h1>
                <p className="text-muted-foreground">Cập nhật thông tin công việc</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="border-blue-100 shadow-sm mb-6">
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Tiêu đề công việc <span className="text-red-500">*</span>
                                </Label>
                                <Input id="title" name="title" placeholder="Nhập tiêu đề công việc" value={formData.title} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">
                                    Tên công ty <span className="text-red-500">*</span>
                                </Label>
                                <Input id="company" name="company" placeholder="Nhập tên công ty" value={formData.company} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="locationVI">Địa điểm</Label>
                                <Input id="locationVI" name="locationVI" placeholder="Hà Nội, Bắc Ninh, Hà Nam..." value={formData.locationVI} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <Label>Ngành nghề</Label>
                                <Select defaultValue={formData.groupJobFunctionV3Name} onValueChange={handleSelectChange("groupJobFunctionV3Name")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn ngành nghề" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {Object.entries(jobCategoriesMap).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-100 shadow-sm mb-6">
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Thông tin chi tiết</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="jobLevel">Cấp bậc </Label>
                                <Select defaultValue={formData.jobLevel} onValueChange={handleSelectChange("jobLevel")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn cấp bậc" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {Object.entries(experienceLevelsMap).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salary">Mức lương</Label>
                                <Input id="salary" name="salary" placeholder="Ví dụ: 15-20 triệu" value={formData.salary} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiredOn">Ngày hết hạn</Label>
                                <Input id="expiredOn" name="expiredOn" type="date" value={formData.expiredOn} onChange={handleChange} />
                            </div>
                        </div>
                        {job.jobSource === "admin" && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Mô tả công việc <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        className="min-h-[200px]"
                                        id="description"
                                        name="description"
                                        required
                                        placeholder="Nhập mô tả công việc"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jobRequirement">
                                        Yêu cầu công việc <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        className="min-h-[200px]"
                                        required
                                        id="jobRequirement"
                                        name="jobRequirement"
                                        placeholder="Nhập yêu cầu công việc"
                                        value={formData.jobRequirement}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="skills">
                                Kỹ năng yêu cầu (phân cách bằng dấu phẩy) <span className="text-red-500">*</span>
                            </Label>
                            <Input id="skills" required name="skills" placeholder="Ví dụ: JavaScript, React, Node.js" value={formData.skills} onChange={handleChange} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-100 shadow-sm mb-6">
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Thông tin bổ sung</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact">
                                Liên hệ ứng tuyển <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                className="min-h-[100px]"
                                required
                                id="contact"
                                name="contact"
                                placeholder="Ứng tuyển công việc vui lòng liên hệ Zalo, Facebook, liên kết hoặc mail"
                                value={formData.contact}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">URL nguồn công việc</Label>
                            <Input id="url" name="url" placeholder="Nhập URL nguồn công việc" value={formData.url} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyLogo">URL Logo công ty</Label>
                            <Input id="companyLogo" name="companyLogo" placeholder="Nhập URL logo công ty" value={formData.companyLogo} onChange={handleChange} />
                            {formData.companyLogo && (
                                <div className="mt-2">
                                    <p className="text-sm text-muted-foreground mb-1">Xem trước:</p>
                                    <div className="w-12 h-12 border rounded flex items-center justify-center bg-white p-1">
                                        <img
                                            src={formData.companyLogo}
                                            alt="Logo công ty"
                                            className="max-w-full max-h-full object-contain"
                                            onError={(e) => {
                                                e.target.src = "/company-default-logo.svg";
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                        <Link href={`/jobs/${id}`}>
                            <Button variant="outline" type="button">
                                Hủy
                            </Button>
                        </Link>
                        <Button type="submit" disabled={saving} className="flex items-center gap-1">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            <Save className="h-4 w-4 mr-1" />
                            Lưu thay đổi
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
