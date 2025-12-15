/**
 * Tool Validator - Validates tool implementations for security and correctness
 */
import { HiveToolMetadata as ToolMetadata } from "./registry";
import { ToolDescriptor } from "@/lib/agentTypes";

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export class ToolValidator {
    /**
     * Validate a tool descriptor
     */
    async validate(tool: ToolDescriptor, metadata?: ToolMetadata): Promise<ValidationResult> {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields validation
        if (!tool.name || typeof tool.name !== 'string') {
            errors.push('Tool name is required and must be a string');
        } else {
            // Name format validation
            if (!/^[a-z]+\.[a-zA-Z]+$/.test(tool.name)) {
                errors.push('Tool name must follow format: category.functionName (e.g., "email.send")');
            }
        }

        if (!tool.capability || typeof tool.capability !== 'string') {
            errors.push('Tool capability is required and must be a string');
        }

        if (!tool.description || typeof tool.description !== 'string') {
            errors.push('Tool description is required and must be a string');
        } else if (tool.description.length < 10) {
            warnings.push('Tool description is too short (minimum 10 characters recommended)');
        }

        if (typeof tool.run !== 'function') {
            errors.push('Tool run method must be a function');
        }

        // Metadata validation
        if (metadata) {
            if (!metadata.displayName || metadata.displayName.length < 3) {
                errors.push('Display name is required (minimum 3 characters)');
            }

            if (!metadata.category) {
                errors.push('Category is required');
            }

            if (!metadata.author || metadata.author.length < 2) {
                errors.push('Author is required');
            }

            if (!metadata.version || !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
                errors.push('Version must follow semantic versioning (e.g., "1.0.0")');
            }
        }

        // Security validation
        const securityIssues = await this.validateSecurity(tool);
        errors.push(...securityIssues.errors);
        warnings.push(...securityIssues.warnings);

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Validate tool security
     */
    private async validateSecurity(tool: ToolDescriptor): Promise<{ errors: string[]; warnings: string[] }> {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Convert function to string to check for dangerous patterns
        const functionCode = tool.run.toString();

        // Dangerous patterns
        const dangerousPatterns = [
            { pattern: /eval\s*\(/gi, message: 'Use of eval() is not allowed for security reasons' },
            { pattern: /Function\s*\(/gi, message: 'Dynamic function creation is not allowed' },
            { pattern: /require\s*\(/gi, message: 'Direct require() calls should be avoided' },
            { pattern: /process\.env/gi, message: 'Direct process.env access detected', isWarning: true },
        ];

        dangerousPatterns.forEach(({ pattern, message, isWarning }) => {
            if (pattern.test(functionCode)) {
                if (isWarning) {
                    warnings.push(message);
                } else {
                    errors.push(message);
                }
            }
        });

        // Check for filesystem operations (warnings only)
        const fsPatterns = [
            /fs\.(readFile|writeFile|unlink|mkdir|rmdir)/gi,
            /\.writeFileSync/gi,
            /\.readFileSync/gi,
        ];

        fsPatterns.forEach(pattern => {
            if (pattern.test(functionCode)) {
                warnings.push('Filesystem operations detected - ensure proper sandboxing');
            }
        });

        return { errors, warnings };
    }

    /**
     * Test tool execution
     */
    async testTool(tool: ToolDescriptor, testInput: Record<string, unknown>): Promise<{
        success: boolean;
        output?: string;
        error?: string;
        executionTime: number;
    }> {
        const startTime = Date.now();

        try {
            // Create mock context
            const mockContext = {
                metadata: {
                    botId: 'test-bot',
                    runId: 'test-run',
                    userId: 'test-user',
                },
                sharedMemory: {
                    get: async () => undefined,
                    set: async () => { },
                    append: async () => { },
                },
            };

            const result = await tool.run(testInput, mockContext);

            const executionTime = Date.now() - startTime;

            if (typeof result.success !== 'boolean') {
                return {
                    success: false,
                    error: 'Tool must return an object with "success" boolean field',
                    executionTime,
                };
            }

            if (typeof result.output !== 'string') {
                return {
                    success: false,
                    error: 'Tool must return an object with "output" string field',
                    executionTime,
                };
            }

            return {
                success: true,
                output: result.output,
                executionTime,
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                executionTime,
            };
        }
    }

    /**
     * Validate tool performance
     */
    async validatePerformance(tool: ToolDescriptor, testInput: Record<string, unknown>): Promise<{
        passesPerformance: boolean;
        executionTime: number;
        issues: string[];
    }> {
        const issues: string[] = [];
        const testResult = await this.testTool(tool, testInput);

        // Performance thresholds
        const MAX_EXECUTION_TIME = 30000; // 30 seconds
        const WARN_EXECUTION_TIME = 5000; // 5 seconds

        if (testResult.executionTime > MAX_EXECUTION_TIME) {
            issues.push(`Execution time exceeded maximum (${testResult.executionTime}ms > ${MAX_EXECUTION_TIME}ms)`);
        } else if (testResult.executionTime > WARN_EXECUTION_TIME) {
            issues.push(`Execution time is high (${testResult.executionTime}ms) - consider optimization`);
        }

        return {
            passesPerformance: testResult.executionTime <= MAX_EXECUTION_TIME,
            executionTime: testResult.executionTime,
            issues,
        };
    }

    /**
     * Complete validation suite
     */
    async validateComplete(
        tool: ToolDescriptor,
        metadata: ToolMetadata,
        testInput?: Record<string, unknown>
    ): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
        testResults?: any;
    }> {
        const structureValidation = await this.validate(tool, metadata);

        if (!structureValidation.valid) {
            return structureValidation;
        }

        // If test input provided, run execution test
        if (testInput) {
            const testResult = await this.testTool(tool, testInput);
            const perfResult = await this.validatePerformance(tool, testInput);

            return {
                valid: testResult.success && perfResult.passesPerformance,
                errors: testResult.success ? [] : [testResult.error || 'Test failed'],
                warnings: [...structureValidation.warnings, ...perfResult.issues],
                testResults: {
                    execution: testResult,
                    performance: perfResult,
                },
            };
        }

        return structureValidation;
    }
}

// Export singleton instance
export const toolValidator = new ToolValidator();
