import { registerValueSource } from "../../registries/value-source-registry.js";

registerValueSource({
    format: "cron-preset",
    label: "Schedule presets",
    staticValues: [
        { id: "* * * * *", name: "Every minute" },
        { id: "*/5 * * * *", name: "Every 5 minutes" },
        { id: "*/15 * * * *", name: "Every 15 minutes" },
        { id: "*/30 * * * *", name: "Every 30 minutes" },
        { id: "0 * * * *", name: "Hourly (on the hour)" },
        { id: "0 */2 * * *", name: "Every 2 hours" },
        { id: "0 */6 * * *", name: "Every 6 hours" },
        { id: "0 0 * * *", name: "Daily at midnight" },
        { id: "0 9 * * *", name: "Daily at 9am" },
        { id: "0 12 * * *", name: "Daily at noon" },
        { id: "0 18 * * *", name: "Daily at 6pm" },
        { id: "0 0 * * 0", name: "Weekly (Sunday midnight)" },
        { id: "0 0 * * 1", name: "Weekly (Monday midnight)" },
        { id: "0 0 1 * *", name: "Monthly (1st at midnight)" },
    ],
});
