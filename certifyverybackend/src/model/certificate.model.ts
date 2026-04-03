import mongoose from 'mongoose';


export interface ICertificate extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    certificateId: string;
    applicantName: string;
    certificateType: string;
    details?: any;
    documentUrl: string[];
    status: 'pending' | 'approved' | 'rejected';
    appliedAt: Date;
    approvalHistory: {
        level: string;
        action: 'approved' | 'rejected';
        officer: mongoose.Types.ObjectId;
        timestamp: Date;
        remarks?: string;
    }[];
    seniorapprovalhistory: {
        level: string;
        action: 'approved' | 'rejected';
        officer: mongoose.Types.ObjectId;
        timestamp: Date;
        remarks?: string;
    }[];
    higherapprovalhistory: {
        level: string;
        action: 'approved' | 'rejected';
        officer: mongoose.Types.ObjectId;
        timestamp: Date;
        remarks?: string;
    }[];
    blockchainHash?: string;
    createdAt: Date;
    updatedAt: Date;
};

const certificateSchema = new mongoose.Schema<ICertificate>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    certificateId: { type: String, unique: true, sparse: true },
    applicantName: { type: String, required: true },
    certificateType: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
    documentUrl: { type: [String], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now },
    approvalHistory: [{
        level: { type: String },
        action: { type: String, enum: ['approved', 'rejected'] },
        officer: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
        timestamp: { type: Date },
        remarks: { type: String }
    }],
    seniorapprovalhistory: [{
        level: { type: String },
        action: { type: String, enum: ['approved', 'rejected'] },
        officer: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
        timestamp: { type: Date },
        remarks: { type: String }
    }],
    higherapprovalhistory: [{
        level: { type: String },
        action: { type: String, enum: ['approved', 'rejected'] },
        officer: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
        timestamp: { type: Date },
        remarks: { type: String }
    }],
    blockchainHash: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);

export default Certificate;