#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function printHelp() {
    console.log(`clean-architecture-instruction

Usage:
  clean-architecture-instruction prepare [targetPath] [--force]

Commands:
  prepare     Copy bundled instruction files into target project's .github/instructions

Options:
  --force     Overwrite existing instruction files in destination
  -h, --help  Show this help message
`);
}

function copyInstructions(targetPath, force) {
    const packageRoot = path.resolve(__dirname, "..");
    const sourceDir = path.join(packageRoot, ".github", "instructions");
    const targetRoot = path.resolve(targetPath || process.cwd());
    const destinationDir = path.join(targetRoot, ".github", "instructions");

    if (!fs.existsSync(sourceDir)) {
        console.error(`Source instructions folder not found: ${sourceDir}`);
        process.exit(1);
    }

    fs.mkdirSync(destinationDir, { recursive: true });
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile());

    if (files.length === 0) {
        console.error("No instruction files were found in the package.");
        process.exit(1);
    }

    let copied = 0;
    let skipped = 0;

    for (const file of files) {
        const from = path.join(sourceDir, file.name);
        const to = path.join(destinationDir, file.name);

        if (!force && fs.existsSync(to)) {
            skipped += 1;
            continue;
        }

        fs.copyFileSync(from, to);
        copied += 1;
    }

    console.log(`Prepared project at: ${targetRoot}`);
    console.log(`Destination: ${destinationDir}`);
    console.log(`Copied: ${copied}, Skipped: ${skipped}`);
}

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exit(0);
}

const [command, maybeTarget, ...rest] = args;
const flags = new Set([maybeTarget, ...rest].filter(Boolean));
const force = flags.has("--force");

if (command === "prepare") {
    const targetPath = maybeTarget && !maybeTarget.startsWith("-") ? maybeTarget : process.cwd();
    copyInstructions(targetPath, force);
    process.exit(0);
}

console.error(`Unknown command: ${command}`);
printHelp();
process.exit(1);
