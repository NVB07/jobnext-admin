import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        // Get URL from request body
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
        }

        // Fetch the job details from the original URL
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: "Failed to fetch job details" }, { status: response.status });
        }

        const data = await response.text();

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error in job detail API:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
