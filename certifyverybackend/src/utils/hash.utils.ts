import crypto from 'node:crypto';
import fs from 'node:fs/promises';

/**
 * Generates a SHA-256 hash from either a file buffer, a remote URL, or a local file path.
 * Used for "Blockchain" document verification.
 */
export const generateDocumentHash = async (input: string | Buffer): Promise<string> => {
    let data: Buffer;

    if (Buffer.isBuffer(input)) {
        data = input;
    } else if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'))) {
        const response = await fetch(input);
        const arrayBuffer = await response.arrayBuffer();
        data = Buffer.from(arrayBuffer);
    } else if (typeof input === 'string') {
        try {
            await fs.access(input);
            data = await fs.readFile(input);
        } catch {
            data = Buffer.from(input);
        }
    } else {
        throw new Error('Invalid input type for generateDocumentHash');
    }

    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generates a deterministic SHA-256 hash from certificate metadata.
 * This is used as the "blockchain hash" stored in the DB and printed on the certificate PDF.
 * Since the certificate PDF is generated client-side, we cannot hash the PDF itself.
 * Instead we hash stable metadata so it can be looked up during verification.
 */
export const generateCertificateHash = (meta: {
    certificateId: string;
    applicantName: string;
    certificateType: string;
    appliedAt: string | Date;
}): string => {
    const payload = [
        meta.certificateId,
        meta.applicantName.trim().toLowerCase(),
        meta.certificateType.trim().toLowerCase(),
        new Date(meta.appliedAt).toISOString(),
    ].join('|');

    return crypto.createHash('sha256').update(payload).digest('hex');
};

