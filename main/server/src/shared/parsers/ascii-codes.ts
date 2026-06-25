export const ASCII_UPPER_A = 65;
export const ASCII_UPPER_Z = 90;
export const ASCII_LOWER_A = 97;
export const ASCII_LOWER_Z = 122;
export const ASCII_DIGIT_0 = 48;
export const ASCII_DIGIT_9 = 57;
export const ASCII_SPACE = 32;
export const ASCII_HYPHEN = 45;
export const ASCII_UNDERSCORE = 95;
export const ASCII_UPPER_TO_LOWER_OFFSET = 32;

export function inRange<T extends number | string>(value: T, lo: T, hi: T): boolean {
    return value >= lo && value <= hi;
}
