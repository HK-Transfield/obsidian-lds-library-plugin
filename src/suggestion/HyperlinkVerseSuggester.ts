import {
    Editor,
    EditorPosition,
    EditorSuggest,
    EditorSuggestContext,
    EditorSuggestTriggerInfo,
    TFile,
} from "obsidian";
import LdsLibraryPlugin from "@/LdsLibraryPlugin";
import { isAvailableLanguage } from "@/lang";
import { HyperlinkVerseSuggestion } from "./HyperlinkVerseSuggestion";

const HYPERLINK_VERSE_REG =
    /^!:(?:\[(\w{3})\]\s+)?([123]*[A-z ]{3,}) (\d{1,3})(?:\s+|:)(\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*):$/i;

export class HyperlinkVerseSuggester extends EditorSuggest<HyperlinkVerseSuggestion> {
    constructor(public plugin: LdsLibraryPlugin) {
        super(plugin.app);
    }

    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        _: TFile | null,
    ): EditorSuggestTriggerInfo | null {
        const currentContent = editor
            .getLine(cursor.line)
            .substring(0, cursor.ch);
        const match = currentContent.match(HYPERLINK_VERSE_REG)?.[0];

        if (!match) return null;

        return {
            start: {
                line: cursor.line,
                ch: currentContent.lastIndexOf(match),
            },
            end: cursor,
            query: match,
        };
    }

    async getSuggestions(
        context: EditorSuggestContext,
    ): Promise<HyperlinkVerseSuggestion[]> {
        const { language: preferredLanguage } = this.plugin.settings;
        const { query } = context;

        const fullMatch = query.match(HYPERLINK_VERSE_REG);

        if (fullMatch === null) return [];

        const language = fullMatch[1] ?? preferredLanguage;
        if (!isAvailableLanguage(language))
            throw new Error(`${language} is not a valid language option`);

        const book = fullMatch[2];
        const chapter = Number(fullMatch[3]);
        const verseString = fullMatch[4];

        const suggestion = await HyperlinkVerseSuggestion.create(
            book,
            chapter,
            verseString,
            language,
        );
        return [suggestion];
    }

    renderSuggestion(suggestion: HyperlinkVerseSuggestion, el: HTMLElement): void {
        suggestion.render(el);
    }

    selectSuggestion(
        suggestion: HyperlinkVerseSuggestion,
        _: MouseEvent | KeyboardEvent,
    ): void {
        if (!this.context) return;

        this.context.editor.replaceRange(
            suggestion.getReplacement(),
            this.context.start,
            this.context.end,
        );
    }
}
