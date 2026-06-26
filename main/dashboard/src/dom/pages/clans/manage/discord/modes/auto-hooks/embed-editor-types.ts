export interface EmbedState {
    title: string;
    description: string;
    color: string;
    url: string;
    authorName: string;
    authorIconUrl: string;
    footerText: string;
    footerIconUrl: string;
    thumbnailUrl: string;
    imageUrl: string;
}

export interface EmbedEditorCallbacks {
    onChange: (next: Partial<EmbedState>) => void;
}
