"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchCvTemplates } from "@/lib/api";
import Link from "next/link";
export default function CVTemplate() {
    const [templates, setTemplates] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                setLoading(true);
                const data = await fetchCvTemplates();
                console.log("CV Templates data:", data);
                setTemplates(data.templates || []);
            } catch (error) {
                console.error("Error loading CV templates:", error);
            } finally {
                setLoading(false);
            }
        };

        loadTemplates();
    }, []);

    // Filter templates based on search term
    const filteredTemplates = templates.filter((template) => {
        const searchLower = searchTerm.toLowerCase();
        return (template.name || "").toLowerCase().includes(searchLower);
    });

    const handleImageClick = (template) => {
        setSelectedTemplate(template);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedTemplate(null);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý CV mẫu</h1>
                <p className="text-muted-foreground">Quản lý tất cả các mẫu CV trong hệ thống</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Tìm kiếm mẫu CV..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link target="_blank" href="/cv-update">
                        <Button size="sm" className="h-9 gap-1">
                            <Plus className="h-4 w-4" />
                            Trình quản lý CV
                        </Button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardHeader className="pb-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="aspect-[3/4] bg-gray-200 rounded-md"></div>
                            </CardContent>
                            <CardFooter className="pt-3">
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy mẫu CV nào</h3>
                    <p className="text-gray-500 mb-4">Hãy thử tìm kiếm với từ khóa khác hoặc thêm mẫu CV mới.</p>
                    <Button onClick={() => router.push("/cv-update")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Trình quản lý CV
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTemplates.map((template, index) => (
                        <Card key={template._id || index} className="group hover:shadow-lg transition-shadow duration-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <h3 className="font-medium text-sm truncate">{template.name || "N/A"}</h3>
                                </div>
                                <Badge variant="secondary" className="w-fit text-xs">
                                    #{index + 1}
                                </Badge>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="aspect-[3/4] rounded-md overflow-hidden border bg-gray-50">
                                    {template.preview ? (
                                        <img
                                            src={template.preview}
                                            alt={template.name || "CV Preview"}
                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                            onClick={() => handleImageClick(template)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FileText className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-3">
                                <span className="text-xs text-muted-foreground">
                                    {template.createdAt ? new Date(template.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                                </span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dialog for viewing CV template image */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            {selectedTemplate?.name || "CV Template"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-6 pb-6">
                        {selectedTemplate?.preview ? (
                            <div className="flex justify-center">
                                <img
                                    src={selectedTemplate.preview}
                                    alt={selectedTemplate.name || "CV Preview"}
                                    className="max-w-full max-h-[70vh] object-contain rounded-md border"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
                                <FileText className="h-16 w-16 text-gray-400" />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
