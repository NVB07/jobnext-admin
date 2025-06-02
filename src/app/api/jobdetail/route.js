import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";

export async function POST(request) {
    try {
        // Get URL from request body
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
        }

        // Fetch the job details from the original URL with timeout and compression
        const response = await fetch(url, {
            timeout: 10000, // 10 seconds timeout
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept-Encoding": "gzip, deflate, br",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to fetch job details",
                },
                { status: response.status }
            );
        }

        const data = await response.text();

        // Parse HTML using JSDOM for server-side processing
        const dom = new JSDOM(data);
        const document = dom.window.document;

        // Extract only the necessary content
        const sections = document.querySelectorAll(".sc-1671001a-4.gDSEwb");

        if (!sections || sections.length < 2) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Không tìm thấy nội dung chi tiết",
                },
                { status: 404 }
            );
        }

        const [jobDesSection, jobReqSection] = sections;

        // Extract job description and requirements
        const jobDesContent = jobDesSection.querySelector(".sc-1671001a-6.dVvinc");
        const jobReqContent = jobReqSection.querySelector(".sc-1671001a-6.dVvinc");

        if (!jobDesContent || !jobReqContent) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Không tìm thấy nội dung chi tiết",
                },
                { status: 404 }
            );
        }

        // Process content on server side
        const processContent = (htmlContent) => {
            return htmlContent
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<\/p>/gi, "\n")
                .replace(/<[^>]+>/g, "")
                .trim();
        };

        const jobDescription = processContent(jobDesContent.innerHTML);
        const jobRequirements = processContent(jobReqContent.innerHTML);

        return NextResponse.json(
            {
                success: true,
                data: {
                    jobDescription,
                    jobRequirements,
                },
            },
            {
                status: 200,
                headers: {
                    "Cache-Control": "public, max-age=3600", // Cache for 1 hour
                },
            }
        );
    } catch (error) {
        console.error("Error in job detail API:", error);

        if (error.code === "ECONNABORTED") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Timeout khi tải thông tin chi tiết",
                },
                { status: 408 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}
