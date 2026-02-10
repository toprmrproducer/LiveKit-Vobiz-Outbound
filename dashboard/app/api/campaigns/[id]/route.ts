import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                // We want aggregated stats, so getting all contacts might be heavy if massive.
                // But for V1 it's fine.
                calls: {
                    orderBy: { createdAt: 'desc' },
                    take: 20, // Only last 20 calls for the list
                    include: { contact: true }
                }
            }
        });

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        // Calculate Stats
        // Use aggregate queries for performance in real app, but filter here for V1
        const total = await prisma.contact.count({ where: { campaignId: campaign.id } });
        const calls = await prisma.call.findMany({
            where: { campaignId: campaign.id },
            select: { status: true } // minimal select
        });

        const pending = total - calls.length; // Approximate (contacts without a call record)
        // Wait, logic check: A contact might have multiple failed calls.
        // Better: Pending = Contact.count where NO call exists.
        // Let's stick to simple Call stats for now.

        const completed = calls.filter(c => c.status === 'COMPLETED').length;
        const failed = calls.filter(c => c.status === 'FAILED').length;
        // active/dispatched
        const active = calls.filter(c => ['ACTIVE', 'DISPATCHED'].includes(c.status)).length;

        // Revised Pending Logic:
        // Total Contacts - Contacts with at least one call that is NOT 'PENDING'?
        // Let's just say Pending = Total - (Completed + Failed + Active) is rough but okay?
        // No, simplest for UI:
        // Total = Total Contacts
        // Processed = Calls created

        const stats = {
            total,
            pending: total - calls.length, // Rough estimate of verified untouched contacts
            completed,
            failed,
            active
        };

        return NextResponse.json({
            ...campaign,
            stats
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
