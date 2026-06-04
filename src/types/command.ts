export interface ParsedCommand {
  raw: string;
  name: string;
  args: string[];
  flags: string[];
  redirect?: {
    type: '>' | '>>';
    target: string;
  };
}

export interface CommandOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface CommandHandler {
  name: string;
  aliases?: string[];
  execute: (args: string[], flags: string[], stdin?: string) => CommandOutput;
}
