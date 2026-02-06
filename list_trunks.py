import asyncio
import os
import certifi

os.environ['SSL_CERT_FILE'] = certifi.where()

from dotenv import load_dotenv
from livekit import api

load_dotenv(".env")

from livekit.protocol.sip import ListSIPOutboundTrunkRequest

async def main():
    print("Connecting to LiveKit API...")
    url = os.getenv("LIVEKIT_URL")
    key = os.getenv("LIVEKIT_API_KEY")
    secret = os.getenv("LIVEKIT_API_SECRET")
    
    if not (url and key and secret):
        print("Error: Missing LiveKit credentials in .env")
        return

    lkapi = api.LiveKitAPI(url=url, api_key=key, api_secret=secret)
    
    try:
        print("Fetching SIP Trunks...")
        response_out = await lkapi.sip.list_outbound_trunk(ListSIPOutboundTrunkRequest())
        trunks_out = response_out.items
        print(f"\nFound {len(trunks_out)} Outbound SIP Trunks:")
        for t in trunks_out:
            print(f"  ID: {t.sip_trunk_id}")
            print(f"  Name: {t.name}")
            print(f"  Numbers: {t.numbers}")
            print("-" * 20)

        from livekit.protocol.sip import ListSIPInboundTrunkRequest
        response_in = await lkapi.sip.list_inbound_trunk(ListSIPInboundTrunkRequest())
        trunks_in = response_in.items
        print(f"\nFound {len(trunks_in)} Inbound SIP Trunks:")
        for t in trunks_in:
            print(f"  ID: {t.sip_trunk_id}")
            print(f"  Name: {t.name}")
            print(f"  Numbers: {t.numbers}")
            print("-" * 20)
            
    except Exception as e:
        print(f"Error listing trunks: {e}")
    finally:
        await lkapi.aclose()

if __name__ == "__main__":
    asyncio.run(main())
