import { basename, dirname, extname, isAbsolute, join, normalize, parse, relative, resolve } from "./empty-path-ops.js";

export const sep = "/";
export const delimiter = ":";

export const posix = {
    extname,
    basename,
    dirname,
    join,
    resolve,
    normalize,
    relative,
    isAbsolute,
    parse,
    sep,
    delimiter,
};

export const win32 = {
    extname,
    basename,
    dirname,
    join,
    resolve,
    normalize,
    relative,
    isAbsolute,
    parse,
    sep: "\\",
    delimiter: ";",
};
