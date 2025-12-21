"use client";

import React, { useEffect, useRef } from "react";
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import { registerHiveLangLanguage, registerHiveLangTheme, registerHiveLangLightTheme } from "@/lib/monaco-hivelang";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";

interface HiveLangEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    className?: string;
    onMount?: (editor: any) => void;
}

export default function HiveLangEditor({
    value,
    onChange,
    className,
    onMount
}: HiveLangEditorProps) {
    const monaco = useMonaco();
    const { isDark } = useTheme();
    const editorRef = useRef<any>(null);

    useEffect(() => {
        if (monaco) {
            registerHiveLangLanguage(monaco);
            registerHiveLangTheme(monaco);
            registerHiveLangLightTheme(monaco);
        }
    }, [monaco]);

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        editorRef.current = editor;
        if (onMount) onMount(editor);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={className}
        >
            <Editor
                height="100%"
                defaultLanguage="hivelang"
                theme={isDark ? "hivelang-dark" : "hivelang-light"}
                value={value}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: true, side: "right", scale: 1 },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontLigatures: true,
                    lineNumbers: "on",
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    cursorSmoothCaretAnimation: "on",
                    cursorBlinking: "smooth",
                    smoothScrolling: true,
                    scrollbar: {
                        vertical: "visible",
                        horizontal: "visible",
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                    },
                    renderLineHighlight: "all",
                    folding: true,
                    lineHeight: 20,
                    letterSpacing: 0.5,
                }}
            />
        </motion.div>
    );
}
