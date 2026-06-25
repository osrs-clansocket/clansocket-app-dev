import { makeTooltip, type Tooltip } from "../../shared/types/tooltip-types.js";

export const TOOLTIPS_RUNTIME: Readonly<Record<string, Tooltip>> = {
    ai_address_form: makeTooltip(
        "what the AI calls u when talking to u directly.",
        "some prefer their rsn, some a nickname, some no name at all (more impersonal).",
        "pick one. rsn = ur osrs name. nickname = informal handle. display-name = ur dashboard name. none = no addressing.",
    ),
    ai_pronouns: makeTooltip(
        "pronouns (he/she/they/etc) the AI uses when referring to u.",
        "pick what fits — or 'none' if u dont want pronouns at all (the default).",
        "pick from the dropdown.",
    ),
    ai_time_format: makeTooltip(
        "12-hour or 24-hour clock for any time the AI shows in chat.",
        "'3pm' vs '15:00' — locale + personal preference.",
        "pick one.",
    ),
    ai_date_format: makeTooltip(
        "how dates show in chat.",
        "different regions write dates differently — pick the one u read fastest.",
        "pick: DMY (europe), MDY (us), YMD (asia/iso-style), ISO (YYYY-MM-DD format).",
    ),
    ai_reaction_ceiling: makeTooltip(
        "max hype level the AI can reach.",
        "even with reaction levels set, big celebrations might feel too loud. this caps how loud it ever gets.",
        "pick: muted (chill, no spontaneous reactions), normal (default), high (let it max out).",
    ),
    ai_verbosity_default: makeTooltip(
        "how long the AIs replies are by default.",
        "some want short always; others want full breakdowns. sets the baseline.",
        "free text. typical: 'match the ask — chill q gets chill reply, big q gets full breakdown, never shrink because the msg sounded casual'.",
    ),
    ai_markdown_policy: makeTooltip(
        "when the AI uses markdown (tables, lists, bold) vs plain text.",
        "dashboard renders markdown nicely; some prefer plain prose tho.",
        "free text. typical: 'auto — use markdown for data, plain prose for conversation'.",
    ),
    ai_time_narration_policy: makeTooltip(
        "when the AI mentions the time of day in chat.",
        "it knows ur local time. without rules it might keep saying 'its 3am' — annoying as a tic.",
        "free text. typical: 'silent by default — only mention time when it actually matters (scheduling, stale data, time-of-day mechanics)'.",
    ),
    ai_chain_auto_limit: makeTooltip(
        "cap on how many AI turns can run in a row without u sending another msg.",
        "when the AI fetches data or does multi-step work, it chains its own turns. without a cap it could loop forever.",
        "slide 3-20. lower = gives up faster. higher = persists more. default = 10.",
    ),
    ai_chain_auto_limit_warn_at: makeTooltip(
        "the turn where the AI starts wrapping up, before hitting the hard cap.",
        "graceful 'we are getting long, want me to keep going?' instead of just stopping cold.",
        "slide 2-19. must be less than the max above. default = 9.",
    ),
    ai_poll_min_seconds: makeTooltip(
        "in live mode, the shortest gap between checks.",
        "live mode = AI watches stuff in real-time. too fast = battery drain + chat spam. this is the floor.",
        "slide 5-60 seconds. lower = tighter loop, more responsive but more pings. default = 15.",
    ),
    ai_poll_max_seconds: makeTooltip(
        "in live mode, the longest gap between checks.",
        "when nothings happening, the AI can chill. this is the ceiling for how slow it goes.",
        "slide 60-600 seconds. higher = more relaxed when quiet. default = 120.",
    ),
    ai_history_window: makeTooltip(
        "how many of ur recent msgs the AI keeps in mind.",
        "it needs context to know what u just asked or said. too small = forgets fast; too big = takes up space.",
        "slide 5-50 messages. default = 20.",
    ),
    ai_clarify_threshold: makeTooltip(
        "how often the AI stops to ask 'do u mean X or Y?' vs just going with its best guess.",
        "some hate being asked stuff repeatedly. others want confirm-first before any action.",
        "free text. typical: 'ask only when it matters — if the ambiguity changes what i do, ask; otherwise go'.",
    ),
    ai_suggestion_policy: makeTooltip(
        "when the AI offers a 'u could say X' suggestion after replying.",
        "some like the nudge; others find it presumptuous.",
        "free text. typical: 'only when the next step is obvious — never generic like anything else?'.",
    ),
    ai_discovery_verbosity: makeTooltip(
        "how much the AI checks ur data before answering questions about it.",
        "thorough = more accurate. too thorough = slow + lots of queries.",
        "free text. typical: 'thorough — peek at the structure first, sample before claiming no results, dont assume'.",
    ),
    ai_quiet_hours: makeTooltip(
        "times of day when the AI holds back non-urgent msgs.",
        "live mode can ping at any hour. set quiet hours so it doesnt buzz u at 3am.",
        "free text. one line per range. like '22:00–08:00: batch only' or '23:00–07:00: silent unless rare drop'. leave blank for no gating.",
    ),
    ai_domain_priorities: makeTooltip(
        "which kinds of events the AI shouts about vs treats as routine.",
        "without priorities, everything gets equal attention — interesting events get buried in noise.",
        "free text. list event types by priority. like 'always: rare drops, pets, deaths. usually: 99s, raids. routine: xp, small drops'.",
    ),
    ai_watched_rsns: makeTooltip(
        "clannies the AI gives extra attention to.",
        "in a big clan, AI cant narrate everyone equally. watched accounts get tighter coverage.",
        "one rsn per line. AI bumps how often it narrates these accounts.",
    ),
    ai_topic_avoids: makeTooltip(
        "stuff the AI never narrates, no matter how big the event is.",
        "some events u just dont want surfaced — shame deaths, clan drama, whatever.",
        "one topic per line. AI silently drops events that match.",
    ),
};
