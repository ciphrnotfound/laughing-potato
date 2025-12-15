/**
 * Auto-generate HiveLang code from visual form inputs
 * Allows non-developers to create integrations without writing code
 */

export interface VisualCapability {
    name: string;
    description: string;
    http_method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    endpoint_url: string;
    params: Array<{
        name: string;
        type: 'string' | 'number' | 'boolean' | 'object';
        required: boolean;
    }>;
    headers: Array<{
        key: string;
        value: string;
        use_credential?: boolean; // If true, value is like "{user.credentials.api_key}"
    }>;
    body_template?: string; // JSON template with {param} placeholders
    response_mapping?: {
        extract_path?: string; // JSONPath to extract from response
        return_type: 'object' | 'array' | 'string' | 'boolean';
    };
}

export interface VisualIntegration {
    name: string;
    slug: string;
    description: string;
    category: string;
    auth_type: 'api_key' | 'oauth2' | 'none';
    base_url?: string;
    capabilities: VisualCapability[];
}

/**
 * Generate HiveLang code from visual configuration
 */
export function generateHiveLangFromVisual(config: VisualIntegration): string {
    let code = `@integration ${config.slug}\n`;
    code += `@auth ${config.auth_type}\n`;
    code += `@category ${config.category}\n`;
    code += `@description "${config.description}"\n\n`;

    // Generate each capability
    for (const capability of config.capabilities) {
        code += generateCapabilityCode(capability, config);
        code += '\n\n';
    }

    return code.trim();
}

/**
 * Generate code for a single capability
 */
function generateCapabilityCode(
    capability: VisualCapability,
    integration: VisualIntegration
): string {
    // Extract parameter names
    const paramNames = capability.params.map(p => p.name);
    const paramList = paramNames.join(', ');

    let code = `@capability ${capability.name}\n`;
    code += `@params ${paramList}\n`;
    code += `@returns ${capability.response_mapping?.return_type || 'object'}\n\n`;
    code += `function ${capability.name}(${paramList}):\n`;

    // Build headers
    const headers: string[] = [];
    for (const header of capability.headers) {
        if (header.use_credential) {
            headers.push(`        "${header.key}": ${header.value}`);
        } else {
            headers.push(`        "${header.key}": "${header.value}"`);
        }
    }

    // Build request body
    let bodyCode = '';
    if (capability.body_template && ['POST', 'PUT', 'PATCH'].includes(capability.http_method)) {
        // Replace {param} with actual parameter references
        let bodyTemplate = capability.body_template;
        for (const param of capability.params) {
            bodyTemplate = bodyTemplate.replace(
                new RegExp(`\\{${param.name}\\}`, 'g'),
                `{${param.name}}`
            );
        }
        bodyCode = `,\n        body: ${bodyTemplate}`;
    }

    // Build URL with parameters
    let url = capability.endpoint_url;
    if (integration.base_url && !url.startsWith('http')) {
        url = `{integration.base_url}${url}`;
    }

    // Replace URL parameters
    for (const param of capability.params) {
        if (url.includes(`{${param.name}}`)) {
            url = url.replace(`{${param.name}}`, `{${param.name}}`);
        }
    }

    url = `f"${url}"`;

    // Generate HTTP request
    const method = capability.http_method.toLowerCase();
    code += `    response = http.${method}(${url}, {\n`;
    code += `        headers: {\n${headers.join(',\n')}\n        }`;
    code += bodyCode;
    code += `\n    })\n\n`;

    // Error handling
    code += `    if response.status >= 400:\n`;
    code += `        throw Error(f"API error: {response.data.error}")\n\n`;

    // Extract and return response
    if (capability.response_mapping?.extract_path) {
        code += `    data = response.json()\n`;
        code += `    return data.${capability.response_mapping.extract_path}\n`;
    } else {
        code += `    return response.json()\n`;
    }

    return code;
}

/**
 * Parse HiveLang code back to visual format (for editing)
 */
export function parseHiveLangToVisual(code: string): VisualIntegration | null {
    try {
        // Extract metadata
        const integrationMatch = code.match(/@integration\s+(\w+)/);
        const authMatch = code.match(/@auth\s+(\w+)/);
        const categoryMatch = code.match(/@category\s+(\w+)/);
        const descriptionMatch = code.match(/@description\s+"([^"]+)"/);

        if (!integrationMatch) return null;

        const integration: VisualIntegration = {
            name: integrationMatch[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            slug: integrationMatch[1],
            description: descriptionMatch?.[1] || '',
            category: categoryMatch?.[1] || 'other',
            auth_type: (authMatch?.[1] as any) || 'api_key',
            capabilities: [],
        };

        // Extract capabilities
        const capabilityRegex = /@capability\s+(\w+)[\s\S]*?function\s+\1\s*\((.*?)\):([\s\S]*?)(?=@capability|$)/g;
        let capMatch;

        while ((capMatch = capabilityRegex.exec(code)) !== null) {
            const [, capName, params, body] = capMatch;

            // Parse HTTP method and URL
            const httpMatch = body.match(/http\.(get|post|put|patch|delete)\s*\(\s*f?"([^"]+)"/);
            if (!httpMatch) continue;

            const capability: VisualCapability = {
                name: capName,
                description: `${capName} capability`,
                http_method: httpMatch[1].toUpperCase() as any,
                endpoint_url: httpMatch[2],
                params: params
                    .split(',')
                    .map(p => p.trim())
                    .filter(Boolean)
                    .map(name => ({
                        name,
                        type: 'string',
                        required: true,
                    })),
                headers: [],
            };

            integration.capabilities.push(capability);
        }

        return integration;
    } catch (error) {
        console.error('Error parsing HiveLang:', error);
        return null;
    }
}

/**
 * Example: Convert visual config to HiveLang
 */
export const EXAMPLE_VISUAL_CONFIG: VisualIntegration = {
    name: 'Weather API',
    slug: 'weather_api',
    description: 'Get weather forecasts and current conditions',
    category: 'data',
    auth_type: 'api_key',
    base_url: 'https://api.weatherapi.com/v1',
    capabilities: [
        {
            name: 'get_current_weather',
            description: 'Get current weather for a location',
            http_method: 'GET',
            endpoint_url: '/current.json?q={location}&key={user.credentials.api_key}',
            params: [
                { name: 'location', type: 'string', required: true },
            ],
            headers: [
                { key: 'Content-Type', value: 'application/json' },
            ],
            response_mapping: {
                extract_path: 'current',
                return_type: 'object',
            },
        },
        {
            name: 'get_forecast',
            description: 'Get weather forecast for the next days',
            http_method: 'GET',
            endpoint_url: '/forecast.json?q={location}&days={days}&key={user.credentials.api_key}',
            params: [
                { name: 'location', type: 'string', required: true },
                { name: 'days', type: 'number', required: true },
            ],
            headers: [
                { key: 'Content-Type', value: 'application/json' },
            ],
            response_mapping: {
                extract_path: 'forecast',
                return_type: 'object',
            },
        },
    ],
};

// Example output:
/*
@integration weather_api
@auth api_key
@category data
@description "Get weather forecasts and current conditions"

@capability get_current_weather
@params location
@returns object

function get_current_weather(location):
    response = http.get(f"https://api.weatherapi.com/v1/current.json?q={location}&key={user.credentials.api_key}", {
        headers: {
            "Content-Type": "application/json"
        }
    })
    
    if response.status >= 400:
        throw Error(f"API error: {response.data.error}")
    
    data = response.json()
    return data.current
*/
