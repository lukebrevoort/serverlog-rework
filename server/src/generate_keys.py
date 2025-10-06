# This script generates RSA public and private keys and saves them to PEM files
# PURELY FOR DEVELOPMENT/TESTING PURPOSES
# DO NOT USE IN PRODUCTION
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

# Generate private key
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

# Get public key
public_key = private_key.public_key()

# Serialize public key to PEM format
public_pem = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
).decode()

# Serialize private key to PEM format
private_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption(),
).decode()

print("PUBLIC KEY:")
print(public_pem)
print("\nPRIVATE KEY:")
print(private_pem)
