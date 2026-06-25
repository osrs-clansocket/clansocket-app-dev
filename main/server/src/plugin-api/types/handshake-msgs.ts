import type { PluginLoginState } from "./shared.js";

export type HelloMsg = { type: "hello"; protocolVersion?: number; token?: string };
export type PingMsg = { type: "ping"; ts?: number };
export type ResponseMsg = { type: "rsn_verify_response"; requestId: number; action: "confirm" | "reject" };
export type LoginStateMsg = { type: "login_state"; state: PluginLoginState };
