"use client";
import { useState } from "react";
import Toolbar from "polotno/toolbar/toolbar";
import { Button, ButtonGroup } from "@blueprintjs/core";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import RightPanel from "./RightPanel";
import { FileText } from "lucide-react";

const TemplateManagementSheet = ({ store, currentTemplate, setCurrentTemplate, templateName, setTemplateName }) => {
    return (
        <Sheet>
            <SheetTrigger className="flex items-center justify-center gap-1 px-2 py-1 rounded-sm hover:bg-gray-100">
                <FileText size={16} />
                <span>CV Templates</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
                <SheetTitle className="text-xl font-bold p-2 bg-foreground/10">CV Templates</SheetTitle>
                <SheetDescription></SheetDescription>
                <RightPanel store={store} setCurrentTemplate={setCurrentTemplate} currentTemplate={currentTemplate} />
            </SheetContent>
        </Sheet>
    );
};

const TextFormattingToolbar = ({ store }) => {
    const selectedElement = store.selectedElements[0];
    const isText = selectedElement?.type === "text";

    const handleListFormat = (type) => {
        if (!isText) return;

        const text = selectedElement.text;
        const lines = text.split("\n");
        const formattedLines = lines.map((line, index) => {
            if (type === "ul") {
                return `• ${line}`;
            } else if (type === "ol") {
                return `${index + 1}. ${line}`;
            }
            return line;
        });

        selectedElement.set({
            text: formattedLines.join("\n"),
        });
    };

    if (!isText) return null;

    return (
        <ButtonGroup minimal={true}>
            <Button icon="list" onClick={() => handleListFormat("ul")} title="Unordered List" />
            <Button icon="numbered-list" onClick={() => handleListFormat("ol")} title="Ordered List" />
        </ButtonGroup>
    );
};

const CustomToolBar = ({ store, currentTemplate, setCurrentTemplate, templateName, setTemplateName }) => {
    return (
        <Toolbar
            store={store}
            components={{
                ImageRemoveBackground: () => null,
                TextAiWrite: () => null,
                TextFormatting: () => <TextFormattingToolbar store={store} />,
                ActionControls: () => (
                    <div className="flex items-center gap-2">
                        {/* Template info display */}
                        {currentTemplate && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-md">
                                <span className="text-sm text-blue-800">
                                    Đang chỉnh sửa: <strong>{currentTemplate.name}</strong>
                                </span>
                            </div>
                        )}

                        <TemplateManagementSheet
                            store={store}
                            currentTemplate={currentTemplate}
                            setCurrentTemplate={setCurrentTemplate}
                            templateName={templateName}
                            setTemplateName={setTemplateName}
                        />
                    </div>
                ),
            }}
        />
    );
};
export default CustomToolBar;
