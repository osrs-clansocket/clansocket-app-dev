import "./bank/bank-close-renderer.js";
import "./chat/clan-chat-renderer.js";
import "./combat/combat-achievement-renderer.js";
import "./combat/death-renderer.js";
import "./combat/slayer-renderer.js";
import "./drops/loot-renderer.js";
import "./drops/pet-drop-renderer.js";
import "./progression/clue-renderer.js";
import "./progression/collection-log-renderer.js";
import "./progression/diary-renderer.js";
import "./progression/level-up-renderer.js";
import "./progression/quest-renderer.js";
import "./skilling/farming-patch-renderer.js";
import "./social/menu-action-renderer.js";

import { pickRenderer as pickFromStore, listSupportedTriggers as listFromStore } from "./renderer-store.js";

export const pickRenderer = pickFromStore;
export const listSupportedTriggers = listFromStore;
