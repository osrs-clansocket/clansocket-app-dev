import { image } from "../../../factory/content-ops/graphics/media.js";
import { MAP_NAME_CARD_PRAYER_ICON_CLASS } from "../../../../shared/constants/clan/clan-map-constants.js";
import { prayerSpriteSrc, type CardRefs } from "./names-card.js";

export function syncPrayerImages(card: CardRefs, active: readonly string[]): void {
    const wanted = new Set(active);
    for (const [name, inst] of card.prayerImgs) {
        if (!wanted.has(name)) {
            inst.detach();
            card.prayerImgs.delete(name);
        }
    }
    for (const name of active) {
        if (card.prayerImgs.has(name)) continue;
        const inst = image({
            src: prayerSpriteSrc(name),
            alt: name,
            title: name,
            classes: [MAP_NAME_CARD_PRAYER_ICON_CLASS],
            lazy: false,
            context: null,
            meta: null,
        });
        card.prayerImgs.set(name, inst);
        card.prayersInst.addChild(inst);
    }
}
