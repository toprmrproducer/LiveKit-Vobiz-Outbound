import asyncio
import os
import certifi

# Fix SSL on macOS
os.environ['SSL_CERT_FILE'] = certifi.where()

from dotenv import load_dotenv
from livekit import api
from livekit.protocol.sip import CreateSIPOutboundTrunkRequest, SIPOutboundTrunkInfo

load_dotenv(".env")

async def main():
    print("Connecting to LiveKit API...")
    url = os.getenv("LIVEKIT_URL")
    key = os.getenv("LIVEKIT_API_KEY")
    secret = os.getenv("LIVEKIT_API_SECRET")

    # SIP Credentials
    sip_address = os.getenv("VOBIZ_SIP_DOMAIN")
    username = os.getenv("VOBIZ_USERNAME")
    password = os.getenv("VOBIZ_PASSWORD")
    number = os.getenv("VOBIZ_OUTBOUND_NUMBER")

    if not (url and key and secret):
        print("Error: Missing LiveKit credentials")
        return

    if not (sip_address and username and password):
        print("Error: Missing SIP credentials (VOBIZ_SIP_DOMAIN, VOBIZ_USERNAME, VOBIZ_PASSWORD)")
        return

    lkapi = api.LiveKitAPI(url=url, api_key=key, api_secret=secret)

    try:
        print(f"Creating SIP Trunk for {sip_address}...")
        
        trunk_info = SIPOutboundTrunkInfo(
            name="Vobiz Trunk",
            address=sip_address,
            auth_username=username,
            auth_password=password,
            numbers=[number] if number else [],
        )

        request = CreateSIPOutboundTrunkRequest(trunk=trunk_info)
        
        trunk = await lkapi.sip.create_outbound_trunk(request)
        
        print("\n✅ SIP Trunk Created Successfully!")
        print(f"Trunk ID: {trunk.sip_trunk_id}")
        print(f"Name: {trunk.name}")
        print(f"Numbers: {trunk.numbers}")
        
    except Exception as e:
        print(f"\n❌ Error creating trunk: {e}")
    finally:
        await lkapi.aclose()

if __name__ == "__main__":
    asyncio.run(main())
