"use strict";
// Hivelang Compiler v2 (Ported)
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiveCompiler = void 0;
class HiveCompiler {
    constructor() {
        this.code = '';
        this.lines = [];
        this.currentLine = 0;
    }
    compile(code) {
        this.code = code;
        this.lines = code.split('\n');
        this.currentLine = 0;
        const blocks = [];
        try {
            while (this.currentLine < this.lines.length) {
                const line = this.lines[this.currentLine].trim();
                if (!line || line.startsWith('//')) {
                    this.currentLine++;
                    continue;
                }
                if (line.startsWith('bot ') || line.startsWith('agent ')) {
                    blocks.push(this.parseBlock());
                }
                else {
                    this.currentLine++;
                }
            }
            // Basic transpilation to JS Runtime string
            // In a real implementation this would generate a robust state machine
            const js = this.generateRuntimeJS(blocks);
            return { success: true, blocks, javascript: js };
        }
        catch (e) {
            return { success: false, error: `Line ${this.currentLine + 1}: ${e.message}`, blocks: [] };
        }
    }
    parseBlock() {
        const headerLine = this.lines[this.currentLine].trim();
        const match = headerLine.match(/^(bot|agent)\s+"?([^"]+)"?/);
        if (!match)
            throw new Error("Invalid block definition");
        const block = {
            type: match[1],
            name: match[2],
            instructions: [],
            events: {}
        };
        this.currentLine++;
        let currentEvent = null;
        while (this.currentLine < this.lines.length) {
            const line = this.lines[this.currentLine].trim();
            if (line === 'end') {
                if (currentEvent) {
                    currentEvent = null; // End event
                    this.currentLine++;
                    continue;
                }
                else {
                    this.currentLine++; // End block
                    break;
                }
            }
            if (line.startsWith('description ')) {
                block.description = line.replace('description ', '').replace(/"/g, '');
            }
            else if (line.startsWith('on ')) {
                currentEvent = line.replace('on ', '');
                block.events[currentEvent] = [];
            }
            else if (currentEvent && line) {
                // Parse instructions inside event
                block.events[currentEvent].push(this.parseInstruction(line));
            }
            this.currentLine++;
        }
        return block;
    }
    parseInstruction(line) {
        // Basic parser for 'say', 'call', etc.
        if (line.startsWith('say ')) {
            return { type: 'say', command: 'say', args: line.substring(4), raw: line };
        }
        if (line.startsWith('call ')) {
            // Very naive parsing for demo
            return { type: 'call', command: 'call', args: line.substring(5), raw: line };
        }
        return { type: 'raw', command: 'raw', raw: line };
    }
    generateRuntimeJS(blocks) {
        return JSON.stringify(blocks, null, 2);
    }
}
exports.HiveCompiler = HiveCompiler;
