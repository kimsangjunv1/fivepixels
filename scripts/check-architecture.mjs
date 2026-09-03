#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const EXTENSIONS = [".ts", ".tsx", ".mts", ".cts"];
const LEGACY_SURFACE_DIRS = ["components/overlay", "components/panel", "components/point"];
const ISOLATED_SURFACES = ["feedback", "marker", "modal", "preview", "tooltip", "window"];
const FEATURE_SURFACES = ["panel", ...ISOLATED_SURFACES];

function walk(directory, files = []) {
    if (!fs.existsSync(directory)) return files;

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(file, files);
        else if (EXTENSIONS.includes(path.extname(entry.name))) files.push(file);
    }

    return files;
}

function resolveLocalImport(fromFile, specifier) {
    if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return null;

    const unresolved = specifier.startsWith("@/")
        ? path.join(SRC, specifier.slice(2))
        : path.resolve(path.dirname(fromFile), specifier);
    const stem = unresolved.replace(/\.js$/, "");
    const candidates = [stem, ...EXTENSIONS.map((extension) => `${stem}${extension}`), ...EXTENSIONS.map((extension) => path.join(stem, `index${extension}`))];

    return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function isRuntimeImport(node) {
    if (ts.isImportDeclaration(node)) {
        const clause = node.importClause;
        if (!clause) return true;
        if (clause.isTypeOnly) return false;
        if (clause.name) return true;
        const bindings = clause.namedBindings;
        if (!bindings || ts.isNamespaceImport(bindings)) return true;
        return bindings.elements.some((element) => !element.isTypeOnly);
    }

    return ts.isExportDeclaration(node) && !node.isTypeOnly;
}

const files = walk(SRC);
const graph = new Map(files.map((file) => [file, []]));
const violations = [];

for (const legacyDirectory of LEGACY_SURFACE_DIRS) {
    const legacyFiles = walk(path.join(SRC, legacyDirectory));
    for (const file of legacyFiles) {
        violations.push(`${path.relative(ROOT, file)} must live in a top-level feature folder`);
    }
}

for (const file of files) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    const relativeFile = path.relative(SRC, file);
    const surface = ISOLATED_SURFACES.find((candidate) => relativeFile.startsWith(`${candidate}${path.sep}`));
    const featureSurface = FEATURE_SURFACES.find((candidate) => relativeFile.startsWith(`${candidate}${path.sep}`));

    for (const node of source.statements) {
        if ((!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) || !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;

        const specifier = node.moduleSpecifier.text;
        if (surface && specifier.startsWith("@/panel/")) {
            violations.push(`${path.relative(ROOT, file)} must not import panel internals (${specifier})`);
        }
        if (
            featureSurface &&
            ts.isImportDeclaration(node) &&
            specifier === "@/providers/reportContext.js" &&
            node.importClause?.namedBindings &&
            ts.isNamedImports(node.importClause.namedBindings) &&
            node.importClause.namedBindings.elements.some((element) => element.name.text === "useReport")
        ) {
            violations.push(`${path.relative(ROOT, file)} must use a narrow report context slice instead of useReport`);
        }

        if (!isRuntimeImport(node)) continue;
        const dependency = resolveLocalImport(file, specifier);
        if (dependency && graph.has(dependency)) graph.get(file).push(dependency);
    }
}

const visiting = new Set();
const visited = new Set();
const stack = [];
const cycles = new Set();

function visit(file) {
    if (visited.has(file)) return;
    if (visiting.has(file)) {
        const start = stack.indexOf(file);
        const cycle = [...stack.slice(start), file].map((item) => path.relative(SRC, item)).join(" -> ");
        cycles.add(cycle);
        return;
    }

    visiting.add(file);
    stack.push(file);
    for (const dependency of graph.get(file) ?? []) visit(dependency);
    stack.pop();
    visiting.delete(file);
    visited.add(file);
}

for (const file of files) visit(file);
for (const cycle of cycles) violations.push(`runtime import cycle: ${cycle}`);

if (violations.length > 0) {
    console.error("Architecture check failed:\n");
    for (const violation of violations) console.error(`  ${violation}`);
    process.exit(1);
}

console.log("check-architecture: ok");
