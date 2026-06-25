export function whenInstance<T extends HTMLElement, R>(
    el: HTMLElement,
    ctor: abstract new (...args: never[]) => T,
    onOk: (typedEl: T) => R,
    onFail: () => R,
): R {
    return el instanceof ctor ? onOk(el as T) : onFail();
}
