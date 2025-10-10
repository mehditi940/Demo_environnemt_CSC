import crypto from "crypto";

// Hashes a password and returns the hash and salt
export async function hashPassword(
  password: string
): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(16).toString("hex"); // Generate random salt
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 310000, 32, "sha256", (err, derivedKey) => {
      if (err) reject(err);
      else resolve({ hash: derivedKey.toString("hex"), salt }); // Store separately
    });
  });
}

// Verifies a password against a stored hash and salt
export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 310000, 32, "sha256", (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex") === storedHash);
    });
  });
}
