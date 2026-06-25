import _Prism from "prismjs";

(globalThis as typeof globalThis & { Prism: typeof _Prism }).Prism = _Prism;

export const Prism = _Prism;
