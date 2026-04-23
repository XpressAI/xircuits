#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { validate } from '../parser/validate.js';
import { minifyWithStats } from './index.js';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function printUsage() {
  process.stderr.write(
    [
      'Usage: xircuits-minify <input.xircuits> [-o <output>] [--precision N] [--aggressive]',
      '',
      'Options:',
      '  -o, --output <path>   Output path (default: <input>.min.xircuits)',
      '      --precision N     Coordinate decimal places (default: 0)',
      '      --aggressive      Shorten IDs and strip viewer-unused fields (viewer-only)',
      '  -h, --help            Show this help',
      '',
    ].join('\n')
  );
}

interface Args {
  input?: string;
  output?: string;
  precision: number;
  aggressive: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { precision: 0, aggressive: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') {
      args.help = true;
    } else if (a === '-o' || a === '--output') {
      args.output = argv[++i];
    } else if (a === '--precision') {
      args.precision = Number(argv[++i]);
      if (!Number.isFinite(args.precision) || args.precision < 0) {
        throw new Error(`Invalid --precision value: must be a non-negative number`);
      }
    } else if (a === '--aggressive') {
      args.aggressive = true;
    } else if (a.startsWith('-')) {
      throw new Error(`Unknown flag: ${a}`);
    } else if (!args.input) {
      args.input = a;
    } else {
      throw new Error(`Unexpected positional argument: ${a}`);
    }
  }
  return args;
}

function defaultOutput(input: string): string {
  const ext = extname(input);
  const base = basename(input, ext);
  return join(dirname(input), `${base}.min${ext || '.xircuits'}`);
}

function main() {
  let args: Args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`Error: ${(e as Error).message}\n\n`);
    printUsage();
    process.exit(1);
  }

  if (args.help || !args.input) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  const inputPath = args.input;
  const outputPath = args.output ?? defaultOutput(inputPath);

  let raw: string;
  try {
    raw = readFileSync(inputPath, 'utf8');
  } catch (e) {
    process.stderr.write(`Error reading ${inputPath}: ${(e as Error).message}\n`);
    process.exit(1);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    process.stderr.write(`Error parsing ${inputPath}: ${(e as Error).message}\n`);
    process.exit(1);
  }

  const { valid, errors } = validate(json);
  if (!valid) {
    process.stderr.write(`Invalid .xircuits file: ${errors.join(', ')}\n`);
    process.exit(1);
  }

  const { output, stats } = minifyWithStats(json, {
    precision: args.precision,
    aggressive: args.aggressive,
  });

  writeFileSync(outputPath, output, 'utf8');

  const onDiskInputBytes = Buffer.byteLength(raw, 'utf8');
  const savings = onDiskInputBytes - stats.outputBytes;
  const pct = onDiskInputBytes === 0 ? 0 : (1 - stats.outputBytes / onDiskInputBytes) * 100;
  const inName = basename(inputPath);
  const outName = basename(outputPath);
  const pad = Math.max(inName.length, outName.length);

  process.stderr.write(
    [
      `Input:    ${inName.padEnd(pad)}   ${formatBytes(onDiskInputBytes)}`,
      `Output:   ${outName.padEnd(pad)}   ${formatBytes(stats.outputBytes)}`,
      `Savings:  ${formatBytes(savings)}  (${pct.toFixed(1)}% reduction)`,
      '',
      `Mode:     ${stats.mode}`,
      `Nodes:    ${stats.nodes}     Edges: ${stats.edges}     Ports: ${stats.ports}`,
      `Precision: ${stats.precision} decimals`,
      '',
    ].join('\n')
  );
}

main();
