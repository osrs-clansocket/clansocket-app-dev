const ERROR_FLASH_MS = 1000;
const CLASS_LOADING = "is-loading";
const CLASS_ERROR_FLASH = "btn--error-flash";

function flashError(el: HTMLElement): void {
    el.classList.add(CLASS_ERROR_FLASH);
    window.setTimeout(() => el.classList.remove(CLASS_ERROR_FLASH), ERROR_FLASH_MS);
}

export function trackAsync<T>(el: HTMLButtonElement | HTMLFormElement, promise: Promise<T>): Promise<T> {
    el.classList.add(CLASS_LOADING);
    if ("disabled" in el) (el as HTMLButtonElement).disabled = true;
    return promise.then(
        (v) => {
            el.classList.remove(CLASS_LOADING);
            if ("disabled" in el) (el as HTMLButtonElement).disabled = false;
            return v;
        },
        (err) => {
            el.classList.remove(CLASS_LOADING);
            if ("disabled" in el) (el as HTMLButtonElement).disabled = false;
            flashError(el);
            throw err;
        },
    );
}
