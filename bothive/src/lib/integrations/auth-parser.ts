import { Field } from "@/components/integrations/CredentialForm";

/**
 * Parses the @auth directive from Hivelang code to dynamically generate form fields.
 * Example: @auth type: "api_key", fields: [{ name: "apiKey", label: "API Key", type: "password", required: true }]
 */
export const getAuthFields = (hivelangCode: string | null): Field[] => {
    if (!hivelangCode) return [{ name: "apiKey", label: "API Key", type: "password", required: true }];

    // Regex to match @auth block
    // Matches @auth followed by type and optionally fields
    const authMatch = hivelangCode.match(/@auth\s+type:\s*"([^"]+)"(?:,\s*fields:\s*\[(.*?)\s*\])?/s);

    if (authMatch) {
        const type = authMatch[1];
        const fieldsStr = authMatch[2];

        if (fieldsStr) {
            try {
                // VERY basic parser for the fields array in HiveLang
                // Format: [{ name: "n", label: "l", type: "t", required: b }, ...]
                // This is a naive implementation; a real one would use a proper HiveLang parser
                const fields: Field[] = [];
                const fieldMatches = fieldsStr.matchAll(/\{\s*name:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*type:\s*"([^"]+)"(?:,\s*required:\s*(true|false))?\s*\}/g);

                for (const match of fieldMatches) {
                    fields.push({
                        name: match[1],
                        label: match[2],
                        type: match[3] as any,
                        required: match[4] === "true"
                    });
                }

                if (fields.length > 0) return fields;
            } catch (e) {
                console.error("Failed to parse auth fields:", e);
            }
        }

        // Default based on type
        if (type === "api_key") {
            return [{ name: "apiKey", label: "API Key", type: "password", required: true }];
        }
    }

    // Fallback default
    return [{ name: "apiKey", label: "API Key", type: "password", required: true }];
};
