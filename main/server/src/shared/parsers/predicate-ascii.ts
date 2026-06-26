import {
    ASCII_DIGIT_0,
    ASCII_DIGIT_9,
    ASCII_LOWER_A,
    ASCII_LOWER_Z,
    ASCII_UPPER_A,
    ASCII_UPPER_Z,
    inRange,
} from "./ascii-codes.js";

export const isAsciiDigit = (code: number): boolean => inRange(code, ASCII_DIGIT_0, ASCII_DIGIT_9);
export const isAsciiLower = (code: number): boolean => inRange(code, ASCII_LOWER_A, ASCII_LOWER_Z);
export const isAsciiUpper = (code: number): boolean => inRange(code, ASCII_UPPER_A, ASCII_UPPER_Z);
export const isAsciiAlpha = (code: number): boolean => isAsciiLower(code) || isAsciiUpper(code);
export const isAsciiAlphanumeric = (code: number): boolean => isAsciiDigit(code) || isAsciiAlpha(code);
