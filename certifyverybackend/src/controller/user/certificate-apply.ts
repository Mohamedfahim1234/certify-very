import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/user.middleware.js";
import Certificate from "../../model/certificate.model";
import mongoose from "mongoose";

export const applyCertificateController = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const applicantName = req.user?.name;
    const { certificateType } = req.body;

    // Parse details — sent as JSON string from multipart form
    let details: any = {};
    if (req.body.details) {
        try {
            details = typeof req.body.details === 'string' ? JSON.parse(req.body.details) : req.body.details;
        } catch (e) {
            return res.status(400).json({ message: 'Invalid JSON format for certificate details' });
        }
    }

    const uploadedFiles = (req.files as Express.Multer.File[]) ?? [];

    try {
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required. Please login again.' });
        }
        if (!applicantName) {
            return res.status(400).json({ message: 'Applicant name is required' });
        }
        if (!certificateType) {
            return res.status(400).json({ message: 'Certificate type is required' });
        }
        if (uploadedFiles.length === 0) {
            return res.status(400).json({ message: 'At least one document proof is required' });
        }

        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
        const documentproof = uploadedFiles.map((file: Express.Multer.File) =>
            `${baseUrl}/${file.path.replace(/\\/g, '/')}`
        );

        // Generate CERT-YYYY-XXXX Custom ID
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const count = await Certificate.countDocuments({ createdAt: { $gte: startOfYear } });
        const certificateId = `CERT-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

        const certificate = await Certificate.create({
            userId: new mongoose.Types.ObjectId(userId),
            certificateId,
            applicantName,
            certificateType,
            details,
            documentUrl: documentproof
        });

        res.status(201).json({ message: 'Certificate application submitted successfully', certificate });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation failed', error: error.message });
        }
        res.status(500).json({ message: 'Failed to apply for certificate', error: error.message });
    }
}

export const getUserCertificatesController = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const certificates = await Certificate.find({ userId: new mongoose.Types.ObjectId(userId) });
        console.log(certificates, userId);
        res.status(200).json({ certificates });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch certificates', error: error.message });
    }
}

export const verifyCertificateController = async (req: Request, res: Response) => {
    const { hash } = req.params;
    try {
        const certificate = await Certificate.findOne({
            $or: [
                { blockchainHash: hash },
                { certificateId: hash }
            ]
        }).populate('userId', 'name email');
        
        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found or hash is invalid' });
        }
        res.status(200).json({ message: 'Certificate verified successfully', certificate });
    } catch (error: any) {
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
}