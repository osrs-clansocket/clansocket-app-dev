import { anchor, button, div, effect, input, type Instance } from "../../factory";
import { siteOwnerStore } from "../../../state/identity/stores/site-owner-store.js";
import {
    ROUTE_HOME_CONTROLS_CLASS,
    ROUTE_HOME_CONTROLS_INNER_CLASS,
    ROUTE_HOME_FILE_INPUT_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";
import {
    BTN_CLASS,
    BTN_COMPACT_CLASS,
    BTN_OUTLINE_CLASS,
    UPLOAD_ACCEPT,
    URL_VOXLAB,
} from "../../../shared/constants/home/render-home-data.js";
import { handleLogoUpload } from "../../../state/home/render-home-upload.js";

function buildUploadParts(): { btn: Instance; fileInput: Instance<HTMLInputElement> } {
    const fileInput = input({
        classes: [ROUTE_HOME_FILE_INPUT_CLASS],
        type: "file",
        accept: UPLOAD_ACCEPT,
        ariaLabel: "Upload site logo",
        context: "pick an image or voxlab envelope to upload as the site logo",
        meta: ["input"],
        onChange: async () => {
            const file = fileInput.el.files?.[0];
            if (file) await handleLogoUpload(file);
        },
    });
    const btn = button({
        classes: [BTN_CLASS, BTN_OUTLINE_CLASS, BTN_COMPACT_CLASS],
        text: "Upload logo",
        type: "button",
        context: "upload an image or voxlab envelope as the site logo",
        meta: ["action"],
        onClick: () => fileInput.el.click(),
    });
    return { btn, fileInput };
}

function buildEditButton(): Instance {
    return anchor({
        href: URL_VOXLAB,
        data: { route: "" },
        classes: [BTN_CLASS, BTN_OUTLINE_CLASS, BTN_COMPACT_CLASS],
        text: "Edit in voxlab",
        context: "open the voxlab editor to tweak the site logo",
        meta: ["nav"],
    });
}

export function buildHeroControls(): Instance {
    const { btn: uploadBtn, fileInput } = buildUploadParts();
    const inner = div({ classes: [ROUTE_HOME_CONTROLS_INNER_CLASS], context: null, meta: null }, [
        buildEditButton(),
        uploadBtn,
        fileInput,
    ]);
    const controls = div({ classes: [ROUTE_HOME_CONTROLS_CLASS], context: null, meta: null }, [inner]);
    controls.el.hidden = true;
    controls.trackDispose(
        effect(() => {
            controls.el.hidden = !siteOwnerStore.isOwner$();
        }),
    );
    return controls;
}
