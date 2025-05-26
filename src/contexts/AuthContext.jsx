"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { verifyAdminToken, adminLogout } from "@/lib/api";
import { useRouter } from "next/navigation";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            const result = await verifyAdminToken();
            if (result.success) {
                setAdmin(result.data.admin);
                setIsAuthenticated(true);
            } else {
                setAdmin(null);
                setIsAuthenticated(false);
                // Clear any invalid tokens
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminEmail");
                deleteCookie("adminToken");
            }
        } catch (error) {
            console.error("Auth check error:", error);
            setAdmin(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = (token, adminData) => {
        // Store in localStorage for client-side access
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminEmail", adminData.email);

        // Store in cookies for middleware access
        setCookie("adminToken", token, 7); // 7 days expiry

        setAdmin(adminData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await adminLogout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setAdmin(null);
            setIsAuthenticated(false);
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminEmail");
            deleteCookie("adminToken");
            router.push("/login");
        }
    };

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Set up token refresh interval (optional)
    useEffect(() => {
        if (isAuthenticated) {
            const interval = setInterval(() => {
                checkAuth();
            }, 5 * 60 * 1000); // Check every 5 minutes

            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const value = {
        admin,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
