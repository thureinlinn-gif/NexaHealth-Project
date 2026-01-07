# Avalanche Wallet Integration for Cross-Platform Chat History

This document describes the wallet-based authentication system that enables users to access their chat history across both the web frontend and Telegram bot.

## Overview

Instead of traditional username/password authentication, users connect their Avalanche (or Ethereum-compatible) wallet to authenticate. Their wallet address serves as their unique identifier, allowing chat history to sync across platforms.

## Architecture

### Frontend (React/TypeScript)
- **Wallet Connection**: Uses `ethers.js` to connect to MetaMask, Core wallet, or other Ethereum-compatible wallets
- **Wallet Context**: React context provider (`WalletContext.tsx`) manages wallet state
- **Wallet Button**: UI component in header for connecting/disconnecting wallet
- **Chat Integration**: Chat and History pages automatically use wallet address when connected

### Backend (Flask/Python)
- **SQLite Database**: Stores conversations and messages indexed by wallet address
- **Wallet Authentication**: Validates wallet addresses and handles wallet-based requests
- **API Endpoints**:
  - `/chat` - Enhanced to accept wallet address and store messages
  - `/chat/history` - Retrieves conversation list for a wallet
  - `/chat/conversation/<id>` - Retrieves messages for a specific conversation
  - `/wallet/link-telegram` - Links Telegram user ID to wallet address

### Telegram Bot
- **Wallet Linking**: `/linkwallet` command allows users to link their wallet address
- **Cross-Platform Sync**: Once linked, chat history is accessible from both platforms

## Setup

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install ethers
```

**Backend:**
```bash
cd backend
pip install requests  # Already in requirements.txt
```

### 2. Database Initialization

The SQLite database (`chat_history.db`) is automatically created when the backend starts. It includes:
- `conversations` table - Stores conversation metadata
- `messages` table - Stores individual messages
- `wallet_telegram_links` table - Links Telegram users to wallet addresses

### 3. Wallet Connection Flow

1. User clicks "Connect Wallet" button in header
2. Browser prompts for wallet connection (MetaMask/Core/etc.)
3. Wallet address is stored in localStorage
4. All subsequent chat requests include wallet address in Authorization header
5. Backend stores/retrieves messages by wallet address

### 4. Telegram Wallet Linking

1. User connects wallet on web app
2. User sends `/linkwallet 0xYourWalletAddress` in Telegram
3. Backend links Telegram user ID to wallet address
4. Chat history becomes accessible from both platforms

## Usage

### Frontend

**Connect Wallet:**
- Click "Connect Wallet" button in header
- Approve connection in wallet extension
- Wallet address appears in header

**Chat with Wallet:**
- When wallet is connected, all messages are automatically associated with your wallet
- Chat history is stored and retrievable across sessions

**View History:**
- History page shows conversations from wallet if connected
- Falls back to Supabase if wallet not connected (backward compatibility)

### Telegram Bot

**Link Wallet:**
```
/linkwallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Access History:**
- Once linked, chat history from web app is accessible
- Future messages sync across both platforms

## API Endpoints

### POST `/chat`
Send a chat message. Includes wallet address if connected.

**Request:**
```json
{
  "messages": [...],
  "wallet_address": "0x...",
  "conversation_id": "uuid"
}
```

**Response:**
```json
{
  "choices": [{"delta": {"content": "..."}}],
  "conversation_id": "uuid"
}
```

### GET `/chat/history?wallet_address=0x...`
Get conversation list for a wallet.

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "Chat title",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

### GET `/chat/conversation/<id>?wallet_address=0x...`
Get messages for a conversation.

**Response:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "...",
      "created_at": "timestamp"
    }
  ]
}
```

### POST `/wallet/link-telegram`
Link Telegram user to wallet address.

**Request:**
```json
{
  "telegram_user_id": "123456789",
  "wallet_address": "0x...",
  "signature": "..."
}
```

## Security Considerations

1. **Wallet Address Validation**: All addresses are validated for proper format
2. **Signature Verification**: In production, implement proper EIP-191 signature verification
3. **Authorization Headers**: Wallet address passed in `Authorization: Wallet <address>` header
4. **Database Security**: SQLite database should be secured in production

## Future Enhancements

1. **Signature Verification**: Require signed messages to prove wallet ownership
2. **Encryption**: Encrypt sensitive chat data
3. **Multi-Chain Support**: Support Avalanche X-Chain and P-Chain
4. **NFT Integration**: Use NFTs as user profiles
5. **Decentralized Storage**: Store chat history on IPFS or similar

## Troubleshooting

**Wallet won't connect:**
- Ensure MetaMask or Core wallet extension is installed
- Check browser console for errors
- Verify wallet is unlocked

**Chat history not syncing:**
- Verify wallet is connected on web app
- Check wallet address is correctly linked in Telegram
- Verify backend is running and database is accessible

**Telegram linking fails:**
- Ensure backend is running
- Verify wallet address format is correct (0x + 40 hex chars)
- Check backend logs for errors

