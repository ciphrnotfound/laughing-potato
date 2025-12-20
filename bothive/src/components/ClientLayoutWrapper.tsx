"use client";

import React, { useState, useEffect } from "react";
import FullPageLoader from "@/components/FullPageLoader";

export default function ClientLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowLoader(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {showLoader ? <FullPageLoader /> : children}
        </>
    );
}
