import logger from "@clansocket/logger";

export async function failAndWarn(transition: () => Promise<unknown>, message: string): Promise<void> {
    await transition();
    logger.warn(message);
}
