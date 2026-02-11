
import { NextRequest, NextResponse } from "next/server";
import { getAllConfig, setConfig, ConfigKey } from "@/lib/config-manager";

// GET /api/settings - Retrieve all settings
export async function GET() {
    try {
        const config = await getAllConfig();

        // Mask sensitive keys (like secrets) if needed, but for an admin dashboard, showing them (or part of them) might be okay
        // For now, return everything so the admin can edit them.
        return NextResponse.json(config);
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

// POST /api/settings - Upate a setting
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { key, value } = body;

        if (!key || typeof value !== "string") {
            return NextResponse.json({ error: "Invalid Key/Value" }, { status: 400 });
        }

        // Validate if key is a valid enum?
        // We cast to ConfigKey or just allow string to support dynamic keys
        await setConfig(key as ConfigKey, value);

        return NextResponse.json({ success: true, key, value });
    } catch (error) {
        console.error("Failed to update setting:", error);
        return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
    }
}
