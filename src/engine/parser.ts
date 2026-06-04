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

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuote) {
      if (c === inQuote) {
        inQuote = null;
      } else {
        current += c;
      }
    } else if (c === '"' || c === "'") {
      inQuote = c;
    } else if (c === ' ') {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += c;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function splitOnPipe(input: string): string[] {
  const segments: string[] = [];
  let current = '';
  let inQuote: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuote) {
      current += c;
      if (c === inQuote) inQuote = null;
    } else if (c === '"' || c === "'") {
      current += c;
      inQuote = c;
    } else if (c === '|') {
      if (current.trim()) segments.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  if (current.trim()) segments.push(current.trim());
  return segments;
}

function parseSingleCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return null;

  const name = tokens[0];
  const args: string[] = [];
  const flags: string[] = [];
  let redirect: { type: '>' | '>>'; target: string } | undefined;

  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];

    if (t === '>') {
      if (i + 1 < tokens.length) {
        redirect = { type: '>', target: tokens[++i] };
      }
    } else if (t === '>>') {
      if (i + 1 < tokens.length) {
        redirect = { type: '>>', target: tokens[++i] };
      }
    } else if (t.startsWith('--')) {
      flags.push(t);
    } else if (t.startsWith('-') && t.length > 1 && isNaN(Number(t))) {
      for (let j = 1; j < t.length; j++) {
        flags.push('-' + t[j]);
      }
    } else {
      args.push(t);
    }
  }

  return { raw: trimmed, name, args, flags, redirect };
}

export function parsePipeline(input: string): ParsedCommand[] {
  const segments = splitOnPipe(input);
  return segments
    .map((seg) => parseSingleCommand(seg))
    .filter((cmd): cmd is ParsedCommand => cmd !== null);
}

export function parseCommand(input: string): ParsedCommand | null {
  const segments = splitOnPipe(input);
  if (segments.length === 0) return null;
  return parseSingleCommand(segments[0]);
}
