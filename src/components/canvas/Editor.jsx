"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Workspace } from "polotno/canvas/workspace";
import { SidePanel } from "polotno/side-panel";
import { PagesTimeline } from "polotno/pages-timeline";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import { createStore } from "polotno/model/store";
import { Tooltip } from "polotno/canvas/tooltip";
import { DEFAULT_SECTIONS } from "polotno/side-panel";
import { TemplatesSection, IconsSection, DownloadSection, LogoSection, TemplatesPanel, SaveTemplateSection, SaveTemplatePanel } from "./CustomSidePanel";
import CustomToolBar from "./CustomToolBar";
import { GET_METHOD } from "@/lib/api";
import "./CanvasStyle.css";

// Tạo store cho admin template management
const store = createStore({
    key: "",
});
store.addPage({
    width: 595.2755905511512,
    height: 841.8897637795276,
    unit: "cm",
    dpi: 72,
});

const Editor = () => {
    const [currentTemplate, setCurrentTemplate] = useState(null); // Template hiện tại đang chỉnh sửa
    const [templateName, setTemplateName] = useState(""); // Tên template
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");

    // Load template từ URL parameter
    useEffect(() => {
        const loadTemplateFromUrl = async () => {
            if (templateId) {
                setLoading(true);
                try {
                    const result = await GET_METHOD(`admin/cvTemplate`);
                    if (result?.success) {
                        const template = result.data.find((t) => t._id === templateId);
                        if (template) {
                            const jsonData = JSON.parse(template.json);
                            store.loadJSON(jsonData);
                            setCurrentTemplate(template);
                            setTemplateName(template.name || "");
                        }
                    }
                } catch (error) {
                    console.error("Error loading template:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadTemplateFromUrl();
    }, [templateId]);

    const customSections = [
        LogoSection,
        {
            ...TemplatesSection,
            Panel: (props) => <TemplatesPanel {...props} setCurrentTemplate={setCurrentTemplate} setTemplateName={setTemplateName} />,
        },
        {
            ...SaveTemplateSection,
            Panel: (props) => <SaveTemplatePanel {...props} currentTemplate={currentTemplate} setCurrentTemplate={setCurrentTemplate} />,
        },
        IconsSection,
        ...DEFAULT_SECTIONS.filter((section) => section.name !== "templates").filter((section) => section.name !== "photos"),
        DownloadSection,
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading template...</p>
            </div>
        );
    }

    return (
        <div className="relative flex h-screen w-full">
            <PolotnoContainer style={{ height: "100vh" }}>
                <SidePanelWrap>
                    <SidePanel store={store} sections={customSections} defaultSection="custom-templates" />
                </SidePanelWrap>
                <WorkspaceWrap>
                    <CustomToolBar
                        store={store}
                        currentTemplate={currentTemplate}
                        setCurrentTemplate={setCurrentTemplate}
                        templateName={templateName}
                        setTemplateName={setTemplateName}
                    />
                    <Workspace
                        store={store}
                        components={{
                            Tooltip,
                            TextAiWrite: () => null,
                        }}
                    />
                    <ZoomButtons store={store} />
                    <PagesTimeline store={store} />
                </WorkspaceWrap>
            </PolotnoContainer>
        </div>
    );
};

export default Editor;
