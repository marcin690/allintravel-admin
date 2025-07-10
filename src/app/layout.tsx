import './globals.css';
import React from "react";
import {ToastContainer} from "react-toastify";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pl">
        <body>

        {children}
        <ToastContainer position="top-right" autoClose={3000} />
        </body>
        </html>
    );
}