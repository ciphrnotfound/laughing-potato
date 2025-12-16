// Hivelang Compiler v2 (Ported)

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

export class HiveCompiler {
  private code: string = '';
  private lines: string[] = [];
  private currentLine: number = 0;

  compile(code: string): CompilationResult {
    this.code = code;
    this.lines = code.split('\n');
    this.currentLine = 0;

    const blocks: HiveBlock[] = [];

    try {
      while (this.currentLine < this.lines.length) {
        const line = this.lines[this.currentLine].trim();

        if (!line || line.startsWith('//')) {
          this.currentLine++;
          continue;
        }

        if (line.startsWith('bot ') || line.startsWith('agent ')) {
          blocks.push(this.parseBlock());
        } else {
          this.currentLine++;
        }
      }

      // Basic transpilation to JS Runtime string
      // In a real implementation this would generate a robust state machine
      const js = this.generateRuntimeJS(blocks);

      return { success: true, blocks, javascript: js };
    } catch (e: any) {
      return { success: false, error: `Line ${this.currentLine + 1}: ${e.message}`, blocks: [] };
    }
  }

  private parseBlock(): HiveBlock {
    const headerLine = this.lines[this.currentLine].trim();
    const match = headerLine.match(/^(bot|agent)\s+"?([^"]+)"?/);
    if (!match) throw new Error("Invalid block definition");

    const block: HiveBlock = {
      type: match[1] as any,
      name: match[2],
      instructions: [],
      events: {}
    };

    this.currentLine++;

    let currentEvent: string | null = null;

    while (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine].trim();

      if (line === 'end') {
        if (currentEvent) {
          currentEvent = null; // End event
          this.currentLine++;
          continue;
        } else {
          this.currentLine++; // End block
          break;
        }
      }

      if (line.startsWith('description ')) {
        block.description = line.replace('description ', '').replace(/"/g, '');
      } else if (line.startsWith('on ')) {
        currentEvent = line.replace('on ', '');
        block.events[currentEvent] = [];
      } else if (currentEvent && line) {
        // Parse instructions inside event
        block.events[currentEvent].push(this.parseInstruction(line));
      }

      this.currentLine++;
    }

    return block;
  }

  private parseInstruction(line: string): HiveInstruction {
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

  private generateRuntimeJS(blocks: HiveBlock[]): string {
    return JSON.stringify(blocks, null, 2);
  }
}
