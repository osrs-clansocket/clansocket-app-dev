export interface TimePoint {
    t: string | number;
    v: number;
}

export interface SparkSeries {
    label?: string;
    points: TimePoint[];
}

export interface TimeLineData {
    series: SparkSeries[];
    yLabel?: string;
}
