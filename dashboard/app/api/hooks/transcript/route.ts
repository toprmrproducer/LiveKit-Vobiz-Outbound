import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

// Re-use the global prisma instance or import from lib/db
// For brevity in this artifact, I'll use the check-and-create pattern again
// In a real app, this should be in lib/db.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            call_id,      // matches Call.id if we passed it, or we find by other means
            phone,
            transcript,
            status,
            duration,
            analysis
        } = body;

        console.log(`Received transcript for ${phone}: ${status}`);

        // If we have a call_id (passed via metadata), update it.
        // If not, we might need to find the latest active call for this phone.

        let callRecord;

        if (call_id) {
            callRecord = await prisma.call.findUnique({ where: { id: call_id } });
        }

        if (!callRecord && phone) {
            // Find the most recent PENDING or ACTIVE call for this number
            callRecord = await prisma.call.findFirst({
                where: {
                    contact: { phone: phone },
                    // status: { in: ['DISPATCHED', 'ACTIVE'] } // optional filter
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        if (!callRecord) {
            // If no record exists (e.g. inbound call or manual testing), create a new one?
            // Or just log it. Let's create one for data completeness.
            console.log("No existing call record found. Creating new log.");
            // We need to find the contact first to link it?
            let contact = await prisma.contact.findFirst({ where: { phone } });
            if (!contact) {
                contact = await prisma.contact.create({ data: { phone, name: "Unknown" } });
            }

            callRecord = await prisma.call.create({
                data: {
                    contactId: contact.id,
                    direction: "INBOUND", // Assumption if not dispatched
                    status: "COMPLETED"
                }
            });
        }

        // Update the record
        await prisma.call.update({
            where: { id: callRecord.id },
            data: {
                status: status || "COMPLETED",
                transcript: transcript || "",
                analysis: analysis || {},
                duration: duration || 0,
                endedAt: new Date(),
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error saving transcript:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
