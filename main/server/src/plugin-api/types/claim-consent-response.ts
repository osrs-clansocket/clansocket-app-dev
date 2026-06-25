export type ClaimConsentResponse = {
    type: "claim_consent_response";
    requestId: number;
    action: "confirm" | "reject";
    clanProof?: {
        roster?: {
            clanName: string;
            fingerprint: string;
            members: { name: string; rank: string | null; joinedAt: string | null }[];
        };
        titles?: {
            clanName: string;
            fingerprint: string;
            titles: { rank: number; titleId: number; title: string }[];
        };
    };
};
