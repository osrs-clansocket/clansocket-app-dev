import { EPHEMERAL } from "../../core/constants.js";
import { interactionRegistry } from "../plugin-registry.js";

const PLUGIN_NAME = "button_handler";

interactionRegistry.register(PLUGIN_NAME, {
    type: "interaction",
    name: PLUGIN_NAME,

    filter(interaction: any) {
        return interaction.isButton() && interaction.customId.startsWith("example_");
    },

    async execute(interaction: any) {
        const action = interaction.customId.split("_")[1];

        switch (action) {
            case "confirm":
                await interaction.reply({ content: "Confirmed!", flags: EPHEMERAL });
                break;
            case "cancel":
                await interaction.reply({ content: "Cancelled!", flags: EPHEMERAL });
                break;
        }
    },
});
