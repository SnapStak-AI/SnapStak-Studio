"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInjectionMap = buildInjectionMap;
exports.writeInjectedContent = writeInjectedContent;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function buildInjectionMap(blocks, state) {
    const map = [];
    for (const block of blocks) {
        // Guard: only inject heading if a rewrite actually exists
        const newHeading = state.newHeadings[block.blockId];
        if (newHeading && newHeading.trim()) {
            map.push({
                nodeId: block.blockId,
                type: 'heading',
                originalText: block.heading.text,
                newText: newHeading
            });
        }
        block.buttons.forEach((btn, i) => {
            const t = state.newButtons[block.blockId]?.[i];
            if (t) {
                map.push({ nodeId: `${block.blockId}_btn_${i}`, type: 'button', originalText: btn.text, newText: t });
            }
        });
        block.links.forEach((link, i) => {
            const t = state.newLinks[block.blockId]?.[i];
            if (t) {
                map.push({ nodeId: `${block.blockId}_link_${i}`, type: 'link', originalText: link.text, newText: t });
            }
        });
        state.newBodyText[block.blockId]?.forEach((rewrite, i) => {
            if (!rewrite.needsReview) {
                map.push({
                    nodeId: `${block.blockId}_body_${i}`,
                    type: 'bodyText',
                    originalText: block.bodyText[i].text,
                    newText: rewrite.text
                });
            }
        });
    }
    return map;
}
async function writeInjectedContent(projectRoot, map) {
    const exts = ['.html', '.jsx', '.tsx', '.vue', '.js', '.ts'];
    const files = walkDir(projectRoot, exts);
    for (const filePath of files) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        for (const entry of map) {
            if (content.includes(entry.originalText)) {
                content = content.split(entry.originalText).join(entry.newText);
                modified = true;
            }
        }
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
}
function walkDir(dir, exts) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
            results.push(...walkDir(full, exts));
        }
        else if (entry.isFile() && exts.includes(path.extname(entry.name))) {
            results.push(full);
        }
    }
    return results;
}
//# sourceMappingURL=injection.js.map