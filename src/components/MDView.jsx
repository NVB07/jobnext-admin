"use client";

import MarkdownIt from "markdown-it";
import "@/styles/markdown.css";

// Khởi tạo parser Markdown giống client
const mdParser = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true, // Giữ lại breaks: true
}).use((md) => {
    const defaultRender =
        md.renderer.rules.link_open ||
        function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];

        // Tìm xem có target chưa, nếu chưa thì thêm
        const targetAttr = token.attrs?.find((attr) => attr[0] === "target");
        if (!targetAttr) {
            token.attrPush(["target", "_blank"]);
        }

        // Thêm rel="noopener noreferrer" để bảo mật
        const relAttr = token.attrs?.find((attr) => attr[0] === "rel");
        if (!relAttr) {
            token.attrPush(["rel", "noopener noreferrer"]);
        }

        return defaultRender(tokens, idx, options, env, self);
    };
});

const MDView = ({ content }) => {
    const htmlContent = mdParser.render(content || "");

    return (
        <div className="section sec-html visible">
            <div className="custom-html-style prose prose-sm max-w-none !text-foreground" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
    );
};

export default MDView;
