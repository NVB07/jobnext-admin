"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import MDEditor from "@/components/MDEditor";
import MDView from "@/components/MDView";
import { ArrowLeft, Save, Eye } from "lucide-react";

const CreateBlogPage = () => {
    const router = useRouter();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        tagsInput: "", // Thay đổi: lưu tags dưới dạng string
    });

    // Convert tags string to array when submitting
    const getTagsArray = () => {
        return formData.tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag);
    };

    // Create blog
    const handleCreateBlog = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Vui lòng nhập tiêu đề blog");
            return;
        }

        if (!formData.content.trim()) {
            toast.error("Vui lòng nhập nội dung blog");
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/blogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: formData.title,
                    content: formData.content,
                    tags: getTagsArray(), // Convert to array khi submit
                    authorUid: "admin", // Admin tự động là tác giả
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success("Tạo blog thành công");
                router.push("/blog"); // Quay về danh sách blog
            } else {
                const error = await response.json();
                toast.error(error.message || "Lỗi khi tạo blog");
            }
        } catch (error) {
            console.error("Error creating blog:", error);
            toast.error("Lỗi kết nối server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push("/blog")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Tạo Blog Mới</h1>
                        <p className="text-muted-foreground">Viết blog mới cho hệ thống</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                        <Eye className="w-4 h-4 mr-2" />
                        {showPreview ? "Ẩn Preview" : "Xem Preview"}
                    </Button>
                    <Button onClick={handleCreateBlog} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? "Đang lưu..." : "Lưu Blog"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin Blog</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="title">Tiêu đề *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Nhập tiêu đề blog..."
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                                <Input
                                    id="tags"
                                    value={formData.tagsInput}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, tagsInput: e.target.value }))}
                                    placeholder="react, javascript, tutorial..."
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Nội dung *</Label>
                            <div className="mt-2">
                                <MDEditor value={formData.content} onChange={(content) => setFormData((prev) => ({ ...prev, content }))} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview */}
                {showPreview && formData.content && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none">
                                <h1 className="mb-4">{formData.title || "Tiêu đề blog"}</h1>
                                <div className="flex gap-2 mb-6">
                                    {getTagsArray().map((tag, index) => (
                                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <MDView content={formData.content} />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CreateBlogPage;
