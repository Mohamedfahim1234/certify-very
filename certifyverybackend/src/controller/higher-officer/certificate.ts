import { Request, Response } from "express";
import { HigherAuthenticatedRequest } from "../../middleware/higher.middleware.js";
import Certificate from "../../model/certificate.model.js";
import User from "../../model/user.model.js";
import { sendMail } from "../user/mail.js";
import { generateCertificateHash } from "../../utils/hash.utils.js";

export const getAllCertificatesController = async (req: HigherAuthenticatedRequest, res: Response) => {
    try {
        console.log('Fetching certificates for higher officer');
        const certificates = await Certificate.find({ status: { $in: ['pending', 'approved'] }, approvalHistory: { $elemMatch: { action: { $eq: 'approved' } } }, seniorapprovalhistory: { $elemMatch: { action: { $eq: 'approved' } } } });

        res.status(200).json({ message: 'Certificates fetched successfully', certificates });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch certificates', error: error.message });
    }
}

export const updateCertificateStatusController = async (req: HigherAuthenticatedRequest, res: Response) => {
    const { certificateId } = req.params;
    const { status, remarks } = req.body;
    console.log(certificateId, status, remarks);

    try {
        const certificate = await Certificate.findById(certificateId);
        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        
        const alreadyReviewed = certificate.higherapprovalhistory?.find(h => h.level === 'higher' || h.level === 'final');
        if (alreadyReviewed) {
            if (alreadyReviewed.action === status) {
                // Idempotent success if it was already updated to the same status (e.g., from a double-click on frontend)
                return res.status(200).json({ message: 'Certificate already updated', certificate });
            }
            return res.status(400).json({ message: 'Certificate already reviewed at higher level' });
        }

        if (status === 'rejected') {
            await Certificate.findByIdAndUpdate(certificateId, {
                status: 'rejected',
                $push: { higherapprovalhistory: { level: 'higher', action: status, officer: req.user?.id, timestamp: new Date(), remarks } }
            });

            // Email Notification
            const user = await User.findById(certificate.userId);
            if (user && user.email) {
                const subject = `Certificate Update: Rejected by Higher Authority`;
                const html = `
                    <h3>Hello ${user.name || 'Applicant'},</h3>
                    <p>We regret to inform you that your application for <strong>${certificate.certificateType}</strong> (ID: ${certificate.certificateId || certificate._id}) has been <strong>Rejected</strong> by the Higher Authority.</p>
                    <p><strong>Reason:</strong> ${remarks || 'Final review criteria not met.'}</p>
                    <p>You may review your application in your dashboard.</p>
                `;
                await sendMail(user.email, subject, html);
            }
        } else {
            // Final Approval: Generate deterministic Blockchain Hash from certificate metadata
            const blockchainHash = generateCertificateHash({
                certificateId: certificate.certificateId || certificate._id.toString(),
                applicantName: certificate.applicantName,
                certificateType: certificate.certificateType,
                appliedAt: certificate.appliedAt,
            });

            await Certificate.findByIdAndUpdate(certificateId, {
                status,
                blockchainHash,
                $push: { higherapprovalhistory: { level: 'higher', action: status, officer: req.user?.id, timestamp: new Date() } }
            });

            // Email Notification
            const user = await User.findById(certificate.userId);
            if (user && user.email) {
                const subject = `Congratulations! Your Certificate is Approved`;
                const html = `
                    <h3>Hello ${user.name || 'Applicant'},</h3>
                    <p>Great news! Your application for <strong>${certificate.certificateType}</strong> has been <strong>Fully Approved</strong> by the Higher Authority.</p>
                    <p><strong>Certificate ID:</strong> ${certificate.certificateId || certificate._id}</p>
                    <p>You can now download your digital certificate from your dashboard.</p>
                    <p>Verification Link: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify">Verify Authenticity</a></p>
                `;
                await sendMail(user.email, subject, html);
            }
        }

        return res.status(200).json({ message: 'Certificate status updated successfully', certificate });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update certificate status', error: error.message });
    }
}