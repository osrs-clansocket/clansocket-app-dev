interface SeriesLike {
    points?: { t: unknown; v: number }[];
}

export function dropEmptySeries<T extends SeriesLike>(series: T[]): T[] {
    return series.filter((s) => Array.isArray(s.points) && s.points.length > 0);
}
