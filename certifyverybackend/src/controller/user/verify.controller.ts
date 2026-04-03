import { Request, Response } from "express";
import Certificate from "../../model/certificate.model.js";

/**
 * Verifies a certificate by uploading the certificate PDF file.
 * 
 * How it works:
 * 1. The user uploads the certificate PDF that was downloaded from the portal.
 * 2. The filename contains the Certificate ID (e.g., Birth_Certificate_CERT-2026-0004.pdf).
 * 3. We extract the Certificate ID from the filename.
 * 4. As a fallback, we also scan the raw PDF bytes for the CERT-YYYY-XXXX pattern
 *    or a 64-char hex blockchain hash.
 * 5. We look up the certificate in the database.
 */
export const verifyFileController = async (req: Request, res: Response) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No certificate file uploaded for verification' });
        }

        const certIdPattern = /CERT-\d{4}-\d{4}/i;
        const hashPattern = /[0-9a-f]{64}/i;

        // Strategy 1: Extract Certificate ID from the original filename
        let certIdMatch = file.originalname.match(certIdPattern);

        // Strategy 2: Scan the raw file buffer as text for the certificate ID or hash
        let hashMatch: RegExpMatchArray | null = null;
        if (!certIdMatch && file.buffer) {
            const rawText = file.buffer.toString('utf-8');
            certIdMatch = rawText.match(certIdPattern);
            hashMatch = rawText.match(hashPattern);
        }

        let certificate: any = null;

        // Look up by Certificate ID first
        if (certIdMatch) {
            certificate = await Certificate.findOne({ certificateId: certIdMatch[0].toUpperCase() })
                .populate('userId', 'name email');
        }

        // Fall back to blockchain hash lookup
        if (!certificate && hashMatch) {
            certificate = await Certificate.findOne({ blockchainHash: hashMatch[0].toLowerCase() })
                .populate('userId', 'name email');
        }

        if (!certificate) {
            return res.status(404).json({ 
                message: 'Certificate verification failed: No matching record found in our database.',
                status: 'invalid',
                hint: 'Please ensure you are uploading the original certificate PDF downloaded from this portal.',
                extractedId: certIdMatch?.[0] || null,
            });
        }

        return res.status(200).json({
            message: 'Certificate verified successfully!',
            status: 'valid',
            verificationDetails: {
                certificateId: certificate.certificateId,
                applicantName: certificate.applicantName,
                certificateType: certificate.certificateType,
                issuedTo: (certificate.userId as any)?.name,
                blockchainHash: certificate.blockchainHash,
                appliedAt: certificate.appliedAt,
                currentStatus: certificate.status
            }
        });
    } catch (error: any) {
        console.error('File verification error:', error);
        return res.status(500).json({ 
            message: 'Internal server error during verification', 
            error: error.message 
        });
    }
};
