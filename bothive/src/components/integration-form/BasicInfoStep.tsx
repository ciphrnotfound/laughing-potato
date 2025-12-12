import React from 'react';
import { IntegrationFormData } from '@/app/developer/submit/page';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface Props {
    data: IntegrationFormData;
    updateData: (data: Partial<IntegrationFormData>) => void;
}

export default function BasicInfoStep({ data, updateData }: Props) {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Integration Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g. Instagram Pro"
                        value={data.name}
                        onChange={(e) => updateData({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="bg-background/50"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                        id="slug"
                        placeholder="instagram-pro"
                        value={data.slug}
                        onChange={(e) => updateData({ slug: e.target.value })}
                        className="bg-background/50 font-mono text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                    id="category"
                    value={data.category}
                    onChange={(e) => updateData({ category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="social">Social Media</option>
                    <option value="productivity">Productivity</option>
                    <option value="communication">Communication</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="marketing">Marketing</option>
                    <option value="developer">Developer Tools</option>
                    <option value="automation">Automation</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                    id="shortDescription"
                    placeholder="Brief summary (max 100 chars)"
                    maxLength={100}
                    value={data.shortDescription}
                    onChange={(e) => updateData({ shortDescription: e.target.value })}
                    className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground text-right">
                    {data.shortDescription.length}/100
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="longDescription">Full Description</Label>
                <Textarea
                    id="longDescription"
                    placeholder="Detailed explanation of features and benefits..."
                    rows={6}
                    value={data.longDescription}
                    onChange={(e) => updateData({ longDescription: e.target.value })}
                    className="bg-background/50 resize-none"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Icon URL</Label>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                            {data.iconUrl ? (
                                <img src={data.iconUrl} alt="Icon" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                        <Input
                            placeholder="https://..."
                            value={data.iconUrl}
                            onChange={(e) => updateData({ iconUrl: e.target.value })}
                            className="bg-background/50 flex-1"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Cover Image URL</Label>
                    <Input
                        placeholder="https://..."
                        value={data.coverImageUrl}
                        onChange={(e) => updateData({ coverImageUrl: e.target.value })}
                        className="bg-background/50"
                    />
                </div>
            </div>
        </div>
    );
}
