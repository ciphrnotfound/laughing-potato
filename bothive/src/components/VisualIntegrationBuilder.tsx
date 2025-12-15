"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Eye, Code as CodeIcon } from "lucide-react";
import { generateHiveLangFromVisual, type VisualIntegration, type VisualCapability } from "@/lib/hivelang/generator";

interface VisualBuilderProps {
    onCodeGenerated: (code: string) => void;
}

export function VisualIntegrationBuilder({ onCodeGenerated }: VisualBuilderProps) {
    const { isDark } = useTheme();

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("other");
    const [authType, setAuthType] = useState<"api_key" | "oauth2" | "none">("api_key");
    const [baseUrl, setBaseUrl] = useState("");

    // Capabilities
    const [capabilities, setCapabilities] = useState<VisualCapability[]>([]);
    const [editingCapability, setEditingCapability] = useState<VisualCapability | null>(null);

    // Capability form
    const [capName, setCapName] = useState("");
    const [capDescription, setCapDescription] = useState("");
    const [capMethod, setCapMethod] = useState<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">("GET");
    const [capUrl, setCapUrl] = useState("");
    const [capParams, setCapParams] = useState<Array<{ name: string; type: "string" | "number" | "boolean" | "object"; required: boolean }>>([]);
    const [capHeaders, setCapHeaders] = useState<Array<{ key: string; value: string }>>([
        { key: "Content-Type", value: "application/json" }
    ]);

    const textPrimary = isDark ? "text-white" : "text-gray-900";
    const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
    const bgInput = isDark
        ? "bg-white/5 border-white/10 text-white"
        : "bg-white border-gray-200 text-gray-900";

    const handleAddParameter = () => {
        setCapParams([...capParams, { name: "", type: "string", required: true }]);
    };

    const handleRemoveParameter = (index: number) => {
        setCapParams(capParams.filter((_, i) => i !== index));
    };

    const handleAddCapability = () => {
        if (!capName || !capUrl) {
            alert("Capability name and URL are required");
            return;
        }

        const newCapability: VisualCapability = {
            name: capName,
            description: capDescription,
            http_method: capMethod,
            endpoint_url: capUrl,
            params: capParams.filter(p => p.name),
            headers: capHeaders.filter(h => h.key),
            response_mapping: {
                return_type: "object"
            }
        };

        setCapabilities([...capabilities, newCapability]);

        // Reset form
        setCapName("");
        setCapDescription("");
        setCapUrl("");
        setCapParams([]);
        setCapHeaders([{ key: "Content-Type", value: "application/json" }]);
    };

    const handleGenerateCode = () => {
        if (!name || capabilities.length === 0) {
            alert("Integration name and at least one capability are required");
            return;
        }

        const config: VisualIntegration = {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '_'),
            description,
            category,
            auth_type: authType,
            base_url: baseUrl,
            capabilities
        };

        const code = generateHiveLangFromVisual(config);
        onCodeGenerated(code);
    };

    return (
        <div className="space-y-6">
            {/* Basic Info */}
            <div className={cn("p-6 rounded-2xl border", isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200")}>
                <h3 className={cn("text-lg font-semibold mb-4", textPrimary)}>
                    Basic Information
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                            Integration Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Weather API"
                            className={cn("w-full px-4 py-3 rounded-xl border", bgInput)}
                        />
                    </div>

                    <div>
                        <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Get weather forecasts and current conditions"
                            rows={2}
                            className={cn("w-full px-4 py-3 rounded-xl border resize-none", bgInput)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={cn("w-full px-4 py-3 rounded-xl border", bgInput)}
                            >
                                <option value="productivity">Productivity</option>
                                <option value="communication">Communication</option>
                                <option value="data">Data & Analytics</option>
                                <option value="developer_tools">Developer Tools</option>
                                <option value="payments">Payments</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                Authentication
                            </label>
                            <select
                                value={authType}
                                onChange={(e) => setAuthType(e.target.value as any)}
                                className={cn("w-full px-4 py-3 rounded-xl border", bgInput)}
                            >
                                <option value="api_key">API Key</option>
                                <option value="oauth2">OAuth 2.0</option>
                                <option value="none">None</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                            Base URL (Optional)
                        </label>
                        <input
                            type="text"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder="https://api.example.com/v1"
                            className={cn("w-full px-4 py-3 rounded-xl border", bgInput)}
                        />
                    </div>
                </div>
            </div>

            {/* Capabilities */}
            <div className={cn("p-6 rounded-2xl border", isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200")}>
                <h3 className={cn("text-lg font-semibold mb-4", textPrimary)}>
                    Capabilities ({capabilities.length})
                </h3>

                {/* Existing Capabilities */}
                {capabilities.length > 0 && (
                    <div className="space-y-2 mb-6">
                        {capabilities.map((cap, i) => (
                            <div
                                key={i}
                                className={cn("p-4 rounded-xl border", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200")}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <code className={cn("text-sm font-mono", textPrimary)}>{cap.name}</code>
                                        <p className={cn("text-xs mt-1", textSecondary)}>
                                            {cap.http_method} {cap.endpoint_url}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setCapabilities(capabilities.filter((_, idx) => idx !== i))}
                                        className={cn("p-2 rounded-lg", textSecondary, "hover:text-red-500")}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Capability Form */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                Capability Name
                            </label>
                            <input
                                type="text"
                                value={capName}
                                onChange={(e) => setCapName(e.target.value)}
                                placeholder="get_weather"
                                className={cn("w-full px-4 py-3 rounded-xl border", bgInput)}
                            />
                        </div>

                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                HTTP Method
                            </label>
                            <select
                                value={capMethod}
                                onChange={(e) => setCapMethod(e.target.value as any)}
                                className={cn("w-full px-4 py-3 rounded-xl border", bgInput)}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="PATCH">PATCH</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                            Endpoint URL
                        </label>
                        <input
                            type="text"
                            value={capUrl}
                            onChange={(e) => setCapUrl(e.target.value)}
                            placeholder="/weather?city={'{city}'}"
                            className={cn("w-full px-4 py-3 rounded-xl border", bgInput)}
                        />
                        <p className={cn("text-xs mt-1", textSecondary)}>
                            Use {'{parameter_name}'} for dynamic values
                        </p>
                    </div>

                    <div>
                        <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                            Parameters
                        </label>
                        {capParams.map((param, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={param.name}
                                    onChange={(e) => {
                                        const updated = [...capParams];
                                        updated[i].name = e.target.value;
                                        setCapParams(updated);
                                    }}
                                    placeholder="Parameter name"
                                    className={cn("flex-1 px-4 py-2 rounded-xl border", bgInput)}
                                />
                                <button
                                    onClick={() => handleRemoveParameter(i)}
                                    className={cn("px-3 rounded-xl", textSecondary, "hover:text-red-500")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={handleAddParameter}
                            className={cn("text-sm flex items-center gap-2 mt-2", textSecondary, "hover:opacity-70")}
                        >
                            <Plus className="w-4 h-4" />
                            Add Parameter
                        </button>
                    </div>

                    <button
                        onClick={handleAddCapability}
                        className={cn(
                            "w-full px-6 py-3 rounded-xl font-medium transition-all",
                            isDark ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"
                        )}
                    >
                        <Plus className="w-4 h-4 inline mr-2" />
                        Add Capability
                    </button>
                </div>
            </div>

            {/* Generate Code Button */}
            <button
                onClick={handleGenerateCode}
                disabled={!name || capabilities.length === 0}
                className={cn(
                    "w-full px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                    "bg-purple-600 text-white hover:bg-purple-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
            >
                <CodeIcon className="w-5 h-5" />
                Generate HiveLang Code
            </button>
        </div>
    );
}
