# Testing basic understanding of cryptography library
# Run this script to generate a public/private key pair and test encryption/decryption
# Save the output keys for use in other tests

from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
import base64

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

private_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption(),
).decode()

public_pem = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
).decode()

print("=" * 50)
print("PUBLIC KEY:")
print(public_pem)
print("=" * 50)
print("PRIVATE KEY:")
print(private_pem)
print("=" * 50)

# Test encryption
plaintext = "Hello Blueprint!"
ciphertext = public_key.encrypt(
    plaintext.encode(),
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None,
    ),
)
encrypted_b64 = base64.b64encode(ciphertext).decode()
print(f"Encrypted: {encrypted_b64[:50]}...")

# Test decryption
decrypted = private_key.decrypt(
    ciphertext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None,
    ),
)
print(f"Decrypted: {decrypted.decode()}")
print("=" * 50)
print("✅ CRYPTO WORKS! Save these keys for testing.")
