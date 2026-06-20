"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countWords = countWords;
exports.wordCountStatus = wordCountStatus;
exports.deriveBlockStatus = deriveBlockStatus;
exports.canAdvance = canAdvance;
function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}
function wordCountStatus(newText, target) {
    if (!newText?.trim()) {
        return 'empty';
    }
    return countWords(newText) === target ? 'match' : 'mismatch';
}
function deriveBlockStatus(block, state) {
    const newH = state.newHeadings[block.blockId];
    if (!newH) {
        return 'untouched';
    }
    const headingOk = countWords(newH) === block.heading.wordCount;
    const buttonsOk = block.buttons.every((b, i) => {
        const t = state.newButtons[block.blockId]?.[i];
        return t && countWords(t) === b.wordCount;
    });
    const linksOk = block.links.every((l, i) => {
        const t = state.newLinks[block.blockId]?.[i];
        return t && countWords(t) === l.wordCount;
    });
    if (headingOk && buttonsOk && linksOk) {
        return 'complete';
    }
    return 'partial';
}
function canAdvance(state) {
    switch (state.phase) {
        case 1: return state.blocks.length > 0 &&
            state.blocks.every(b => b.bodyText.length > 0 || b.buttons.length > 0 || b.links.length > 0);
        case 2: return state.businessDescription.trim().length > 0;
        case 3: return state.blocks.every(b => deriveBlockStatus(b, state) === 'complete');
        case 4: return state.confirmedHeadings;
        case 5: return state.blocks.filter(b => b.bodyText.length > 0)
            .every(b => {
            const r = state.newBodyText[b.blockId];
            return r && r.length === b.bodyText.length;
        });
        case 6: return true;
        default: return false;
    }
}
//# sourceMappingURL=state.js.map