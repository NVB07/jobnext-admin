import { NextResponse } from "next/server";

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if the request is for the cv-update route
    if (pathname.startsWith("/cv-update")) {
        // Get the admin token from cookies or headers
        const adminToken = request.cookies.get("adminToken")?.value || request.headers.get("authorization")?.replace("Bearer ", "");

        // If no token is found, redirect to 403 page
        if (!adminToken) {
            const forbiddenUrl = new URL("/403", request.url);
            return NextResponse.redirect(forbiddenUrl);
        }

        // You could add additional token validation here if needed
        // For now, we'll let the client-side AuthProvider handle detailed validation
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/cv-update/:path*"],
};
