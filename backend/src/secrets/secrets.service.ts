import { prisma } from '@/prisma';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHash, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

@Injectable()
export class SecretsService {
    private key!: Buffer;
    private migrationPromise: Promise<void> = Promise.resolve();

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const password = this.configService.get<string>('SECRETS_PASSWORD');
        if (!password) throw new Error('SECRETS_PASSWORD is not set in environment variables');
        
        this.key = await this.deriveKey(password);

        // Track migration completion
        this.migrationPromise = this.transformOldEncryptionKeys().catch(e => {
            console.error('Error transforming old encryption keys:', e);
        });
    }

    private async deriveKey(password: string): Promise<Buffer> {
        // Use a stable, app-configured salt. Do not change it once data is stored.
        return (await promisify(scrypt)(password, 'fixed-salt', 32)) as Buffer;
    }

    private getKeyFingerprint(password: string): string {
        // Deterministic hash to identify which key was used.
        // Using a salt prevents rainbow table attacks on the fingerprint.
        return createHash('sha256').update(password + 'fixed-fingerprint-salt').digest('hex');
    }

    async transformOldEncryptionKeys() {
        const oldPassword = this.configService.get<string>('OLD_SECRETS_PASSWORD');
        const currentPassword = this.configService.get<string>('SECRETS_PASSWORD');
        
        if (!oldPassword || !currentPassword || oldPassword === currentPassword) return;

        const oldKeyFingerprint = this.getKeyFingerprint(oldPassword);
        const currentKeyFingerprint = this.getKeyFingerprint(currentPassword);

        // We need the OLD key to decrypt the existing data
        const oldKey = await this.deriveKey(oldPassword);

        const secrets = await prisma.secret.findMany({
            where: {
                encrypted_key: oldKeyFingerprint,
            },
        });

        const updatedIDs: number[] = [];
        for (const secret of secrets) {
            try {
                // Decrypt with OLD key
                const decryptedData = await this.decryptFromDbString(secret.data, oldKey);
                // Encrypt with NEW key (this.key)
                const reEncryptedData = await this.encryptToDbString(decryptedData);
                
                const updatedKey = await prisma.secret.update({
                    where: { id: secret.id },
                    data: {
                        data: reEncryptedData,
                        encrypted_key: currentKeyFingerprint,
                    },
                });
                updatedIDs.push(updatedKey.id);
            } catch (error) {
                console.error(`Failed to migrate secret ${secret.id}:`, error);
            }
        }
        if (updatedIDs.length > 0) {
            console.log(`Transformed ${updatedIDs.length} secrets to new encryption key.`);
        }
    }

    async encryptToDbString(plainText: string): Promise<string> {
        await this.migrationPromise;
        const iv = randomBytes(16);
        const cipher = createCipheriv('aes-256-ctr', this.key, iv);
        const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
        const payload = Buffer.concat([iv, ciphertext]);
        return payload.toString('base64');
    }

    async decryptFromDbString(base64Data: string, key: Buffer = this.key): Promise<string> {
        await this.migrationPromise;
        const data = Buffer.from(base64Data, 'base64');
        if (data.length < 17) throw new Error('Invalid ciphertext');
        const iv = data.subarray(0, 16);
        const ciphertext = data.subarray(16);
        const decipher = createDecipheriv('aes-256-ctr', key, iv);
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return decrypted.toString('utf8');
    }

    async storeAndEncrypt(plainText: string, expiresAt?: Date): Promise<any> {
        await this.migrationPromise;
        const encrypted = await this.encryptToDbString(plainText);
        const storedSecret = await prisma.secret.create({
            data: {
                data: encrypted,
                expireAt: expiresAt || null,
                encrypted_key: this.getKeyFingerprint(this.configService.get<string>('SECRETS_PASSWORD')!),
            },
        });
        return storedSecret;
    }

    async retrieveAndDecrypt(id: number): Promise<string | null> {
        await this.migrationPromise;
        const storedSecret = await prisma.secret.findUnique({
            where: { id },
        });
        if (!storedSecret) return null;
        if (storedSecret.expireAt && storedSecret.expireAt < new Date()) {
            await prisma.secret.delete({ where: { id } });
            return null;
        }
        const decrypted = await this.decryptFromDbString(storedSecret.data);
        return decrypted;
    }

    async deleteSecret(id: number): Promise<void> {
        await this.migrationPromise;
        await prisma.secret.delete({
            where: { id },
        });
    }

    async deleteSecrets(ids: number[]): Promise<void> {
        await this.migrationPromise;
        await prisma.secret.deleteMany({
            where: { id: { in: ids } },
        });
    }

    async cleanupExpiredSecrets(): Promise<void> {
        await this.migrationPromise;
        await prisma.secret.deleteMany({
            where: {
                expireAt: {
                    lt: new Date(),
                },
            },
        });
    }
}
