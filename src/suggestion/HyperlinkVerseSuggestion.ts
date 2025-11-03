import { AvailableLanguage } from "@/lang";
import { bookData } from "@/utils/config";
import { fetchScripture } from "@/utils/scripture";

export class HyperlinkVerseSuggestion {
    private bookTitleInLanguage: string;
    private verseIds: string;
    private url: string;

    private constructor(
        public book: string,
        public chapter: number,
        public verseString: string,
        public lang: AvailableLanguage,
    ) {
        this.verseIds = verseString
            .split(",")
            .map((range) =>
                range
                    .split("-")
                    .map((verse) => `p${verse}`)
                    .join("-"),
            )
            .join(",");
    }

    // factory function
    static async create(
        book: string,
        chapter: number,
        verseString: string,
        lang: AvailableLanguage,
    ) {
        const suggestion = new HyperlinkVerseSuggestion(
            book,
            chapter,
            verseString,
            lang,
        );

        await suggestion.loadVerse();
        return suggestion;
    }

    public getReplacement(): string {
        const range = this.verseString.replaceAll(",", ", ");
        return `[${this.bookTitleInLanguage} ${this.chapter}:${range}](${this.url})`;
    }

    private getUrl(volumeTitleShort: string, bookTitleShort: string): string {
        return `https://www.churchofjesuschrist.org/study/scriptures/${volumeTitleShort}/${bookTitleShort}/${this.chapter}?lang=${this.lang}&id=${this.verseIds}`;
    }

    private getShortenedName(bookTitle: string) {
        for (const [name, info] of Object.entries(bookData)) {
            if (
                info.names.some(
                    (name) => name.toLowerCase() === bookTitle.toLowerCase(),
                )
            ) {
                const volume = info.volume;
                return [name, volume];
            }
        }
        return ["", ""];
    }

    private async loadVerse(): Promise<void> {
        const [bookTitleShort, volumeTitleShort] = this.getShortenedName(
            this.book,
        );

        if (bookTitleShort === "" || volumeTitleShort === "")
            throw new Error(`Couldn't find book name ${this.book}`);

        this.url = this.getUrl(volumeTitleShort, bookTitleShort);

        const scriptureData = await fetchScripture(this.url);
        this.bookTitleInLanguage = scriptureData.nativeBookTitle;
    }

    public render(el: HTMLElement): void {
        const outer = el.createDiv({ cls: "obr-suggester-container" });
        const range = this.verseString.replaceAll(",", ", ");
        outer.createDiv({ cls: "obr-shortcode" }).setText(
            `Create hyperlink for ${this.bookTitleInLanguage} ${this.chapter}:${range}`
        );
    }
}
