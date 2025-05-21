"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Building, MapPin, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getJob } from "@/lib/api";

export default function JobDetail() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobDescription, setJobDescription] = useState(null);
    const [jobRequirements, setJobRequirements] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Fetch job data
    useEffect(() => {
        async function fetchJobData() {
            try {
                setLoading(true);
                const jobData = await getJob(id);
                setJob(jobData);

                // If job has URL, try to fetch detailed content
                if (jobData.url && jobData.jobSource !== "admin") {
                    fetchJobDetails(jobData.url);
                } else {
                    setJobDescription(jobData.description);
                    setJobRequirements(jobData.jobRequirement);
                }
            } catch (error) {
                console.error("Error fetching job:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchJobData();
        }
    }, [id]);

    // Fetch job details from the source URL
    const fetchJobDetails = async (url) => {
        try {
            setDetailLoading(true);
            const response = await fetch("/api/jobdetail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            const result = await response.json();
            if (result.success) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(result.data, "text/html");
                const sections = doc.querySelectorAll(".sc-1671001a-4.gDSEwb");

                if (sections && sections.length >= 2) {
                    const [jobDes, jobReq] = sections;
                    setJobDescription(jobDes);
                    setJobRequirements(jobReq);
                }
            }
        } catch (error) {
            console.error("Error fetching job details:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    // Handle image error
    const handleImageError = () => {
        setImgError(true);
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
                <Link href="/jobs">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Quay lại</span>
                    </Button>
                </Link>

                <div className="flex items-center gap-2">
                    <Link href={`/jobs/edit/${id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1 border-blue-200 text-blue-700">
                            <span>Chỉnh sửa</span>
                        </Button>
                    </Link>

                    {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                            <span>Mở trang gốc</span>
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </div>

            <Card className="mb-6 border-blue-100 shadow-sm">
                <CardHeader className="flex flex-row items-start gap-4 pb-2">
                    <div className="w-16 h-16 md:w-24 md:h-24 overflow-hidden rounded-lg flex items-center justify-center bg-white border border-gray-100 p-1">
                        <img
                            className="w-full h-full object-contain"
                            width={150}
                            height={150}
                            src={imgError ? "/company-default-logo.svg" : job.companyLogo || "/company-default-logo.svg"}
                            alt={job.company}
                            onError={handleImageError}
                        />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-blue-900 mb-2">{job.title}</h1>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center text-gray-700">
                                <Building className="h-4 w-4 mr-2 text-blue-600" />
                                <span>{job.company}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <MapPin className="h-4 w-4 mr-2 text-pink-600" />
                                <span>
                                    {job.locationVI || job.location} - {job.jobLevelVI || job.jobLevel}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-2 text-sm">
                        <div>
                            <span className="font-medium">Ngành nghề:</span>
                            <span className="ml-2">{job.groupJobFunctionV3NameVI || job.groupJobFunctionV3Name || "N/A"}</span>
                        </div>
                        <div>
                            <span className="font-medium">Mức lương:</span>
                            <span className="ml-2 font-semibold text-green-600">{job.salary || "Thỏa thuận"}</span>
                        </div>
                        <div>
                            <span className="font-medium">Cấp bậc:</span>
                            <span className="ml-2">{job.jobLevelVI || job.jobLevel || "N/A"}</span>
                        </div>
                        <div>
                            <span className="font-medium">Ngày hết hạn:</span>
                            <span className="ml-2">{job.expiredOn ? new Date(job.expiredOn).toLocaleDateString("vi-VN") : "N/A"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {job.skills && (
                <Card className="mb-6 border-blue-100 shadow-sm">
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Kỹ năng yêu cầu</h2>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                            {job.skills.split(",").map((skill, index) => {
                                const gradientClass = ["from-purple-500 to-indigo-500", "from-pink-500 to-purple-500", "from-orange-500 to-pink-500"][index % 3];
                                return (
                                    <Badge key={index} className={`bg-gradient-to-r ${gradientClass} text-white border-0 shadow-sm`}>
                                        {skill}
                                    </Badge>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
                {detailLoading ? (
                    <Card className="border-blue-100 shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Đang tải nội dung chi tiết...</p>
                        </CardContent>
                    </Card>
                ) : jobDescription || jobRequirements ? (
                    <>
                        {jobDescription && job.jobSource !== "admin" ? (
                            <Card className="border-blue-100 shadow-sm">
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">Mô tả công việc</h2>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: jobDescription.innerHTML }}></div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-blue-100 shadow-sm">
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">Mô tả công việc</h2>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm text-foreground/80  whitespace-pre-line">{jobDescription}</p>
                                </CardContent>
                            </Card>
                        )}

                        {jobRequirements && job.jobSource !== "admin" ? (
                            <Card className="border-blue-100 shadow-sm">
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">Yêu cầu công việc</h2>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: jobRequirements.innerHTML }}></div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-blue-100 shadow-sm">
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">Yêu cầu công việc</h2>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm text-foreground/80  whitespace-pre-line">{jobRequirements}</p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : job.url ? (
                    <Card className="border-blue-100 shadow-sm">
                        <CardContent className="py-8 text-center">
                            <p className="text-orange-500 font-medium mb-2">Không thể tải nội dung chi tiết từ nguồn gốc.</p>
                            <p className="text-sm text-muted-foreground">
                                Bạn có thể xem thông tin đầy đủ tại trang gốc bằng cách nhấp vào nút "Mở trang gốc" phía trên.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-blue-100 shadow-sm">
                        <CardContent className="py-8 text-center">
                            <p className="text-orange-500 font-medium">Công việc không có URL liên kết với nguồn gốc.</p>
                            <p className="text-sm text-muted-foreground mt-2">Không có thông tin chi tiết bổ sung.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
