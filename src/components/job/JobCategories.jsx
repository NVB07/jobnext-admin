"use client";

import { useState, useEffect } from "react";
import { fetchJobCategories } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function JobCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const data = await fetchJobCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error loading job categories:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    // Tính tổng số lượng công việc
    const totalJobs = categories.reduce((sum, category) => sum + category.count, 0);

    // Tính phần trăm cho từng danh mục
    const calculatePercentage = (count) => {
        if (!totalJobs) return 0;
        return Math.round((count / totalJobs) * 100);
    };

    // Sắp xếp danh mục theo số lượng giảm dần
    const sortedCategories = [...categories].sort((a, b) => b.count - a.count);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Công việc theo ngành nghề</h1>
                <p className="text-muted-foreground">Hiển thị số lượng công việc theo từng ngành nghề </p>
            </div>

            {loading ? (
                <p className="text-center py-4">Đang tải dữ liệu...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {sortedCategories.map((category, index) => (
                            <Card key={index}>
                                <CardHeader className="">
                                    <CardTitle className="text-lg font-medium flex items-center justify-between">
                                        <span className="truncate">{category.categoryVI || category.category}</span>
                                        <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {calculatePercentage(category.count)}%
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{category.count} công việc</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Progress
                                        value={calculatePercentage(category.count)}
                                        className="h-2"
                                        style={{ "--indicator-color": `hsl(${(index * 25) % 360},70%,50%)` }}
                                    />
                                    {category.sampleJob && (
                                        <div className="flex flex-col text-sm mt-4">
                                            <div className="text-muted-foreground text-xs">Ví dụ:</div>
                                            <p className="mt-1 font-medium">{category.sampleJob.title}</p>
                                            <p className="text-muted-foreground">{category.sampleJob.company}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {!loading && categories.length === 0 && <p className="text-center py-4">Không có dữ liệu ngành nghề nào.</p>}
        </div>
    );
}
