export type HoldStatus = "hold" | "skip";

export interface RuntimeHoldOverlay {
    readonly flow_id: string;
    readonly flow_name: string;
    readonly action_id: string;
    readonly hold_status: HoldStatus;
    readonly set_by_account_hash: string | null;
    readonly set_by_rsn: string | null;
    readonly set_at: number;
    readonly expires_at: number | null;
    readonly reason: string | null;
}
