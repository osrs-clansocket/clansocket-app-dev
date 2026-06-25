const joinSegments = (...args: string[]): string => args.join("/");

export const join = joinSegments;
export const resolve = joinSegments;
