"use client";

import dynamic from "next/dynamic";
import "react-markdown-editor-lite/lib/index.css";

// Tải động MarkdownEditor mà không dùng SSR
const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
    ssr: false, // Tắt server-side rendering
});

import MarkdownIt from "markdown-it";

// Khởi tạo parser Markdown
const mdParser = new MarkdownIt({ breaks: true });

const MDEditor = ({ value, onChange }) => {
    const handleEditorChange = ({ html, text }) => {
        if (onChange) onChange(text); // Truyền giá trị text lên parent component
    };

    const handleImageUpload = async (file, callback) => {
        try {
            const formData = new FormData();
            formData.append("image", file);
            const token = localStorage.getItem("adminToken");

            // Gửi yêu cầu upload ảnh
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/blogs/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.url) {
                    callback(data.url); // Chèn URL từ Cloudinary vào Markdown
                } else {
                    throw new Error("Không nhận được URL ảnh từ server");
                }
            } else {
                throw new Error("Upload ảnh thất bại");
            }
        } catch (error) {
            console.error("Lỗi tải ảnh:", error);
            alert("Không thể tải ảnh lên. Vui lòng thử lại!");
        }
    };

    return (
        <div className="w-full">
            <MdEditor
                value={value}
                style={{ height: "500px" }}
                renderHTML={(text) => mdParser.render(text)} // Render Markdown thành HTML
                onChange={handleEditorChange}
                placeholder="Viết nội dung blog..."
                onImageUpload={handleImageUpload}
                className="rounded-md overflow-hidden border"
            />
        </div>
    );
};

export default MDEditor;
