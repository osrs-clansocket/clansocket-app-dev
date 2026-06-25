export function animateKeyframes(
    el: HTMLElement,
    keyframes: readonly Keyframe[],
    options: KeyframeAnimationOptions,
): Animation {
    return el.animate(keyframes as Keyframe[], options);
}
