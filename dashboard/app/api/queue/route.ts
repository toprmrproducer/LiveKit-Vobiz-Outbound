import { NextResponse } from 'next/server';
import { roomService, sipClient } from '@/lib/server-utils';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { numbers, prompt } = body;

        if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
            return NextResponse.json({ error: "List of phone numbers is required" }, { status: 400 });
        }

        const trunkId = process.env.VOBIZ_SIP_TRUNK_ID;
        if (!trunkId) {
            return NextResponse.json({ error: "SIP Trunk not configured" }, { status: 500 });
        }

        const results = [];

        // Process casually to avoid rate limits (simple queue)
        // In a real production environment, push these to a Redis queue like BullMQ
        for (const phoneNumber of numbers) {
            try {
                const roomName = `call-${phoneNumber.replace(/\+/g, '')}-${Math.floor(Math.random() * 10000)}`;
                const particpantIdentity = `sip_${phoneNumber}`;

                const metadata = JSON.stringify({
                    phone_number: phoneNumber,
                    user_prompt: prompt || ""
                });

                await roomService.createRoom({
                    name: roomName,
                    metadata: metadata,
                    emptyTimeout: 60 * 5,
                });

                const info = await sipClient.createSipParticipant(
                    trunkId,
                    phoneNumber,
                    roomName,
                    {
                        participantIdentity: particpantIdentity,
                        participantName: "Customer",
                    }
                );

                results.push({ phoneNumber, status: 'dispatched', id: info.sipCallId });

                // Artificial delay to prevent API flooding (200ms)
                await new Promise(r => setTimeout(r, 200));

            } catch (e: any) {
                console.error(`Failed to dispatch ${phoneNumber}:`, e);
                results.push({ phoneNumber, status: 'failed', error: e.message });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${numbers.length} numbers`,
            results
        });

    } catch (error: any) {
        console.error("Queue error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
