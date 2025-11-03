import { ConferenceTalkData } from "@/types";

export function toCalloutString(talk: ConferenceTalkData) {
    const { url, title, author, content, year, month } = talk;

    const header = `>[!ldslib] [${title}](${url})`;
    const body = content.map((p) => `> ${p}`).join("\n>\n");
    const monthText = [month === 4 ? "April" : "October", year].join(" ");
    const byline = ["[!ldslib-byline]", author.name, author.role, monthText]
        .map((s) => `>> ${s}`)
        .join("\n");

    return [header, body, byline, ""].join("\n");
}

export function toHyperlinkString(params: {
    url: string;
    title: string;
    author: string;
    year: number;
    month: 4 | 10;
}): string {
    const { url, title, author, year, month } = params;
    const monthText = month === 4 ? "April" : "October";
    return `${author}, "[${title}](${url})," ${monthText} ${year} General Conference`;
}
