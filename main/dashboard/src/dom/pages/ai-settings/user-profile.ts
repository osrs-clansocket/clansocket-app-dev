import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    icon,
    input,
    paragraph,
    section,
    span,
    textarea,
    type Instance,
    baseProps,
    textProps,
} from "../../factory";
import { profileStore, type SessionEntry } from "../../../ai/profile-store";
import { buildSubAccordion } from "./sub-accordion.js";

const ROOT_CLASS = "ai-settings-profile";
const HINT_CLASS = "ai-settings-profile__hint";
const SECTION_BODY_CLASS = "ai-settings-profile__section";
const EMPTY_CLASS = "ai-settings-profile__empty";
const ADD_ROW_CLASS = "ai-settings-profile__add-row";
const ENTRY_LIST_CLASS = "ai-settings-profile__entries";
const ENTRY_CLASS = "ai-settings-profile__entry";
const ENTRY_CONTENT_CLASS = "ai-settings-profile__entry-content";
const ENTRY_KEY_CLASS = "ai-settings-profile__entry-key";
const ENTRY_VALUE_CLASS = "ai-settings-profile__entry-value";
const ENTRY_ACTIONS_CLASS = "ai-settings-profile__entry-actions";
const ICON_BTN_CLASS = "ai-settings-profile__icon-btn";
const ICON_BTN_DESTRUCTIVE_CLASS = "ai-settings-profile__icon-btn--destructive";
const FORM_CLASS = "ai-settings-profile__form";
const FORM_FIELD_CLASS = "ai-settings-profile__form-field";
const FORM_LABEL_CLASS = "ai-settings-profile__form-label";
const FORM_ACTIONS_CLASS = "ai-settings-profile__form-actions";
const INPUT_CLASS = "ai-settings-profile__input";
const TEXTAREA_CLASS = "ai-settings-profile__textarea";
const SESSION_LIST_CLASS = "ai-settings-profile__sessions";
const SESSION_CARD_CLASS = "ai-settings-profile__session";
const SESSION_HEADER_CLASS = "ai-settings-profile__session-header";
const SESSION_TURN_CLASS = "ai-settings-profile__session-turn";
const SESSION_FIELDS_CLASS = "ai-settings-profile__session-fields";
const SESSION_FIELD_CLASS = "ai-settings-profile__session-field";
const SESSION_FIELD_LABEL_CLASS = "ai-settings-profile__session-label";
const SESSION_FIELD_TEXT_CLASS = "ai-settings-profile__session-text";
const FOCUS_LINE_CLASS = "ai-settings-profile__focus";
const FOCUS_TEXT_CLASS = "ai-settings-profile__focus-text";
const CLEAR_ROW_CLASS = "ai-settings-profile__clear-row";

type IdentityEdit = { kind: "identity-new" } | { kind: "identity-edit"; key: string } | null;
type FocusEdit = { kind: "focus" } | null;
type SessionEdit = { kind: "session-new" } | { kind: "session-edit"; turn: number } | null;

interface SectionHosts {
    identity: Instance;
    focus: Instance;
    session: Instance;
}

interface ProfileState {
    identityEdit: IdentityEdit;
    focusEdit: FocusEdit;
    sessionEdit: SessionEdit;
}

interface IconBtnOpts {
    readonly icon: string;
    readonly label: string;
    readonly onClick: () => void;
    readonly destructive?: boolean;
}

function iconBtn(opts: IconBtnOpts): Instance {
    const classes = opts.destructive === true ? [ICON_BTN_CLASS, ICON_BTN_DESTRUCTIVE_CLASS] : [ICON_BTN_CLASS];
    return button(
        {
            classes,
            ariaLabel: opts.label,
            title: opts.label,
            context: opts.label,
            meta: [opts.destructive === true ? "destructive" : "action"],
            onClick: opts.onClick,
        },
        [icon({ name: opts.icon, context: null, meta: null }).el],
    );
}

function emptyMessage(text: string): Instance {
    return paragraph(textProps([EMPTY_CLASS], text));
}

function addBtn(label: string, onClick: () => void): Instance {
    return div(baseProps([ADD_ROW_CLASS]), [
        button({
            variant: BTN_VARIANT_OUTLINE,
            text: label,
            ariaLabel: label,
            context: label,
            meta: ["action"],
            onClick,
        }),
    ]);
}

function buildIdentityForm(
    state: ProfileState,
    rebuildIdentity: () => void,
    existingKey: string | null,
    existingValue: string,
): Instance {
    const keyInput = input({
        classes: [INPUT_CLASS],
        value: existingKey ?? "",
        placeholder: "key.path",
        ariaLabel: "Identity key",
        context: "edit identity key",
        meta: ["input"],
    });
    const valueInput = input({
        classes: [INPUT_CLASS],
        value: existingValue,
        placeholder: "value",
        ariaLabel: "Identity value",
        context: "edit identity value",
        meta: ["input"],
    });
    const save = (): void => {
        const newKey = keyInput.el.value.trim();
        const newValue = valueInput.el.value.trim();
        if (newKey.length === 0 || newValue.length === 0) return;
        if (existingKey !== null && existingKey !== newKey) profileStore.removeIdentity(existingKey);
        profileStore.setIdentity(newKey, newValue);
        state.identityEdit = null;
        rebuildIdentity();
    };
    const cancel = (): void => {
        state.identityEdit = null;
        rebuildIdentity();
    };
    return div(baseProps([FORM_CLASS]), [
        div(baseProps([FORM_FIELD_CLASS]), [span(textProps([FORM_LABEL_CLASS], "Key")), keyInput]),
        div(baseProps([FORM_FIELD_CLASS]), [span(textProps([FORM_LABEL_CLASS], "Value")), valueInput]),
        div(baseProps([FORM_ACTIONS_CLASS]), [
            iconBtn({ icon: "check-lg", label: "save", onClick: save }),
            iconBtn({ icon: "x-lg", label: "cancel", onClick: cancel }),
        ]),
    ]);
}

function buildIdentityEntry(state: ProfileState, rebuildIdentity: () => void, key: string, value: string): Instance {
    if (state.identityEdit?.kind === "identity-edit" && state.identityEdit.key === key) {
        return buildIdentityForm(state, rebuildIdentity, key, value);
    }
    return div(baseProps([ENTRY_CLASS]), [
        div(baseProps([ENTRY_CONTENT_CLASS]), [
            span(textProps([ENTRY_KEY_CLASS], key)),
            span(textProps([ENTRY_VALUE_CLASS], value)),
        ]),
        div(baseProps([ENTRY_ACTIONS_CLASS]), [
            iconBtn({
                icon: "pencil",
                label: "edit",
                onClick: () => {
                    state.identityEdit = { kind: "identity-edit", key };
                    rebuildIdentity();
                },
            }),
            iconBtn({
                icon: "trash",
                label: "remove",
                destructive: true,
                onClick: () => {
                    profileStore.removeIdentity(key);
                    rebuildIdentity();
                },
            }),
        ]),
    ]);
}

function renderIdentityBody(state: ProfileState, host: Instance): void {
    const rebuild = (): void => renderIdentityBody(state, host);
    const body = div(baseProps([SECTION_BODY_CLASS]));
    body.addChild(
        addBtn("+ add fact", () => {
            state.identityEdit = { kind: "identity-new" };
            rebuild();
        }),
    );
    if (state.identityEdit?.kind === "identity-new") {
        body.addChild(buildIdentityForm(state, rebuild, null, ""));
    }
    const identity = profileStore.load().identity;
    const keys = Object.keys(identity).sort();
    if (keys.length === 0 && state.identityEdit?.kind !== "identity-new") {
        body.addChild(emptyMessage("No identity facts yet."));
    } else if (keys.length > 0) {
        const list = div(baseProps([ENTRY_LIST_CLASS]));
        for (const k of keys) list.addChild(buildIdentityEntry(state, rebuild, k, identity[k]!));
        body.addChild(list);
    }
    host.setChildren(body);
}

function buildFocusForm(state: ProfileState, rebuildFocus: () => void, existing: string): Instance {
    const focusInput = input({
        classes: [INPUT_CLASS],
        value: existing,
        placeholder: "current focus thread",
        ariaLabel: "Focus value",
        context: "edit focus thread",
        meta: ["input"],
    });
    const save = (): void => {
        const v = focusInput.el.value.trim();
        profileStore.setFocus(v.length > 0 ? v : null);
        state.focusEdit = null;
        rebuildFocus();
    };
    const cancel = (): void => {
        state.focusEdit = null;
        rebuildFocus();
    };
    return div(baseProps([FORM_CLASS]), [
        div(baseProps([FORM_FIELD_CLASS]), [span(textProps([FORM_LABEL_CLASS], "Thread")), focusInput]),
        div(baseProps([FORM_ACTIONS_CLASS]), [
            iconBtn({ icon: "check-lg", label: "save", onClick: save }),
            iconBtn({ icon: "x-lg", label: "cancel", onClick: cancel }),
        ]),
    ]);
}

function renderFocusBody(state: ProfileState, host: Instance): void {
    const rebuild = (): void => renderFocusBody(state, host);
    const body = div(baseProps([SECTION_BODY_CLASS]));
    if (state.focusEdit?.kind === "focus") {
        body.addChild(buildFocusForm(state, rebuild, profileStore.load().focus ?? ""));
        host.setChildren(body);
        return;
    }
    const focus = profileStore.load().focus;
    if (focus === null) {
        body.addChild(emptyMessage("No focus thread set."));
        body.addChild(
            addBtn("+ set focus", () => {
                state.focusEdit = { kind: "focus" };
                rebuild();
            }),
        );
    } else {
        body.addChild(
            div(baseProps([FOCUS_LINE_CLASS]), [
                span(textProps([FOCUS_TEXT_CLASS], focus)),
                div(baseProps([ENTRY_ACTIONS_CLASS]), [
                    iconBtn({
                        icon: "pencil",
                        label: "edit",
                        onClick: () => {
                            state.focusEdit = { kind: "focus" };
                            rebuild();
                        },
                    }),
                    iconBtn({
                        icon: "trash",
                        label: "clear",
                        destructive: true,
                        onClick: () => {
                            profileStore.setFocus(null);
                            rebuild();
                        },
                    }),
                ]),
            ]),
        );
    }
    host.setChildren(body);
}

const SESSION_FIELDS: { key: keyof Omit<SessionEntry, "turn">; label: string; multiline: boolean }[] = [
    { key: "they", label: "They", multiline: true },
    { key: "i", label: "I", multiline: true },
    { key: "learned", label: "Learned", multiline: true },
    { key: "fix", label: "Fix", multiline: true },
    { key: "failure", label: "Failure", multiline: true },
];

function buildSessionForm(state: ProfileState, rebuildSession: () => void, existing: SessionEntry | null): Instance {
    const refs: Partial<Record<keyof Omit<SessionEntry, "turn">, Instance<HTMLTextAreaElement>>> = {};
    const fields: Instance[] = SESSION_FIELDS.map(({ key, label }) => {
        const ta = textarea({
            classes: [TEXTAREA_CLASS],
            value: existing?.[key] ?? "",
            placeholder: label.toLowerCase(),
            ariaLabel: `Session field ${label}`,
            context: `edit session field ${label}`,
            meta: ["input"],
        });
        refs[key] = ta;
        return div(baseProps([FORM_FIELD_CLASS]), [span(textProps([FORM_LABEL_CLASS], label)), ta]);
    });
    const save = (): void => {
        const entry: SessionEntry = {
            turn: existing?.turn ?? 0,
            they: refs.they!.el.value.trim(),
            i: refs.i!.el.value.trim(),
        };
        const learned = refs.learned!.el.value.trim();
        const fix = refs.fix!.el.value.trim();
        const failure = refs.failure!.el.value.trim();
        if (learned.length > 0) entry.learned = learned;
        if (fix.length > 0) entry.fix = fix;
        if (failure.length > 0) entry.failure = failure;
        if (existing === null) profileStore.addSession(entry);
        else profileStore.updateSession(existing.turn, entry);
        state.sessionEdit = null;
        rebuildSession();
    };
    const cancel = (): void => {
        state.sessionEdit = null;
        rebuildSession();
    };
    return div(baseProps([FORM_CLASS]), [
        ...fields,
        div(baseProps([FORM_ACTIONS_CLASS]), [
            iconBtn({ icon: "check-lg", label: "save", onClick: save }),
            iconBtn({ icon: "x-lg", label: "cancel", onClick: cancel }),
        ]),
    ]);
}

function buildSessionCard(state: ProfileState, rebuildSession: () => void, entry: SessionEntry): Instance {
    if (state.sessionEdit?.kind === "session-edit" && state.sessionEdit.turn === entry.turn) {
        return buildSessionForm(state, rebuildSession, entry);
    }
    const fieldNodes: Instance[] = [];
    for (const { key, label } of SESSION_FIELDS) {
        const v = entry[key];
        if (v === undefined || v === null || v.length === 0) continue;
        fieldNodes.push(
            div(baseProps([SESSION_FIELD_CLASS]), [
                span(textProps([SESSION_FIELD_LABEL_CLASS], label)),
                span(textProps([SESSION_FIELD_TEXT_CLASS], v)),
            ]),
        );
    }
    return div(baseProps([SESSION_CARD_CLASS]), [
        div(baseProps([SESSION_HEADER_CLASS]), [
            span(textProps([SESSION_TURN_CLASS], `Turn ${entry.turn}`)),
            div(baseProps([ENTRY_ACTIONS_CLASS]), [
                iconBtn({
                    icon: "pencil",
                    label: "edit",
                    onClick: () => {
                        state.sessionEdit = { kind: "session-edit", turn: entry.turn };
                        rebuildSession();
                    },
                }),
                iconBtn({
                    icon: "trash",
                    label: "remove",
                    destructive: true,
                    onClick: () => {
                        profileStore.removeSession(entry.turn);
                        rebuildSession();
                    },
                }),
            ]),
        ]),
        div(baseProps([SESSION_FIELDS_CLASS]), fieldNodes),
    ]);
}

function renderSessionBody(state: ProfileState, host: Instance): void {
    const rebuild = (): void => renderSessionBody(state, host);
    const body = div(baseProps([SECTION_BODY_CLASS]));
    body.addChild(
        addBtn("+ add entry", () => {
            state.sessionEdit = { kind: "session-new" };
            rebuild();
        }),
    );
    if (state.sessionEdit?.kind === "session-new") {
        body.addChild(buildSessionForm(state, rebuild, null));
    }
    const entries = profileStore.load().session;
    if (entries.length === 0 && state.sessionEdit?.kind !== "session-new") {
        body.addChild(emptyMessage("No session entries yet."));
    } else if (entries.length > 0) {
        const list = div(baseProps([SESSION_LIST_CLASS]));
        for (const e of [...entries].reverse()) list.addChild(buildSessionCard(state, rebuild, e));
        body.addChild(list);
    }
    host.setChildren(body);
}

function buildClearBtn(state: ProfileState, hosts: SectionHosts): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        text: "Clear profile",
        ariaLabel: "Clear Varez profile",
        context: "clear the entire Varez profile",
        meta: ["destructive"],
        onClick: () => {
            state.identityEdit = null;
            state.focusEdit = null;
            state.sessionEdit = null;
            profileStore.clear();
            renderIdentityBody(state, hosts.identity);
            renderFocusBody(state, hosts.focus);
            renderSessionBody(state, hosts.session);
        },
    });
}

export function renderUserProfile(host: Instance): void {
    const state: ProfileState = { identityEdit: null, focusEdit: null, sessionEdit: null };

    const identityHost = div({ context: null, meta: null });
    const focusHost = div({ context: null, meta: null });
    const sessionHost = div({ context: null, meta: null });
    const hosts: SectionHosts = { identity: identityHost, focus: focusHost, session: sessionHost };

    renderIdentityBody(state, identityHost);
    renderFocusBody(state, focusHost);
    renderSessionBody(state, sessionHost);

    const identityAcc = buildSubAccordion({
        id: "identity",
        title: "Identity",
        icon: "person-badge",
        defaultOpen: true,
        body: identityHost,
    });
    const focusAcc = buildSubAccordion({
        id: "focus",
        title: "Focus",
        icon: "bullseye",
        defaultOpen: true,
        body: focusHost,
    });
    const sessionAcc = buildSubAccordion({
        id: "session",
        title: "AI logs",
        icon: "journal-text",
        body: sessionHost,
    });

    const helpEl = paragraph(
        textProps(
            [HINT_CLASS],
            "Varez's picture of you, built across conversations. Stored only in this browser — edit any field, clear any time.",
        ),
    );
    const clearRow = div(baseProps([CLEAR_ROW_CLASS]), [buildClearBtn(state, hosts)]);

    const sec: Instance = section(baseProps([ROOT_CLASS]), [helpEl, identityAcc, focusAcc, sessionAcc, clearRow]);
    host.setChildren(sec);
}
