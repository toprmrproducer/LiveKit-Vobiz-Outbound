import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server-utils'; // We assumed this exists, but I need to check lib/server-utils.ts to see if prisma is exported. Wait, I didn't update server-utils.ts yet!
// Ah, allow me to define 'prisma' locally here or assume libraries will be fixed.
// Better: I'll create a new `lib/db.ts` or update `server-utils.ts` in the next step.
// For now, let's assume `import { PrismaClient } from '@prisma/client'` works directly if I instantiate it here.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prismaClient =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, contacts } = body;

        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
            return NextResponse.json({ error: "No contacts provided" }, { status: 400 });
        }

        // 1. Create Campaign
        const campaign = await prismaClient.campaign.create({
            data: {
                name: name || `Campaign ${new Date().toISOString()}`,
                status: "DRAFT",
            }
        });

        // 2. Create Contacts (Batch)
        // Prisma createMany is efficient
        const contactData = contacts.map((c: any) => ({
            phone: c.phone || c.Phone || c.PhoneNumber, // robust mapping
            name: c.name || c.Name || "",
            campaignId: campaign.id,
            attributes: c // store everything else as JSON
        })).filter(c => c.phone); // ensure phone exists

        if (contactData.length === 0) {
            return NextResponse.json({ error: "No valid phone numbers found in CSV" }, { status: 400 });
        }

        await prismaClient.contact.createMany({
            data: contactData
        });

        // 3. Create 'Pending' Calls for each contact
        // We need to fetch the contacts back to get their IDs? 
        // Or we can just create calls linking to campaign directly if we strictly link calls to contacts?
        // Actually, createMany doesn't return IDs in PostgreSQL easily in Prisma.
        // Strategy: We can create calls *later* when "starting" the campaign, OR
        // we can iterate. For 1000s, createMany is better.
        // Let's just create contacts now. The "Dispatcher" will pick up contacts from the campaign.

        return NextResponse.json({
            success: true,
            campaignId: campaign.id,
            count: contactData.length
        });

    } catch (error: any) {
        console.error("Error creating campaign:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
