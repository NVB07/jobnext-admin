"use client";

import dynamic from "next/dynamic";

const LoadingAnimation = () => {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-purple-600 text-xl font-medium">Đang tải CV Editor...</div>
        </div>
    );
};

// Sử dụng dynamic import đúng cách với timeout để đảm bảo loading hiển thị
const Editor = dynamic(
    () => {
        // Thêm delay nhân tạo để đảm bảo loading hiển thị
        return Promise.all([
            import("@/components/canvas/Editor"),
            new Promise((resolve) => setTimeout(resolve, 100)), // Đảm bảo loading hiển thị ít nhất 500ms
        ]).then(([moduleExports]) => moduleExports.default);
    },
    {
        ssr: false,
        loading: () => <LoadingAnimation />,
    }
);

export default function EditorLayout() {
    return (
        <div className="w-full ">
            <Editor />
        </div>
    );
}
