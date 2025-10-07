import base64

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding


def encrypt_data(public_key_pem: str, plaintext: str) -> str:
    """Encrypt data with RSA public key in PEM format."""
    try:
        if not public_key_pem.startswith("-----BEGIN PUBLIC KEY-----"):
            raise ValueError("Invalid public key format, must be PEM format such as '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n Read more on formatting for PEM at README.md'")
        
        pem_lines = public_key_pem.strip().splitlines()
        if len(pem_lines) < 3 or not pem_lines[0].startswith("-----BEGIN PUBLIC KEY-----") or not pem_lines[-1].startswith("-----END PUBLIC KEY-----"):
            raise ValueError("PEM must contain valid BEGIN/END PUBLIC KEY headers. such as '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n Read more on formatting for PEM at README.md'")
        key_body = "".join(pem_lines[1:-1])

        try:
            base64.b64decode(key_body, validate=True)
        except Exception:
            raise ValueError("Public key body is not valid base64-encoded data. An example of a valid PEM public key format is provided in the README.md")
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
