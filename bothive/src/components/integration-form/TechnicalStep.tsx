import React from 'react';
import { IntegrationFormData } from '@/app/developer/submit/page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface Props {
    data: IntegrationFormData;
    updateData: (data: Partial<IntegrationFormData>) => void;
}

export default function TechnicalStep({ data, updateData }: Props) {
    const [newCapability, setNewCapability] = React.useState('');

    const addCapability = () => {
        if (newCapability.trim()) {
            updateData({
                capabilities: [...data.capabilities, newCapability.trim()]
            });
            setNewCapability('');
        }
    };

    const removeCapability = (index: number) => {
        const newCapabilities = [...data.capabilities];
        newCapabilities.splice(index, 1);
        updateData({ capabilities: newCapabilities });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="integrationType">Integration Type</Label>
                    <select
                        id="integrationType"
                        value={data.integrationType}
                        onChange={(e) => updateData({ integrationType: e.target.value as any })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm"
                    >
                        <option value="api">REST API</option>
                        <option value="oauth">OAuth 2.0</option>
                        <option value="webhook">Webhook Only</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="authMethod">Authentication Method</Label>
                    <select
                        id="authMethod"
                        value={data.authMethod}
                        onChange={(e) => updateData({ authMethod: e.target.value as any })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm"
                    >
                        <option value="api_key">API Key</option>
                        <option value="oauth2">OAuth 2.0 Flow</option>
                        <option value="none">None / Public</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="apiBaseUrl">API Base URL</Label>
                <Input
                    id="apiBaseUrl"
                    placeholder="https://api.example.com/v1"
                    value={data.apiBaseUrl || ''}
                    onChange={(e) => updateData({ apiBaseUrl: e.target.value })}
                    className="bg-background/50 font-mono"
                />
            </div>

            <div className="space-y-2">
                <Label>Capabilities</Label>
                <div className="flex gap-2 mb-2">
                    <Input
                        placeholder="e.g. Can post images"
                        value={newCapability}
                        onChange={(e) => setNewCapability(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCapability()}
                        className="bg-background/50"
                    />
                    <button
                        onClick={addCapability}
                        className="px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.capabilities.map((cap, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
                        >
                            <span>{cap}</span>
                            <button
                                onClick={() => removeCapability(index)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="documentationUrl">Documentation URL</Label>
                <Input
                    id="documentationUrl"
                    placeholder="https://docs.example.com"
                    value={data.documentationUrl || ''}
                    onChange={(e) => updateData({ documentationUrl: e.target.value })}
                    className="bg-background/50"
                />
            </div>
        </div>
    );
}
