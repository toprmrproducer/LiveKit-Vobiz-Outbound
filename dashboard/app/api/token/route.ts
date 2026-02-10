import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const roomName = req.nextUrl.searchParams.get('roomName') || `room-${Math.random().toString(36).substring(7)}`;
    const username = req.nextUrl.searchParams.get('username') || `visitor-${Math.random().toString(36).substring(7)}`;

    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
        return NextResponse.json(
            { error: 'Server misconfigured' },
            { status: 500 }
        );
    }

    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
            identity: username,
            ttl: '1h',
        }
    );

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
    });

    return NextResponse.json({
        accessToken: await at.toJwt(),
        url: process.env.LIVEKIT_URL,
        roomName,
    });
}
