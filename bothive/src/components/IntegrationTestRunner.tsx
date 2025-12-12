"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { Play, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface TestRunnerProps {
    hiveLangCode: string;
    onTestComplete?: (success: boolean) => void;
}

export function IntegrationTestRunner({ hiveLangCode, onTestComplete }: TestRunnerProps) {
    const { isDark } = useTheme();

    // Extract capabilities from code
    const capabilities = extractCapabilities(hiveLangCode);

    const [selectedCapability, setSelectedCapability] = useState(capabilities[0]?.name || "");
    const [params, setParams] = useState<Record<string, string>>({});
    const [testCredentials, setTestCredentials] = useState({
        api_key: "",
        access_token: "",
    });

    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);

    const textPrimary = isDark ? "text-white" : "text-gray-900";
    const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
    const bgInput = isDark
        ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400";

    const selectedCap = capabilities.find(c => c.name === selectedCapability);

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const response = await fetch("/api/integrations/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hivelang_code: hiveLangCode,
                    capability: selectedCapability,
                    params,
                    test_credentials: testCredentials,
                }),
            });

            const result = await response.json();
            setTestResult(result);

            if (onTestComplete) {
                onTestComplete(result.success);
            }
        } catch (error: any) {
            setTestResult({
                success: false,
                error: "Network Error",
                message: error.message,
            });
        } finally {
            setTesting(false);
        }
    };

    if (!capabilities.length) {
        return (
            <div className={cn("p-6 rounded-xl border text-center", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200")}>
                <p className={cn("text-sm", textSecondary)}>
                    No capabilities found. Add @capability annotations to your code.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Capability Selector */}
            <div>
                <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                    Test Capability
                </label>
                <select
                    value={selectedCapability}
                    onChange={(e) => {
                        setSelectedCapability(e.target.value);
                        setParams({});
                        setTestResult(null);
                    }}
                    className={cn("w-full px-4 py-3 rounded-xl border", bgInput)}
                >
                    {capabilities.map((cap) => (
                        <option key={cap.name} value={cap.name}>
                            {cap.name}({cap.params.join(", ")})
                        </option>
                    ))}
                </select>
            </div>

            {/* Test Credentials */}
            <div className={cn("p-4 rounded-xl border", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200")}>
                <h4 className={cn("text-sm font-medium mb-3", textPrimary)}>
                    Test Credentials
                </h4>
                <div className="space-y-3">
                    <input
                        type="text"
                        value={testCredentials.api_key}
                        onChange={(e) => setTestCredentials({ ...testCredentials, api_key: e.target.value })}
                        placeholder="API Key (optional)"
                        className={cn("w-full px-3 py-2 rounded-lg border text-sm", bgInput)}
                    />
                    <input
                        type="text"
                        value={testCredentials.access_token}
                        onChange={(e) => setTestCredentials({ ...testCredentials, access_token: e.target.value })}
                        placeholder="Access Token (optional)"
                        className={cn("w-full px-3 py-2 rounded-lg border text-sm", bgInput)}
                    />
                </div>
            </div>

            {/* Parameters */}
            {selectedCap && selectedCap.params.length > 0 && (
                <div className={cn("p-4 rounded-xl border", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200")}>
                    <h4 className={cn("text-sm font-medium mb-3", textPrimary)}>
                        Parameters
                    </h4>
                    <div className="space-y-3">
                        {selectedCap.params.map((param) => (
                            <div key={param}>
                                <label className={cn("block text-xs mb-1", textSecondary)}>
                                    {param}
                                </label>
                                <input
                                    type="text"
                                    value={params[param] || ""}
                                    onChange={(e) => setParams({ ...params, [param]: e.target.value })}
                                    placeholder={`Enter ${param}`}
                                    className={cn("w-full px-3 py-2 rounded-lg border text-sm", bgInput)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Test Button */}
            <button
                onClick={handleTest}
                disabled={testing}
                className={cn(
                    "w-full px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                    "bg-purple-600 text-white hover:bg-purple-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
            >
                {testing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Testing...
                    </>
                ) : (
                    <>
                        <Play className="w-5 h-5" />
                        Run Test
                    </>
                )}
            </button>

            {/* Test Results */}
            {testResult && (
                <div
                    className={cn(
                        "p-4 rounded-xl border",
                        testResult.success
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-red-500/10 border-red-500/20"
                    )}
                >
                    <div className="flex items-start gap-3">
                        {testResult.success ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1 space-y-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn("font-medium", testResult.success ? "text-green-600" : "text-red-600")}>
                                        {testResult.success ? "Test Passed ✅" : `Test Failed: ${testResult.error}`}
                                    </span>
                                    {testResult.execution_time_ms && (
                                        <span className={cn("text-xs flex items-center gap-1", textSecondary)}>
                                            <Clock className="w-3 h-3" />
                                            {testResult.execution_time_ms}ms
                                        </span>
                                    )}
                                </div>

                                {testResult.message && (
                                    <p className={cn("text-sm", textSecondary)}>
                                        {testResult.message}
                                    </p>
                                )}
                            </div>

                            {testResult.success && testResult.data && (
                                <div>
                                    <h5 className={cn("text-xs font-medium mb-2", textSecondary)}>
                                        Response Data:
                                    </h5>
                                    <pre className={cn(
                                        "text-xs p-3 rounded-lg overflow-x-auto",
                                        isDark ? "bg-black/50" : "bg-white"
                                    )}>
                                        {JSON.stringify(testResult.data, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {testResult.stack && (
                                <details>
                                    <summary className={cn("text-xs cursor-pointer", textSecondary)}>
                                        Stack Trace
                                    </summary>
                                    <pre className={cn(
                                        "text-xs p-3 rounded-lg overflow-x-auto mt-2",
                                        isDark ? "bg-black/50" : "bg-white"
                                    )}>
                                        {testResult.stack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper: Extract capabilities from HiveLang code
function extractCapabilities(code: string): Array<{ name: string; params: string[] }> {
    const capabilities: Array<{ name: string; params: string[] }> = [];
    const regex = /@capability\s+(\w+)\s*\((.*?)\)/g;
    let match;

    while ((match = regex.exec(code)) !== null) {
        capabilities.push({
            name: match[1],
            params: match[2]
                .split(',')
                .map(p => p.trim())
                .filter(Boolean),
        });
    }

    return capabilities;
}
