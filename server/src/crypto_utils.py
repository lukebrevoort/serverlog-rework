import base64

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding


def encrypt_data(public_key_pem: str, plaintext: str) -> str:
    """Encrypt data with RSA public key in PEM format."""
    # Input validation
    if not public_key_pem or not public_key_pem.strip():
        raise ValueError(
            "Public key is required. Please paste your RSA public key in PEM format. "
            "It should start with '-----BEGIN PUBLIC KEY-----' and end with '-----END PUBLIC KEY-----'."
        )
    # Need to have data, incase user pastes empty string 
    if not plaintext or not plaintext.strip():
        raise ValueError(
            "Data to encrypt is required. Please enter the text you want to encrypt."
        )
    
    # Check key format
    if not public_key_pem.strip().startswith("-----BEGIN PUBLIC KEY-----"):
        raise ValueError(
            "Invalid public key format: The key must start with '-----BEGIN PUBLIC KEY-----'. "
            "Make sure you're using a PUBLIC key (not a private key) and that it's in PEM format. "
            "The key should look like:\n"
            "-----BEGIN PUBLIC KEY-----\n"
            "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n"
            "-----END PUBLIC KEY-----"
        )

    pem_lines = public_key_pem.strip().splitlines()
    
    # Validate PEM structure
    if len(pem_lines) < 3:
        raise ValueError(
            "Invalid public key structure: The key appears to be incomplete. "
            "A valid PEM public key must have at least 3 lines:\n"
            "1. -----BEGIN PUBLIC KEY-----\n"
            "2. Base64-encoded key data (one or more lines)\n"
            "3. -----END PUBLIC KEY-----\n"
            "Please check that you copied the entire key."
        )
    
    if not pem_lines[0].strip().startswith("-----BEGIN PUBLIC KEY-----"):
        raise ValueError(
            "Invalid public key header: The first line must be '-----BEGIN PUBLIC KEY-----'. "
            "Please ensure you're copying the complete public key starting from the header."
        )
    
    if not pem_lines[-1].strip().startswith("-----END PUBLIC KEY-----"):
        raise ValueError(
            "Invalid public key footer: The last line must be '-----END PUBLIC KEY-----'. "
            "Please ensure you're copying the complete public key including the footer."
        )
    
    # Validate base64 content
    key_body = "".join(pem_lines[1:-1])
    if not key_body.strip():
        raise ValueError(
            "Empty public key content: The key has valid headers but no data between them. "
            "Please ensure you copied the complete key including the base64-encoded data."
        )
    
    try:
        base64.b64decode(key_body, validate=True)
    except Exception:
        raise ValueError(
            "Invalid public key encoding: The key data contains invalid characters or formatting. "
            "The content between the BEGIN and END markers must be valid base64-encoded data. "
            "Common issues:\n"
            "- Extra spaces or special characters in the key data\n"
            "- Key data was corrupted during copy/paste\n"
            "- Wrong key format (make sure it's PEM, not DER or other formats)"
        )
    
    # Load and validate the public key
    try:
        public_key = serialization.load_pem_public_key(
            public_key_pem.encode(), backend=default_backend()
        )
    except ValueError as key_error:
        error_msg = str(key_error).lower()
        if "could not deserialize" in error_msg or "invalid" in error_msg:
            raise ValueError(
                "Invalid RSA public key: The key format is correct but the key data is invalid. "
                "Please ensure:\n"
                "- You're using an RSA public key (not EC, DSA, or other types)\n"
                "- The key was generated correctly\n"
                "- You copied the entire key without modifications"
            )
        else:
            raise ValueError(
                "Cannot load public key. "
                "Please verify that your key is a valid RSA public key in PEM format."
            )
    except Exception:
        raise ValueError(
            "Unexpected error loading public key. "
            "Please ensure you're using a valid RSA public key in PEM format."
        )
    
    # Perform encryption
    try:
        ciphertext = public_key.encrypt(
            plaintext.encode(),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )
        return base64.b64encode(ciphertext).decode()
    except ValueError as encrypt_error:
        error_msg = str(encrypt_error).lower()
        if "too long" in error_msg or "data too large" in error_msg:
            raise ValueError(
                "Data too large to encrypt: The text you're trying to encrypt is too long for this RSA key. "
                "RSA encryption has size limits based on key size. For a 2048-bit key, you can encrypt up to ~190 bytes. "
                f"Your data is {len(plaintext)} characters. "
                "Solutions:\n"
                "- Split your data into smaller chunks\n"
                "- Use a larger RSA key (4096-bit)\n"
                "- Consider using hybrid encryption (RSA + AES) for large data"
            )
        else:
            raise ValueError(
                "Encryption failed. "
                "This may indicate an issue with the key or the data format."
            )
    except Exception:
        raise ValueError(
            "Unexpected encryption error. "
            "Please try again or contact support if the issue persists."
        )


def decrypt_data(private_key_pem: str, b64_ciphertext: str) -> str:
    """Decrypt data with RSA private key in PEM format."""
    # Input validation
    if not private_key_pem or not private_key_pem.strip():
        raise ValueError(
            "Private key is required. Please paste your RSA private key in PEM format. "
            "It should start with '-----BEGIN PRIVATE KEY-----' or '-----BEGIN RSA PRIVATE KEY-----' "
            "and end with '-----END PRIVATE KEY-----' or '-----END RSA PRIVATE KEY-----'."
        )
    # Still require data, incase user pastes empty string
    if not b64_ciphertext or not b64_ciphertext.strip():
        raise ValueError(
            "Encrypted data is required. Please paste the base64-encoded encrypted text you want to decrypt."
        )
    
    # Check key format
    private_key_pem_stripped = private_key_pem.strip()
    is_pkcs1 = private_key_pem_stripped.startswith("-----BEGIN RSA PRIVATE KEY-----")
    is_pkcs8 = private_key_pem_stripped.startswith("-----BEGIN PRIVATE KEY-----")
    
    if not (is_pkcs1 or is_pkcs8):
        raise ValueError(
            "Invalid private key format: The key must start with either:\n"
            "- '-----BEGIN PRIVATE KEY-----' (PKCS#8 format), or\n"
            "- '-----BEGIN RSA PRIVATE KEY-----' (PKCS#1 format)\n\n"
            "Make sure you're using a PRIVATE key (not a public key) and that it's in PEM format. "
            "The key should look like:\n"
            "-----BEGIN PRIVATE KEY-----\n"
            "MIIEvgIBADANBgkqhkiG9w0BAQEFAASC...\n"
            "-----END PRIVATE KEY-----"
        )
    
    pem_lines = private_key_pem_stripped.splitlines()
    
    # Validate PEM structure
    if len(pem_lines) < 3:
        raise ValueError(
            "Invalid private key structure: The key appears to be incomplete. "
            "A valid PEM private key must have at least 3 lines:\n"
            "1. -----BEGIN PRIVATE KEY----- (or BEGIN RSA PRIVATE KEY)\n"
            "2. Base64-encoded key data (one or more lines)\n"
            "3. -----END PRIVATE KEY----- (or END RSA PRIVATE KEY)\n"
            "Please check that you copied the entire key."
        )
    
    expected_footer = "-----END RSA PRIVATE KEY-----" if is_pkcs1 else "-----END PRIVATE KEY-----"
    if not pem_lines[-1].strip().startswith(expected_footer):
        raise ValueError(
            f"Invalid private key footer: The last line must be '{expected_footer}'. "
            "Please ensure you're copying the complete private key including the footer."
        )
    
    # Validate base64 content
    key_body = "".join(pem_lines[1:-1])
    if not key_body.strip():
        raise ValueError(
            "Empty private key content: The key has valid headers but no data between them. "
            "Please ensure you copied the complete key including the base64-encoded data."
        )
    
    # Load the private key
    try:
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode(), password=None, backend=default_backend()
        )
    except TypeError as type_error:
        error_msg = str(type_error).lower()
        if "password" in error_msg or "encrypted" in error_msg:
            raise ValueError(
                "Password-protected private key detected: This key appears to be encrypted with a password. "
                "Currently, only unencrypted private keys are supported. "
                "To use this key, you need to:\n"
                "1. Remove the password protection from your private key, or\n"
                "2. Generate a new unencrypted key pair\n\n"
                "To remove password protection using OpenSSL:\n"
                "openssl rsa -in encrypted_key.pem -out unencrypted_key.pem"
            )
        else:
            raise ValueError(
                "Invalid private key format. "
                "Please ensure you're using a valid RSA private key in PEM format."
            )
    except ValueError as key_error:
        error_msg = str(key_error).lower()
        if "could not deserialize" in error_msg or "invalid" in error_msg:
            raise ValueError(
                "Invalid RSA private key: The key format appears correct but the key data is invalid. "
                "Please ensure:\n"
                "- You're using an RSA private key (not EC, DSA, or other types)\n"
                "- The key was generated correctly\n"
                "- You copied the entire key without modifications\n"
                "- The key matches the public key used for encryption"
            )
        else:
            raise ValueError(
                "Cannot load private key. "
                "Please verify that your key is a valid RSA private key in PEM format."
            )
    except Exception:
        raise ValueError(
            "Unexpected error loading private key. "
            "Please ensure you're using a valid RSA private key in PEM format."
        )
    
    # Validate and decode ciphertext
    try:
        ciphertext = base64.b64decode(b64_ciphertext.strip().encode(), validate=True)
    except Exception:
        raise ValueError(
            "Invalid encrypted data format: The encrypted data must be valid base64-encoded text. "
            "Common issues:\n"
            "- The data was corrupted during copy/paste\n"
            "- Extra spaces or line breaks were added\n"
            "- Wrong data was pasted (make sure it's the encrypted output, not the original text)"
        )
    
    if len(ciphertext) == 0:
        raise ValueError(
            "Empty encrypted data: The encrypted data cannot be empty. "
            "Please paste the complete base64-encoded encrypted text."
        )
    
    # Perform decryption
    try:
        plaintext = private_key.decrypt(
            ciphertext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )
        return plaintext.decode()
    except ValueError as decrypt_error:
        error_msg = str(decrypt_error).lower()
        if "decryption failed" in error_msg or "incorrect" in error_msg:
            raise ValueError(
                "Decryption failed: Unable to decrypt the data with this private key. "
                "This usually means:\n"
                "- The private key doesn't match the public key used for encryption\n"
                "- The encrypted data was corrupted or modified\n"
                "- The wrong encrypted data was provided\n\n"
                "Please verify:\n"
                "1. You're using the correct private key (matching the public key used to encrypt)\n"
                "2. The encrypted data hasn't been modified\n"
                "3. You copied the complete encrypted text"
            )
        elif "invalid" in error_msg or "padding" in error_msg:
            raise ValueError(
                "Invalid encryption format: The encrypted data doesn't match the expected format. "
                "This could mean:\n"
                "- Different encryption settings were used\n"
                "- The data was encrypted with a different algorithm\n"
                "- The encrypted data is corrupted"
            )
        else:
            raise ValueError(
                "Decryption error. "
                "Please verify that you're using the correct key and encrypted data."
            )
    except UnicodeDecodeError:
        raise ValueError(
            "Invalid decrypted data: The decryption succeeded but the result contains invalid characters. "
            "This could mean:\n"
            "- The data was encrypted with a different key than you're using to decrypt\n"
            "- The encrypted data is corrupted\n"
            "- The data wasn't originally text (binary data was encrypted)"
        )
    except Exception:
        raise ValueError(
            "Unexpected decryption error. "
            "Please verify your private key and encrypted data, or contact support if the issue persists."
        )
