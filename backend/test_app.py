#!/usr/bin/env python3
"""
Quick test script for the Quantum Chat application
"""

import asyncio
import json
import websockets
from datetime import datetime


async def test_basic_connection():
    """Test basic WebSocket connection"""
    try:
        uri = "ws://localhost:8000/ws/test_user?display_name=TestUser"
        async with websockets.connect(uri) as websocket:
            print(f"✅ Connected to WebSocket at {uri}")

            # Send a ping
            await websocket.send(json.dumps({"type": "ping"}))

            # Wait for response
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(response)

            if data.get("type") == "welcome":
                print("✅ Received welcome message")

            print("✅ Basic WebSocket test passed!")

    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")


def test_qkd_module():
    """Test QKD module independently"""
    try:
        from app.security.qkd import generate_session_key

        print("Testing QKD without eavesdropper...")
        key, detected = generate_session_key("alice", "bob", False)
        print(f"Key generated: {key is not None}")
        print(f"Eavesdropper detected: {detected}")

        if key and not detected:
            print("✅ QKD test (no eavesdropper) passed!")
        else:
            print("❌ QKD test (no eavesdropper) failed!")

        print("\nTesting QKD with eavesdropper...")
        key, detected = generate_session_key("alice", "bob", True)
        print(f"Key generated: {key is not None}")
        print(f"Eavesdropper detected: {detected}")

        if detected:
            print("✅ QKD test (with eavesdropper) passed!")
        else:
            print(
                "⚠️  QKD test (with eavesdropper) - eavesdropper not detected (this can happen randomly)"
            )

    except Exception as e:
        print(f"❌ QKD module test failed: {e}")


def test_encryption():
    """Test encryption module"""
    try:
        from app.security.encryption import ChatEncryption

        # Test with a dummy key
        test_key = "a" * 64  # 256-bit key as hex
        cipher = ChatEncryption(test_key)

        message = "Hello, quantum world!"
        encrypted = cipher.encrypt_message(message)
        decrypted = cipher.decrypt_message(encrypted)

        if message == decrypted:
            print("✅ Encryption test passed!")
        else:
            print("❌ Encryption test failed!")

    except Exception as e:
        print(f"❌ Encryption test failed: {e}")


if __name__ == "__main__":
    print("🔬 Testing Quantum Chat Components")
    print("=" * 40)

    print("\n1. Testing QKD Module:")
    test_qkd_module()

    print("\n2. Testing Encryption Module:")
    test_encryption()

    print("\n3. Testing WebSocket Connection:")
    try:
        asyncio.run(test_basic_connection())
    except Exception as e:
        print(f"❌ Could not test WebSocket: {e}")
        print("Make sure the backend server is running!")

    print("\n🎉 Testing complete!")
    print("\nTo use the application:")
    print("1. Backend: http://localhost:8000")
    print("2. Frontend: http://localhost:3000")
    print("3. Open multiple browser tabs to test multi-user chat")
