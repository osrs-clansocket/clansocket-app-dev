import {
    BINARY_FORMAT_VERSION as _BINARY_FORMAT_VERSION,
    BINARY_HEADER_BYTES as _BINARY_HEADER_BYTES,
    BINARY_MAGIC as _BINARY_MAGIC,
} from "./serialize-binary-header.js";
export const BINARY_FORMAT_VERSION = _BINARY_FORMAT_VERSION;
export const BINARY_HEADER_BYTES = _BINARY_HEADER_BYTES;
export const BINARY_MAGIC = _BINARY_MAGIC;
import { parseJson as _parseJson, serializeJson as _serializeJson } from "./serialize-json.js";
export const parseJson = _parseJson;
export const serializeJson = _serializeJson;
import { serializeBinary as _serializeBinary } from "./serialize-binary-write.js";
export const serializeBinary = _serializeBinary;
import { parseBinary as _parseBinary } from "./serialize-binary-read.js";
export const parseBinary = _parseBinary;
