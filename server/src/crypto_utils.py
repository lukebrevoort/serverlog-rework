from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import base64


def encrypt_data(public_key_pem: str, plaintext: str) -> str:
    """Encrpt data with RSA public key in PEM format."""
    try:
        public_key = serialization.load_pem_public_key(
            public_key_pem.encode(), backend=default_backend()
        )

        ciphertext = public_key.encrypt(
            plaintext.encode(),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )

        return base64.b64encode(ciphertext).decode()
    except Exception as e:
        raise ValueError(
            f"Encryption failed: {str(e)}"
        )  # Add more specific error handling as needed later


def decrypt_data(private_key_pem: str, b64_ciphertext: str) -> str:
    """Decrypt data with RSA private key in PEM format."""
    try:
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode(), password=None, backend=default_backend()
        )

        ciphertext = base64.b64decode(b64_ciphertext.encode())

        plaintext = private_key.decrypt(
            ciphertext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )

        return plaintext.decode()
    except Exception as e:
        raise ValueError(
            f"Decryption failed: {str(e)}"
        )  # Add more specific error handling as needed later
