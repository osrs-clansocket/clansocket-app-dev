export function cutoffFromNow(msAgo: number): string {
    return new Date(Date.now() - msAgo).toISOString();
}
