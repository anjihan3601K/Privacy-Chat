# Quantum Chat Backend

This is the backend for the quantum-secured chat application.

## Setup

1. Install uv (Python package manager):

   ```bash
   pip install uv
   ```

2. Install dependencies:

   ```bash
   cd backend
   uv sync
   ```

3. Run the server:

   ```bash
   uv run python main.py
   ```

   Or alternatively:

   ```bash
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

- `GET /` - Health check
- `GET /api/health` - Detailed health status
- `POST /api/decrypt-message` - Decrypt message for display
- `POST /api/upload-file` - Upload and encrypt files
- `WebSocket /ws/{user_id}?display_name={name}` - Main chat WebSocket

## Features

- **Quantum Key Distribution (QKD)**: BB84 protocol simulation using Qiskit
- **End-to-End Encryption**: Messages encrypted with QKD-generated keys
- **Eavesdropper Detection**: Automatic detection of security breaches
- **Multi-user Support**: Multiple simultaneous chat sessions
- **File Sharing**: Encrypted file upload and sharing
- **Real-time Communication**: WebSocket-based instant messaging

## Security

The application implements a simplified version of quantum cryptography:

1. **BB84 Protocol**: Simulates quantum key distribution between users
2. **Eavesdropping Detection**: Monitors for security breaches during key exchange
3. **Symmetric Encryption**: Uses Fernet encryption with QKD-generated keys
4. **Session Isolation**: Each chat session has its own encryption key

## Testing QKD

The QKD module can be tested independently:

```bash
cd backend
uv run python -m app.security.qkd
```

This will run tests showing:

- Normal key generation (no eavesdropper)
- Eavesdropper detection scenarios
