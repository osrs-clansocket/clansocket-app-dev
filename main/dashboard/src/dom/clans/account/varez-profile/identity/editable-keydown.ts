export function makeKeydown(save: () => void, cancel: () => void): (e: KeyboardEvent) => void {
    return (e: KeyboardEvent): void => {
        if (e.key === "Enter") {
            e.preventDefault();
            save();
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
        }
    };
}
