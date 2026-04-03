/**
 * One-time migration script to regenerate blockchain hashes for existing approved certificates.
 * Run with: npx tsx src/scripts/rehash-certificates.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Certificate from '../model/certificate.model';
import { generateCertificateHash } from '../utils/hash.utils';

dotenv.config();

async function main() {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        console.error('MONGO_URI is not defined');
        process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to database');

    const approvedCerts = await Certificate.find({ status: 'approved' });
    console.log(`Found ${approvedCerts.length} approved certificates to re-hash`);

    let updated = 0;
    for (const cert of approvedCerts) {
        const newHash = generateCertificateHash({
            certificateId: cert.certificateId || cert._id.toString(),
            applicantName: cert.applicantName,
            certificateType: cert.certificateType,
            appliedAt: cert.appliedAt,
        });

        if (cert.blockchainHash !== newHash) {
            await Certificate.findByIdAndUpdate(cert._id, { blockchainHash: newHash });
            console.log(`  Updated ${cert.certificateId || cert._id}: ${cert.blockchainHash?.slice(0, 12)}... → ${newHash.slice(0, 12)}...`);
            updated++;
        }
    }

    console.log(`\nDone. Updated ${updated}/${approvedCerts.length} certificates.`);
    await mongoose.disconnect();
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
