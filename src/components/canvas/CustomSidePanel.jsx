"use client";
const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL;

import { useState, useEffect } from "react";
import React from "react";
import { observer } from "mobx-react-lite";

import { SectionTab } from "polotno/side-panel";
import MdPhotoLibrary from "@meronex/icons/md/MdPhotoLibrary";

import ReactDOMServer from "react-dom/server";

import { FaDownload, FaIcons } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";

import * as Fa5Icons from "react-icons/fa";
import * as FcIcons from "react-icons/fc";
import * as Fa6Icons from "react-icons/fa6";
import * as BsIcons from "react-icons/bs";
import * as AiIcons from "react-icons/ai";
import * as DiIcons from "react-icons/di";
import * as MdIcons from "react-icons/md";
import * as Hi2Icons from "react-icons/hi2";
import * as Io5Icons from "react-icons/io5";

import { GET_METHOD, createCvTemplate, updateCvTemplate } from "@/lib/api";

const allIcons = {
    ...FcIcons,
    ...Fa5Icons,
    ...Fa6Icons,
    ...BsIcons,
    ...AiIcons,
    ...DiIcons,
    ...MdIcons,
    ...Hi2Icons,
    ...Io5Icons,
};

export const LogoPanel = observer(() => {
    return;
});

export const LogoSection = {
    name: "logo",
    Tab: () => (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: 5 }}>
            <a target="_blank" href={MAIN_URL}>
                <img src="/logo.png" style={{ width: 40, height: 40, borderRadius: 8, boxShadow: "0 0 25px #000" }} />
            </a>
        </div>
    ),
    Panel: LogoPanel,
};

export const TemplatesPanel = observer(({ store, setCurrentTemplate, setTemplateName }) => {
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const result = await GET_METHOD("admin/cvTemplate");
            if (result?.success) {
                setTemplates(result.data);
            }
        };
        fetchData();
    }, []);

    const applyTemplate = (template) => {
        const jsonReal = JSON.parse(template.json);
        store.loadJSON(jsonReal);
        setCurrentTemplate(template);
        setTemplateName(template.name || "");
    };

    const createNewTemplate = () => {
        // Admin tạo template mới để chỉnh sửa
        store.clear();
        store.addPage({
            width: 595.2755905511812,
            height: 841.8897637795276,
            unit: "cm",
            dpi: 72,
        });
        setCurrentTemplate(null);
        setTemplateName("");
    };

    return (
        <div style={{ height: "100%" }}>
            <div className="grid grid-cols-2 gap-2">
                <button title="Create New Template" onClick={createNewTemplate} className="border shadow rounded-md hover:shadow-slate-600">
                    <img src={"/addnew.png"} alt="template" className="border-b rounded-t-md" />
                    <p className="m-0 py-1">New Template</p>
                </button>
                {templates.map((item, index) => {
                    return (
                        <button title={item?.name} onClick={() => applyTemplate(item)} className="border shadow rounded-md hover:shadow-slate-600" key={index}>
                            <img src={item.preview} alt="template" className="border-b rounded-t-md" />
                            {item?.name ? (
                                <p className="m-0 py-1">{item?.name?.length > 15 ? item?.name?.slice(0, 15) + "..." : item?.name}</p>
                            ) : (
                                <p className="m-0 py-1">Template {index + 1}</p>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

// define the new custom section
export const TemplatesSection = {
    name: "custom-templates",
    Tab: (props) => (
        <SectionTab name="Templates" {...props}>
            <div style={{ width: "100%", display: "flex", justifyContent: "center", fontSize: 24 }}>
                <MdPhotoLibrary />
            </div>
        </SectionTab>
    ),
    Panel: TemplatesPanel,
};

export const IconsPanel = observer(({ store }) => {
    const addIconToCanvas = (name, Icon) => {
        // Tạo SVG string từ component Lucide
        const svgString = ReactDOMServer.renderToString(<Icon size={100} strokeWidth={1.5} stroke="transparent" />);

        // Chuyển đổi thành data URL
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

        const activePage = store.activePage;

        // Thêm element SVG vào page
        activePage.addElement({
            type: "svg",
            src: dataUrl,
            width: 50,
            height: 50,
            x: 200, // Đặt trung tâm vào vị trí con trỏ
            y: 200,
            name: `icon-${name}`,
        });
    };

    // Số lượng icon hiển thị trên mỗi trang
    const [iconsPerPage] = useState(100);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    // Lọc icon theo tên nếu có tìm kiếm
    const filteredIcons = Object.entries(allIcons).filter(([name, _]) => name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Phân trang icons
    const startIndex = currentPage * iconsPerPage;
    const displayedIcons = filteredIcons.slice(startIndex, startIndex + iconsPerPage);

    return (
        <div className="flex flex-col h-full">
            {/* Thanh tìm kiếm */}
            <div className="p-2 border-b">
                <input
                    type="text"
                    placeholder="Tìm icon..."
                    className="w-full p-2 border rounded"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(0); // Reset về trang đầu khi tìm kiếm
                    }}
                />
            </div>

            {/* Grid hiển thị icons */}
            <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-4 gap-1 p-2">
                    {displayedIcons.map(([name, Icon]) => (
                        <div
                            title={name}
                            key={name}
                            className="border rounded p-2 flex items-center justify-center cursor-pointer hover:bg-slate-300"
                            onClick={() => addIconToCanvas(name, Icon)}
                        >
                            <Icon size={32} color="#666" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Điều hướng phân trang */}
            {filteredIcons.length > iconsPerPage && (
                <div className="p-2 border-t flex justify-between items-center">
                    <button
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    >
                        Trước
                    </button>
                    <span>
                        Trang {currentPage + 1} / {Math.ceil(filteredIcons.length / iconsPerPage)}
                    </span>
                    <button
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        disabled={(currentPage + 1) * iconsPerPage >= filteredIcons.length}
                        onClick={() =>
                            setCurrentPage((prev) => {
                                const maxPage = Math.ceil(filteredIcons.length / iconsPerPage) - 1;
                                return Math.min(maxPage, prev + 1);
                            })
                        }
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
});

export const IconsSection = {
    name: "custom-icons",
    Tab: (props) => (
        <SectionTab name="Icons" {...props}>
            <div style={{ width: "100%", display: "flex", justifyContent: "center", fontSize: 24 }}>
                <FaIcons />
            </div>
        </SectionTab>
    ),
    // we need observer to update component automatically on any store changes
    Panel: IconsPanel,
};

export const DownloadPanel = observer(({ store }) => {
    const allPage = store.pages.length;
    const pagesArray = Array.from({ length: allPage }, (_, index) => store.pages[index].id);
    const [selectedPages, setSelectedPages] = useState(pagesArray);

    const isAllSelected = selectedPages.length === allPage;

    const handleCheckboxChange = (id) => {
        setSelectedPages((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedPages([]); // bỏ chọn tất cả
        } else {
            setSelectedPages(pagesArray); // chọn tất cả
        }
    };

    const downloadPDF = async () => {
        await store.saveAsPDF({ pixelRatio: 5, fileName: "myCV.pdf", pageIds: selectedPages });
    };
    const downloadPNG = async () => {
        await store.saveAsImage({ pixelRatio: 5, fileName: "myCV.png", pageIds: selectedPages });
    };

    const downloadJSON = () => {
        const json = store.toJSON();
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "design.json"; // Tên file muốn lưu
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    return (
        <div style={{ width: "100%" }}>
            <div className="w-full flex flex-col p-3 border-2 rounded-lg mb-3">
                <p className="font-bold">Chọn trang tải xuống</p>
                <label className="flex items-center mt-1">
                    <input type="checkbox" className="mr-1" checked={isAllSelected} onChange={handleSelectAll} />
                    Chọn tất cả
                </label>
                {pagesArray.map((id, index) => (
                    <label key={id} className="flex items-center mt-1">
                        <input type="checkbox" className="mr-1" checked={selectedPages.includes(id)} onChange={() => handleCheckboxChange(id)} />
                        Trang {index + 1}
                    </label>
                ))}
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 5 }}>
                <button onClick={downloadJSON} style={{ width: "100%", background: "green", padding: 5, borderRadius: 8, color: "white" }}>
                    Xuất Json
                </button>
                <button onClick={downloadPNG} style={{ width: "100%", background: "green", padding: 10, borderRadius: 8, color: "white" }}>
                    Tải xuống PNG
                </button>
                <button onClick={downloadPDF} style={{ width: "100%", background: "blue", padding: 10, borderRadius: 8, color: "white" }}>
                    Tải xuống PDF
                </button>
            </div>
        </div>
    );
});

export const DownloadSection = {
    name: "download",
    Tab: (props) => (
        <SectionTab name="download" {...props}>
            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", fontSize: 24, color: "blue" }}>
                <FaDownload />
            </div>
        </SectionTab>
    ),
    // we need observer to update component automatically on any store changes
    Panel: DownloadPanel,
};

// Save Template Panel
export const SaveTemplatePanel = observer(({ store, currentTemplate, setCurrentTemplate }) => {
    const [templateName, setTemplateName] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Reset form when currentTemplate changes
    useEffect(() => {
        if (currentTemplate) {
            setTemplateName(currentTemplate.name || "");
            setPreviewImage(currentTemplate.preview || null);
        } else {
            setTemplateName("");
            setPreviewImage(null);
        }
        setPreviewFile(null);
    }, [currentTemplate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateAutoPreview = async () => {
        try {
            const dataURL = await store.pages[0].store.toDataURL({ pixelRatio: 1 });
            setPreviewImage(dataURL);
            setPreviewFile(null);
        } catch (error) {
            console.error("Error generating preview:", error);
            alert("Lỗi khi tạo preview tự động");
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateName.trim()) {
            alert("Vui lòng nhập tên template!");
            return;
        }

        if (!previewImage) {
            alert("Vui lòng chọn ảnh preview hoặc tạo preview tự động!");
            return;
        }

        setIsSaving(true);
        try {
            const json = store.toJSON();

            const templateData = {
                json: JSON.stringify(json),
                preview: previewImage,
                name: templateName.trim(),
            };

            let result;
            if (currentTemplate) {
                // Cập nhật template có sẵn
                result = await updateCvTemplate(currentTemplate._id, templateData);
            } else {
                // Tạo template mới
                result = await createCvTemplate(templateData);
            }

            if (result.success) {
                alert(currentTemplate ? "Cập nhật template thành công!" : "Lưu template thành công!");
                if (!currentTemplate) {
                    setCurrentTemplate(result.data);
                }

                // Refresh templates list in RightPanel and TemplatesPanel
                if (window.refreshTemplatesList) {
                    window.refreshTemplatesList();
                }

                setShowModal(false);
                // Reset form
                setTemplateName("");
                setPreviewImage(null);
                setPreviewFile(null);
            } else {
                alert("Lỗi khi lưu template: " + result.error);
            }
        } catch (error) {
            console.error("Error saving template:", error);
            alert("Lỗi khi lưu template");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ height: "100%", padding: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
                <h3 style={{ margin: 0, textAlign: "center", color: "#333" }}>{currentTemplate ? "Cập nhật Template" : "Lưu Template Mới"}</h3>

                {/* Current Template Info */}
                {currentTemplate && (
                    <div style={{ padding: "12px", backgroundColor: "#f0f8ff", borderRadius: "8px", border: "1px solid #ddd" }}>
                        <p style={{ margin: "0 0 8px 0", fontWeight: "bold", color: "#333" }}>Template hiện tại:</p>
                        <p style={{ margin: 0, color: "#666" }}>{currentTemplate.name}</p>
                    </div>
                )}

                {/* Template Name Input */}
                <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>Tên Template:</label>
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Nhập tên template..."
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                        }}
                    />
                </div>

                {/* Preview Image Section */}
                <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>Ảnh Preview:</label>

                    {/* Preview Display */}
                    {previewImage && (
                        <div style={{ marginBottom: "12px" }}>
                            <img
                                src={previewImage}
                                alt="Preview"
                                style={{
                                    width: "100%",
                                    maxHeight: "200px",
                                    objectFit: "contain",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                }}
                            />
                        </div>
                    )}

                    {/* Image Upload */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            marginBottom: "8px",
                        }}
                    />

                    {/* Auto Generate Preview Button */}
                    <button
                        onClick={generateAutoPreview}
                        style={{
                            width: "100%",
                            padding: "8px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6268")}
                        onMouseOut={(e) => (e.target.style.backgroundColor = "#6c757d")}
                    >
                        Tạo Preview Tự Động
                    </button>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSaveTemplate}
                    disabled={isSaving || !templateName.trim() || !previewImage}
                    style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: currentTemplate ? "#007bff" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: isSaving ? "not-allowed" : "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        opacity: isSaving || !templateName.trim() || !previewImage ? 0.6 : 1,
                    }}
                    onMouseOver={(e) => {
                        if (!isSaving && templateName.trim() && previewImage) {
                            e.target.style.backgroundColor = currentTemplate ? "#0056b3" : "#218838";
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!isSaving && templateName.trim() && previewImage) {
                            e.target.style.backgroundColor = currentTemplate ? "#007bff" : "#28a745";
                        }
                    }}
                >
                    {isSaving ? "Đang lưu..." : currentTemplate ? "Cập Nhật Template" : "Lưu Template"}
                </button>

                {/* Instructions */}
                <div
                    style={{
                        padding: "12px",
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffeaa7",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#856404",
                    }}
                >
                    <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>Hướng dẫn:</p>
                    <ul style={{ margin: 0, paddingLeft: "16px" }}>
                        <li>Nhập tên cho template</li>
                        <li>Chọn ảnh preview hoặc dùng &quot;Tạo Preview Tự Động&quot;</li>
                        <li>Click &quot;Lưu Template&quot; để hoàn tất</li>
                    </ul>
                </div>
            </div>
        </div>
    );
});

export const SaveTemplateSection = {
    name: "save-template",
    Tab: (props) => (
        <SectionTab name="Save Template" {...props}>
            <div style={{ width: "100%", display: "flex", justifyContent: "center", fontSize: 24 }}>
                <FaSave />
            </div>
        </SectionTab>
    ),
    Panel: SaveTemplatePanel,
};
