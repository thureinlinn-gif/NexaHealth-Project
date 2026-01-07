"""
Wallet-based authentication utilities for Avalanche (AVAX).
Validates wallet addresses and message signatures.
"""

import hashlib
import hmac
from typing import Optional, Tuple


def validate_wallet_address(address: str) -> bool:
    """
    Validate an Ethereum/Avalanche C-Chain wallet address format.
    
    Args:
        address: Wallet address to validate
        
    Returns:
        True if address format is valid, False otherwise
    """
    if not address:
        return False
    
    # Ethereum/Avalanche C-Chain addresses are 42 characters (0x + 40 hex chars)
    if not address.startswith('0x'):
        return False
    
    if len(address) != 42:
        return False
    
    # Check if remaining characters are valid hex
    try:
        int(address[2:], 16)
        return True
    except ValueError:
        return False


def verify_message_signature(message: str, signature: str, address: str) -> bool:
    """
    Verify a message signature matches the wallet address.
    Note: This is a simplified version. In production, use proper EIP-191 signature verification.
    
    Args:
        message: Original message that was signed
        signature: Signature from wallet
        address: Wallet address that should have signed
        
    Returns:
        True if signature is valid (simplified check)
    """
    # In production, implement proper EIP-191 signature verification
    # For now, we'll trust the frontend signature and validate address format
    return validate_wallet_address(address) and len(signature) > 0


def get_wallet_from_request(request) -> Optional[str]:
    """
    Extract wallet address from request headers or body.
    
    Args:
        request: Flask request object
        
    Returns:
        Wallet address if present, None otherwise
    """
    # Check Authorization header: "Wallet <address>"
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Wallet '):
        address = auth_header.replace('Wallet ', '').strip()
        if validate_wallet_address(address):
            return address.lower()  # Normalize to lowercase
    
    # Check request body
    if request.is_json:
        data = request.get_json()
        address = data.get('wallet_address') or data.get('walletAddress')
        if address and validate_wallet_address(address):
            return address.lower()
    
    return None

