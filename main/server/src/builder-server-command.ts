export function buildServerCommand(serverScript: string): string {
    const quote = (a: string): string => {
        for (let i = 0; i < a.length; i++) {
            const c = a.charAt(i);
            if (c === " " || c === "\t") return `"${a}"`;
        }
        return a;
    };
    return ["npx", "tsx", "--watch", serverScript].map(quote).join(" ");
}
