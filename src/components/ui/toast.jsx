"use client";

import React, { useState, useEffect } from "react";
import { createContext, useContext } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

// Toast context
const ToastContext = createContext({});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = "default", duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { id, message, type, duration };
        setToasts((currentToasts) => [...currentToasts, newToast]);
    };

    const removeToast = (id) => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    };

    const toast = {
        success: (message, duration) => addToast(message, "success", duration),
        error: (message, duration) => addToast(message, "error", duration),
        warning: (message, duration) => addToast(message, "warning", duration),
        info: (message, duration) => addToast(message, "info", duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-0 left-0 z-50 p-4 space-y-2 w-full max-w-sm">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ toast, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, toast.duration);

        return () => clearTimeout(timer);
    }, [toast.duration, onClose]);

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        default: <Info className="h-5 w-5 text-gray-500" />,
    };

    const bgColors = {
        success: "bg-green-50 border-green-200",
        error: "bg-red-50 border-red-200",
        warning: "bg-yellow-50 border-yellow-200",
        info: "bg-blue-50 border-blue-200",
        default: "bg-white border-gray-200",
    };

    return (
        <div className={`w-full rounded-md border shadow-sm p-4 ${bgColors[toast.type]} animate-slide-in`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    {icons[toast.type]}
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-200 transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default Toast;
