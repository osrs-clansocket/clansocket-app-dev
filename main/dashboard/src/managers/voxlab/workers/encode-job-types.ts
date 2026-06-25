export interface ChannelJob {
    slot: string;
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

export interface PbrEncodeJob {
    id: number;
    channels: ChannelJob[];
}
