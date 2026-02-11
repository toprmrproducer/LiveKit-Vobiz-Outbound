import { NextResponse } from 'next/server';
import { sipClient, roomService, prisma } from '@/lib/server-utils';

// Fix for Next.js 15: params is a Promise
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: campaignId } = await params;
    const body = await request.json();
    const { batchSize = 10 } = body; // Dispatch 10 calls at a time by default

    // Ensure Trunk ID exists
    if (!process.env.VOBIZ_SIP_TRUNK_ID) {
        return NextResponse.json({ error: "SIP Trunk ID not configured" }, { status: 500 });
    }

    try {
        // 1. Fetch pending contacts using generic query
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                contacts: {
                    include: { calls: true }
                }
            }
        });

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        // Filter for contacts who haven't been called successfully
        const pendingContacts = campaign.contacts.filter(c => {
            const hasSuccessfulCall = c.calls.some(call =>
                ['DISPATCHED', 'ACTIVE', 'COMPLETED'].includes(call.status)
            );
            return !hasSuccessfulCall;
        }).slice(0, batchSize);

        if (pendingContacts.length === 0) {
            return NextResponse.json({ message: "No pending contacts to dial.", completed: true });
        }

        const results = [];
        const errors = [];

        // 2. Dispatch Calls Loop
        for (const contact of pendingContacts) {
            try {
                // A. Create Call Record (Status: DISPATCHED)
                const call = await prisma.call.create({
                    data: {
                        campaignId: campaignId,
                        contactId: contact.id,
                        direction: "OUTBOUND",
                        status: "DISPATCHED"
                    }
                });

                // B. Create Room & SIP Participant
                const roomName = `camp-${campaignId.slice(-4)}-${call.id}`;
                const participantIdentity = `sip_${contact.phone}`;

                // Metadata for the agent
                const metadata = JSON.stringify({
                    call_id: call.id,      // Critical for Data Return
                    phone_number: contact.phone,
                    campaign_id: campaignId,
                    user_prompt: campaign.promptTemplate || "",
                    user_data: contact.attributes
                });

                // 1. Create/Ensure Room exists with Metadata first
                // (Agent reads Room Metadata)
                await roomService.createRoom({
                    name: roomName,
                    metadata: metadata,
                    emptyTimeout: 60, // Auto-close if empty
                });

                // 2. Dial SIP
                await sipClient.createSipParticipant(
                    process.env.VOBIZ_SIP_TRUNK_ID!,
                    contact.phone,
                    roomName,
                    {
                        participantIdentity,
                        participantName: contact.name || "Customer",
                    }
                );

                results.push({ callId: call.id, phone: contact.phone, status: "DISPATCHED" });

            } catch (err: any) {
                console.error(`Failed to dispatch ${contact.phone}:`, err);
                errors.push({ phone: contact.phone, error: err.message });
                // We could update the call status to FAILED here if created
            }
        }

        return NextResponse.json({
            success: true,
            dispatched: results.length,
            errors: errors.length,
            results,
            errorsDetail: errors
        });

    } catch (error: any) {
        console.error("Dispatch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
