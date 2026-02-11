
import { prisma } from "@/lib/server-utils";

export enum ConfigKey {
    LIVEKIT_URL = "LIVEKIT_URL",
    LIVEKIT_API_KEY = "LIVEKIT_API_KEY",
    LIVEKIT_API_SECRET = "LIVEKIT_API_SECRET",
    SIP_TRUNK_ID = "SIP_TRUNK_ID",
    OPENAI_API_KEY = "OPENAI_API_KEY",
    SYSTEM_PROMPT = "SYSTEM_PROMPT",
}

export async function getConfig(key: ConfigKey, fallback: string = ""): Promise<string> {
    const config = await prisma.config.findUnique({
        where: { key },
    });
    return config?.value || process.env[key] || fallback;
}

export async function setConfig(key: ConfigKey, value: string) {
    return prisma.config.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
}

export async function getAllConfig() {
    const configs = await prisma.config.findMany();
    // Convert array to object for easier consumption
    return configs.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);
}
