import { CopywriterBlock } from '../snapstakClient';

export type Phase = 1 | 2 | 3 | 4 | 5 | 6;
export type BlockStatus = 'untouched' | 'partial' | 'complete';

export interface PanelState {
    phase: Phase;
    blocks: CopywriterBlock[];
    businessDescription: string;
    keywords: string[];
    activeBlockIndex: number;
    newHeadings: Record<string, string>;
    newButtons:  Record<string, string[]>;
    newLinks:    Record<string, string[]>;
    newBodyText: Record<string, Array<{ text: string; wordCount: number; needsReview: boolean }>>;
    confirmedHeadings: boolean;
}

export function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export function wordCountStatus(
    newText: string | undefined,
    target: number
): 'match' | 'mismatch' | 'empty' {
    if (!newText?.trim()) { return 'empty'; }
    return countWords(newText) === target ? 'match' : 'mismatch';
}

export function deriveBlockStatus(block: CopywriterBlock, state: PanelState): BlockStatus {
    const newH = state.newHeadings[block.blockId];
    if (!newH) { return 'untouched'; }
    const headingOk = countWords(newH) === block.heading.wordCount;
    const buttonsOk = block.buttons.every((b, i) => {
        const t = state.newButtons[block.blockId]?.[i];
        return t && countWords(t) === b.wordCount;
    });
    const linksOk = block.links.every((l, i) => {
        const t = state.newLinks[block.blockId]?.[i];
        return t && countWords(t) === l.wordCount;
    });
    if (headingOk && buttonsOk && linksOk) { return 'complete'; }
    return 'partial';
}

export function canAdvance(state: PanelState): boolean {
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
