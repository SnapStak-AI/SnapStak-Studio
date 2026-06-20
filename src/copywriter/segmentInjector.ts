/**
 * SnapStak Segment Injector
 * Receives segment injection requests from ss-tracker.js.
 * Locates each element in the JSX/HTML source files using opening tag matching
 * with framework-aware attribute name mapping.
 *
 * Only scans src/ folder — specifically src/components/ and src/pages/ and src/app/.
 * Framework attribute map handles class vs className, for vs htmlFor etc.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SegmentRegistryManager } from './segmentRegistry';

// ─────────────────────────────────────────────────────────────
// FRAMEWORK ATTRIBUTE MAP
// Maps DOM attribute names to framework-specific equivalents
// ─────────────────────────────────────────────────────────────

interface AttributeMap {
    class: string;
    for: string;
    tabindex: string;
    readonly: string;
    maxlength: string;
    colspan: string;
    rowspan: string;
    crossorigin: string;
    autofocus: string;
}

const FRAMEWORK_ATTR_MAP: Record<string, AttributeMap> = {
    'React': {
        class: 'className',
        for: 'htmlFor',
        tabindex: 'tabIndex',
        readonly: 'readOnly',
        maxlength: 'maxLength',
        colspan: 'colSpan',
        rowspan: 'rowSpan',
        crossorigin: 'crossOrigin',
        autofocus: 'autoFocus'
    },
    'Next.js': {
        class: 'className',
        for: 'htmlFor',
        tabindex: 'tabIndex',
        readonly: 'readOnly',
        maxlength: 'maxLength',
        colspan: 'colSpan',
        rowspan: 'rowSpan',
        crossorigin: 'crossOrigin',
        autofocus: 'autoFocus'
    },
    'Remix': {
        class: 'className',
        for: 'htmlFor',
        tabindex: 'tabIndex',
        readonly: 'readOnly',
        maxlength: 'maxLength',
        colspan: 'colSpan',
        rowspan: 'rowSpan',
        crossorigin: 'crossOrigin',
        autofocus: 'autoFocus'
    },
    'Vite': {
        // Vite is a bundler — the framework inside matters.
        // Default to React conventions since Vite+React is most common.
        // Vue/Svelte Vite projects use standard HTML attribute names.
        class: 'className',
        for: 'htmlFor',
        tabindex: 'tabIndex',
        readonly: 'readOnly',
        maxlength: 'maxLength',
        colspan: 'colSpan',
        rowspan: 'rowSpan',
        crossorigin: 'crossOrigin',
        autofocus: 'autoFocus'
    },
    'Vue CLI': {
        class: 'class',
        for: 'for',
        tabindex: 'tabindex',
        readonly: 'readonly',
        maxlength: 'maxlength',
        colspan: 'colspan',
        rowspan: 'rowspan',
        crossorigin: 'crossorigin',
        autofocus: 'autofocus'
    },
    'Nuxt': {
        class: 'class',
        for: 'for',
        tabindex: 'tabindex',
        readonly: 'readonly',
        maxlength: 'maxlength',
        colspan: 'colspan',
        rowspan: 'rowspan',
        crossorigin: 'crossorigin',
        autofocus: 'autofocus'
    },
    'SvelteKit': {
        class: 'class',
        for: 'for',
        tabindex: 'tabindex',
        readonly: 'readonly',
        maxlength: 'maxlength',
        colspan: 'colspan',
        rowspan: 'rowspan',
        crossorigin: 'crossorigin',
        autofocus: 'autofocus'
    },
    'Angular': {
        class: 'class',
        for: 'for',
        tabindex: 'tabindex',
        readonly: 'readonly',
        maxlength: 'maxlength',
        colspan: 'colspan',
        rowspan: 'rowspan',
        crossorigin: 'crossorigin',
        autofocus: 'autofocus'
    },
    'Static': {
        class: 'class',
        for: 'for',
        tabindex: 'tabindex',
        readonly: 'readonly',
        maxlength: 'maxlength',
        colspan: 'colspan',
        rowspan: 'rowspan',
        crossorigin: 'crossorigin',
        autofocus: 'autofocus'
    },
    'Unknown': {
        class: 'class',
        for: 'for',
        tabindex: 'tabindex',
        readonly: 'readonly',
        maxlength: 'maxlength',
        colspan: 'colspan',
        rowspan: 'rowspan',
        crossorigin: 'crossorigin',
        autofocus: 'autofocus'
    }
};

function getAttrMap(framework: string): AttributeMap {
    return FRAMEWORK_ATTR_MAP[framework] || FRAMEWORK_ATTR_MAP['Unknown'];
}

// ─────────────────────────────────────────────────────────────
// SOURCE FILE DISCOVERY
// Only scan src/ — specifically components/, pages/, app/
// ─────────────────────────────────────────────────────────────

const SOURCE_EXTENSIONS = new Set([
    '.html', '.htm',
    '.jsx', '.tsx',
    '.js', '.ts',
    '.vue', '.svelte'
]);

const EXCLUDE_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', '.next',
    'out', '.nuxt', '.svelte-kit', 'coverage', '.snapstak',
    '__tests__', '__mocks__', 'test', 'tests', 'spec'
]);

// Priority folders — scan these first for faster matching
const PRIORITY_FOLDERS = ['components', 'pages', 'app', 'views', 'layouts', 'sections'];

export function discoverSourceFiles(projectRoot: string): string[] {
    const srcDir = path.join(projectRoot, 'src');
    if (!fs.existsSync(srcDir)) {
        // Fallback — scan entire project root but exclude noise
        return scanDir(projectRoot, projectRoot);
    }
    return scanDir(srcDir, projectRoot);
}

function scanDir(dir: string, projectRoot: string): string[] {
    const priorityFiles: string[] = [];
    const otherFiles: string[] = [];

    function walk(currentDir: string, isPriority: boolean) {
        let entries: fs.Dirent[];
        try { entries = fs.readdirSync(currentDir, { withFileTypes: true }); }
        catch { return; }

        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (EXCLUDE_DIRS.has(entry.name)) { continue; }
                const childIsPriority = isPriority || PRIORITY_FOLDERS.includes(entry.name);
                walk(path.join(currentDir, entry.name), childIsPriority);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (!SOURCE_EXTENSIONS.has(ext)) { continue; }
                // Skip injected files
                if (entry.name === 'ss-tracker.js' || entry.name === 'contentSelector.js') { continue; }
                const relPath = path.relative(projectRoot, path.join(currentDir, entry.name));
                if (isPriority) { priorityFiles.push(relPath); }
                else { otherFiles.push(relPath); }
            }
        }
    }

    walk(dir, false);
    // Priority files searched first — faster matches
    return [...priorityFiles, ...otherFiles];
}

// ─────────────────────────────────────────────────────────────
// OPENING TAG EXTRACTOR
// Extracts just the opening tag from outerHTML
// e.g. '<button class="btn" type="button">Click me</button>'
//   → '<button class="btn" type="button">'
// ─────────────────────────────────────────────────────────────

function extractOpeningTag(outerHTML: string): string {
    // Find the end of the opening tag
    let depth = 0;
    let inStr = false;
    let strChar = '';

    for (let i = 0; i < outerHTML.length; i++) {
        const ch = outerHTML[i];

        if (inStr) {
            if (ch === strChar) { inStr = false; }
            continue;
        }

        if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue; }
        if (ch === '<') { depth++; continue; }
        if (ch === '>') {
            depth--;
            if (depth === 0) { return outerHTML.slice(0, i + 1); }
        }
    }
    return outerHTML;
}

// ─────────────────────────────────────────────────────────────
// ATTRIBUTE TRANSLATOR
// Converts DOM attribute names to framework equivalents in the opening tag
// e.g. class="foo" → className="foo" for React
// ─────────────────────────────────────────────────────────────

function translateAttributes(openingTag: string, attrMap: AttributeMap): string {
    let result = openingTag;

    // Replace each DOM attribute with its framework equivalent
    for (const [domAttr, fwAttr] of Object.entries(attrMap)) {
        if (domAttr === fwAttr) { continue; } // no translation needed
        // Match attribute as a word boundary with = or space/> after it
        const regex = new RegExp(`\\b${domAttr}(=|\\s|>|/)`, 'g');
        result = result.replace(regex, `${fwAttr}$1`);
    }

    return result;
}

// ─────────────────────────────────────────────────────────────
// TAG NORMALISER
// Builds multiple search variants for an opening tag to handle
// differences between DOM output and JSX source:
// - Self-closing in JSX: <img /> vs <img> in DOM
// - Extra whitespace / newlines in JSX
// - Attribute order differences (try partial matching)
// ─────────────────────────────────────────────────────────────

function buildSearchVariants(openingTag: string, attrMap: AttributeMap): string[] {
    const variants: string[] = [];

    // Translate DOM attributes to framework equivalents
    const translated = translateAttributes(openingTag, attrMap);

    // Variant 1: translated as-is
    variants.push(translated);

    // Variant 2: original (in case translation was wrong)
    if (translated !== openingTag) { variants.push(openingTag); }

    // Variant 3: self-closing version
    // <img class="foo"> → <img className="foo" />
    const selfClose = translated.replace(/>$/, ' />').replace(/\s+\/>$/, ' />');
    if (selfClose !== translated) { variants.push(selfClose); }

    // Variant 4: tag name + first attribute only (partial match)
    // Handles cases where attribute order differs
    const tagMatch = translated.match(/^<([a-zA-Z][a-zA-Z0-9-]*)\s+([a-zA-Z][a-zA-Z0-9-]*)=/);
    if (tagMatch) {
        variants.push(`<${tagMatch[1]} ${tagMatch[2]}=`);
    }

    return variants;
}

// ─────────────────────────────────────────────────────────────
// INJECT ATTRIBUTE INTO SOURCE
// Given a source string and the position of the opening tag,
// insert data-segment-id as the first attribute after the tag name
// ─────────────────────────────────────────────────────────────

function injectIntoTag(source: string, matchIndex: number, segmentId: string): string {
    // Find the position right after the tag name
    const slice = source.slice(matchIndex);
    const tagMatch = slice.match(/^<([a-zA-Z][a-zA-Z0-9-]*)/);
    if (!tagMatch) { return source; }

    const insertAt = matchIndex + tagMatch[0].length;
    const attribute = ` data-segment-id="${segmentId}"`;

    return source.slice(0, insertAt) + attribute + source.slice(insertAt);
}

function alreadyHasSegmentId(source: string, matchIndex: number): boolean {
    const slice = source.slice(matchIndex, matchIndex + 500);
    const tagEnd = slice.indexOf('>');
    if (tagEnd === -1) { return false; }
    return slice.slice(0, tagEnd + 1).includes('data-segment-id');
}

// ─────────────────────────────────────────────────────────────
// ELEMENT INTERFACE
// ─────────────────────────────────────────────────────────────

export interface SegmentElement {
    segmentId: string;  // pre-generated by ss-tracker.js using crypto.getRandomValues()
    tag: string;
    outerHTML: string;  // first 300 chars — enough to contain the opening tag
    textSnip: string;  // first 80 chars of text content
}

export interface InjectionResult {
    success: boolean;
    injectedCount: number;
    skippedCount: number;
    errors: string[];
}

// ─────────────────────────────────────────────────────────────
// MAIN INJECTOR
// ─────────────────────────────────────────────────────────────

export async function injectSegmentIds(
    projectRoot: string,
    elements: SegmentElement[],
    registry: SegmentRegistryManager,
    framework: string = 'Unknown'
): Promise<InjectionResult> {

    const result: InjectionResult = {
        success: false,
        injectedCount: 0,
        skippedCount: 0,
        errors: []
    };

    const attrMap = getAttrMap(framework);
    const sourceFiles = discoverSourceFiles(projectRoot);

    // Load all source files into memory once
    const fileContents = new Map<string, string>();
    for (const relPath of sourceFiles) {
        const absPath = path.join(projectRoot, relPath);
        try { fileContents.set(relPath, fs.readFileSync(absPath, 'utf8')); }
        catch { /* skip unreadable */ }
    }

    // Track modifications
    const modifiedFiles = new Map<string, string>();

    for (const element of elements) {

        // Skip if already in registry
        if (registry.hasSegment(element.segmentId)) {
            result.skippedCount++;
            continue;
        }

        const openingTag = extractOpeningTag(element.outerHTML);
        if (!openingTag || openingTag.length < 3) {
            result.skippedCount++;
            result.errors.push(`Empty opening tag for segmentId ${element.segmentId}`);
            continue;
        }

        const variants = buildSearchVariants(openingTag, attrMap);
        let injected = false;

        // Try each source file
        for (const [relPath] of fileContents.entries()) {
            const content = modifiedFiles.get(relPath) || fileContents.get(relPath)!;

            // Try each search variant
            for (const variant of variants) {
                const idx = content.indexOf(variant);
                if (idx === -1) { continue; }

                // Check not already injected
                if (alreadyHasSegmentId(content, idx)) {
                    result.skippedCount++;
                    injected = true;
                    break;
                }

                // Inject
                const updated = injectIntoTag(content, idx, element.segmentId);
                modifiedFiles.set(relPath, updated);
                // Update fileContents so subsequent elements in same file see updated source
                fileContents.set(relPath, updated);

                // Register
                registry.addSegments([{
                    segmentId: element.segmentId,
                    path: '',
                    sourceFile: relPath,
                    tag: element.tag
                }]);

                result.injectedCount++;
                injected = true;
                break;
            }

            if (injected) { break; }
        }

        if (!injected) {
            result.skippedCount++;
            result.errors.push(`Could not locate <${element.tag}> [${element.segmentId}] — snippet: ${openingTag.substring(0, 80)}`);
        }
    }

    // Write all modified files to disk
    for (const [relPath, updatedContent] of modifiedFiles.entries()) {
        const absPath = path.join(projectRoot, relPath);
        try { fs.writeFileSync(absPath, updatedContent, 'utf8'); }
        catch (e: any) { result.errors.push(`Failed to write ${relPath}: ${e.message}`); }
    }

    result.success = result.injectedCount > 0;
    return result;
}