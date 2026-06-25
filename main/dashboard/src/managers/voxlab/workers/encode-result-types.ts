export interface ChannelResult {
    slot: string;
    dataURL: string;
}

export interface PbrEncodeOk {
    id: number;
    ok: true;
    results: ChannelResult[];
}

export interface PbrEncodeErr {
    id: number;
    ok: false;
    error: string;
}

export type PbrEncodeResult = PbrEncodeOk | PbrEncodeErr;
