import type { Instance } from "../../../../factory";

export function makeSentinelObserver(sentinel: Instance, appendMore: () => void): IntersectionObserver {
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries.some((e) => e.isIntersecting)) appendMore();
        },
        { rootMargin: "2000px" },
    );
    observer.observe(sentinel.el);
    return observer;
}
