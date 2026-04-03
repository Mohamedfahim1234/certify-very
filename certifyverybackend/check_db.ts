import mongoose from 'mongoose';
const MONGO_URI = 'mongodb://localhost:27017/Certifyvery';

const certificateSchema = new mongoose.Schema({
    blockchainHash: String,
    status: String
});

const Certificate = mongoose.model('Certificate', certificateSchema);

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const total = await Certificate.countDocuments();
        const approved = await Certificate.countDocuments({ status: 'approved' });
        const withHash = await Certificate.countDocuments({ blockchainHash: { $exists: true, $ne: '' } });
        const emptyHash = await Certificate.countDocuments({ blockchainHash: '' });
        const noHashField = await Certificate.countDocuments({ blockchainHash: { $exists: false } });

        console.log(`Total Certificates: ${total}`);
        console.log(`Approved: ${approved}`);
        console.log(`With non-empty Hash: ${withHash}`);
        console.log(`With empty string Hash: ${emptyHash}`);
        console.log(`Without blockchainHash field: ${noHashField}`);

        if (withHash > 0) {
            const examples = await Certificate.find({ blockchainHash: { $exists: true, $ne: '' } }).limit(3);
            examples.forEach(ex => {
                console.log(`ID: ${ex._id}, Hash: ${ex.blockchainHash}`);
            });
        }
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

check();
