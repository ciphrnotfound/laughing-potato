export interface HiveBlock {
    type: 'bot' | 'agent' | 'func';
    name: string;
    description?: string;
    instructions: string[];
    events: Record<string, HiveInstruction[]>;
}
export interface HiveInstruction {
    type: string;
    command: string;
    args?: any;
    raw: string;
}
export interface CompilationResult {
    success: boolean;
    error?: string;
    blocks: HiveBlock[];
    javascript?: string;
}
export declare class HiveCompiler {
    private code;
    private lines;
    private currentLine;
    compile(code: string): CompilationResult;
    private parseBlock;
    private parseInstruction;
    private generateRuntimeJS;
}
