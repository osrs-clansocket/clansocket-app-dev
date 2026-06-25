import {
    extname as _extname,
    basename as _basename,
    dirname as _dirname,
    join as _join,
    resolve as _resolve,
    normalize as _normalize,
    relative as _relative,
    isAbsolute as _isAbsolute,
    parse as _parse,
} from "./empty-path-ops.js";
export const extname = _extname;
export const basename = _basename;
export const dirname = _dirname;
export const join = _join;
export const resolve = _resolve;
export const normalize = _normalize;
export const relative = _relative;
export const isAbsolute = _isAbsolute;
export const parse = _parse;
import { sep as _sep, delimiter as _delimiter, posix as _posix, win32 as _win32 } from "./empty-path-namespaces.js";
export const sep = _sep;
export const delimiter = _delimiter;
export const posix = _posix;
export const win32 = _win32;

export default {
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
    posix,
    win32,
};
