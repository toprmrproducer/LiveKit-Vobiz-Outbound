import { NextResponse } from 'next/server';
import { sipClient, roomService } from '@/lib/server-utils';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phoneNumber, prompt, modelProvider, voice } = body;

        if (!phoneNumber) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        const trunkId = process.env.VOBIZ_SIP_TRUNK_ID;
        if (!trunkId) {
            console.error("VOBIZ_SIP_TRUNK_ID is missing in env");
            return NextResponse.json({ error: "SIP Trunk not configured" }, { status: 500 });
        }

        // Generate a unique room name for this call
        const roomName = `call-${phoneNumber.replace(/\+/g, '')}-${Math.floor(Math.random() * 10000)}`;
        const particpantIdentity = `sip_${phoneNumber}`;

        console.log(`Dispatching call to ${phoneNumber} in room ${roomName} via trunk ${trunkId}`);

        // Create the SIP Participant
        // This triggers the SIP Trunk to dial the number and connect it to the room.
        // The Agent (running separately) will join this room when it sees the job/room creation.
        // Wait... for Explicit Dispatch (Job), we usually use the AgentDispatchClient or just rely on the Agent watching all rooms.
        // 
        // BUT, for Outbound calling, the flow is:
        // 1. Create a Room (implicitly done by creating participant)
        // 2. Add SIP Participant to Room.
        // 3. The Agent (configured to join rooms) joins.

        // HOWEVER, standard LiveKit Agent flow often uses a "Job" dispatch for explicit assignment.
        // The `agent.py` provided listens for creating rooms? No, it's a Worker.
        // `make_call.py` (which we are replacing) logic was:
        //  api.create_sip_participant(...)
        //
        // So we just replicate `make_call.py` logic here.

        const metadata = JSON.stringify({
            phone_number: phoneNumber,
            user_prompt: prompt || "",
            model_provider: modelProvider || "openai",
            voice_id: voice || "alloy"
        });

        const info = await sipClient.createSipParticipant(
            trunkId,
            phoneNumber,
            roomName,
            {
                participantIdentity: particpantIdentity,
                participantName: "Customer",
                roomMetadata: metadata, // Pass metadata so Agent knows context
            }
        );

        return NextResponse.json({
            success: true,
            roomName,
            dispatchId: info.sipCallId
        });

    } catch (error: any) {
        console.error("Error dispatching call:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
