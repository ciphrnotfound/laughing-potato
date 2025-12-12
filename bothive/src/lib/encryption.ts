/**
 * 🔐 End-to-End Encryption Service
 * Zero-knowledge encryption - even admins can't read user data
 */

import crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const AUTH_TAG_LENGTH = 16;

/**
 * Encryption service with zero-knowledge architecture
 */
export class EncryptionService {
    /**
     * Generate a secure encryption key for a user
     * This key should be derived from user's password/passphrase
     */
    static generateUserKey(password: string, salt: string): Buffer {
        return crypto.pbkdf2Sync(
            password,
            salt,
            100000, // iterations
            KEY_LENGTH,
            'sha512'
        );
    }

    /**
     * Generate a random salt
     */
    static generateSalt(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Encrypt data with user's key
     */
    static encrypt(data: string, userKey: Buffer): {
        encrypted: string;
        iv: string;
        authTag: string;
    } {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, userKey, iv);

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
        };
    }

    /**
     * Decrypt data with user's key
     */
    static decrypt(
        encryptedData: string,
        userKey: Buffer,
        iv: string,
        authTag: string
    ): string {
        const decipher = crypto.createDecipheriv(
            ENCRYPTION_ALGORITHM,
            userKey,
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Encrypt object (converts to JSON first)
     */
    static encryptObject(obj: any, userKey: Buffer): {
        encrypted: string;
        iv: string;
        authTag: string;
    } {
        const jsonString = JSON.stringify(obj);
        return this.encrypt(jsonString, userKey);
    }

    /**
     * Decrypt object (parses JSON after decryption)
     */
    static decryptObject(
        encryptedData: string,
        userKey: Buffer,
        iv: string,
        authTag: string
    ): any {
        const decrypted = this.decrypt(encryptedData, userKey, iv, authTag);
        return JSON.parse(decrypted);
    }

    /**
     * Hash password for storage (one-way)
     */
    static hashPassword(password: string, salt?: string): {
        hash: string;
        salt: string;
    } {
        const passwordSalt = salt || this.generateSalt();
        const hash = crypto
            .pbkdf2Sync(password, passwordSalt, 100000, 64, 'sha512')
            .toString('hex');

        return { hash, salt: passwordSalt };
    }

    /**
     * Verify password against hash
     */
    static verifyPassword(password: string, hash: string, salt: string): boolean {
        const result = this.hashPassword(password, salt);
        return result.hash === hash;
    }
}

/**
 * Client-side encryption helper
 * Encrypts data BEFORE sending to server
 */
export class ClientEncryption {
    private userKey: Buffer | null = null;

    /**
     * Initialize with user's password
     * This runs client-side only - password never sent to server
     */
    async initializeFromPassword(password: string, salt: string) {
        this.userKey = EncryptionService.generateUserKey(password, salt);
    }

    /**
     * Encrypt sensitive data before sending to API
     */
    encryptForStorage(data: any): {
        encrypted: string;
        iv: string;
        authTag: string;
    } | null {
        if (!this.userKey) {
            throw new Error('Encryption key not initialized');
        }

        return EncryptionService.encryptObject(data, this.userKey);
    }

    /**
     * Decrypt data received from API
     */
    decryptFromStorage(encrypted: string, iv: string, authTag: string): any {
        if (!this.userKey) {
            throw new Error('Encryption key not initialized');
        }

        return EncryptionService.decryptObject(encrypted, this.userKey, iv, authTag);
    }

    /**
     * Clear encryption key from memory
     */
    clearKey() {
        this.userKey = null;
    }
}

/**
 * Example usage:
 * 
 * // Client-side: Encrypt before saving
 * const clientEncryption = new ClientEncryption();
 * await clientEncryption.initializeFromPassword(userPassword, salt);
 * 
 * const sensitiveData = { apiKey: "secret-key", accessToken: "token" };
 * const encrypted = clientEncryption.encryptForStorage(sensitiveData);
 * 
 * // Send to server (server only stores encrypted data)
 * await api.saveCredentials(encrypted);
 * 
 * // Client-side: Decrypt when needed
 * const encryptedFromServer = await api.getCredentials();
 * const decrypted = clientEncryption.decryptFromStorage(
 *   encryptedFromServer.encrypted,
 *   encryptedFromServer.iv,
 *   encryptedFromServer.authTag
 * );
 */
