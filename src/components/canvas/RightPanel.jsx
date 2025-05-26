"use client";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { GET_METHOD, deleteCvTemplate } from "@/lib/api";
import { Trash, Edit } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const RightPanel = ({ store, setCurrentTemplate, currentTemplate }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const result = await GET_METHOD("admin/cvTemplate");
            if (result?.success) {
                setTemplates(result.data);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // Expose refresh function globally
    useEffect(() => {
        window.refreshTemplatesList = fetchTemplates;
        return () => {
            delete window.refreshTemplatesList;
        };
    }, []);

    const loadTemplate = (template) => {
        try {
            const jsonData = JSON.parse(template.json);
            store.loadJSON(jsonData);
            setCurrentTemplate(template);
        } catch (error) {
            console.error("Error loading template:", error);
            alert("Error loading template");
        }
    };

    const deleteTemplate = async (template) => {
        try {
            const result = await deleteCvTemplate(template._id);
            if (result?.success) {
                setTemplates(templates.filter((t) => t._id !== template._id));

                // Nếu đang chỉnh sửa template này thì clear
                if (currentTemplate && currentTemplate._id === template._id) {
                    setCurrentTemplate(null);
                    store.clear();
                    store.addPage({
                        width: 595.2755905511812,
                        height: 841.8897637795276,
                        unit: "cm",
                        dpi: 72,
                    });
                }
                alert("Template deleted successfully!");
            } else {
                alert("Error deleting template: " + result.error);
            }
        } catch (error) {
            console.error("Error deleting template:", error);
            alert("Error deleting template");
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading templates...</p>
            </div>
        );
    }

    return (
        <ScrollArea className="w-full relative h-screen">
            <div className="flex flex-col gap-4 p-2">
                {templates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No templates found</p>
                        <p className="text-sm">Create your first template using the canvas</p>
                    </div>
                ) : (
                    templates.map((template, index) => {
                        const isCurrentTemplate = currentTemplate && currentTemplate._id === template._id;

                        return (
                            <div key={template._id} className="flex justify-between gap-1">
                                <Button
                                    onClick={() => loadTemplate(template)}
                                    className={`flex-1 ${
                                        isCurrentTemplate
                                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                                            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        {isCurrentTemplate && <Edit size={16} />}
                                        <span className="truncate">{template.name || `Template ${index + 1}`}</span>
                                    </div>
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="icon" className="bg-red-500 hover:bg-red-600 text-white hover:text-white">
                                            <Trash size={16} />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to delete this template?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Deleting <span className="text-blue-500 font-semibold">{template.name || `Template ${index + 1}`}</span> cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => deleteTemplate(template)}
                                                className="bg-red-500 hover:bg-red-600 text-white hover:text-white"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        );
                    })
                )}
            </div>
        </ScrollArea>
    );
};

export default RightPanel;
