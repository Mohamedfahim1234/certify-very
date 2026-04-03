import { Request, Response } from "express";
import { OfficerAuthenticatedRequest } from "../../middleware/officer.middleware.js";
import Certificate from "../../model/certificate.model.js";
import User from "../../model/user.model.js";
import { sendMail } from "../user/mail.js";

export const getAllCertificatesController = async (req: OfficerAuthenticatedRequest, res: Response) => {
    try {
        const certificates = await Certificate.find();

        res.status(200).json({ message: 'Certificates fetched successfully', certificates });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch certificates', error: error.message });
    }
}

export const updateCertificateStatusController = async (req: OfficerAuthenticatedRequest, res: Response) => {
    const { certificateId } = req.params;
    const { status, remarks } = req.body;
    console.log(certificateId, status, remarks);

    try {
        const certificate = await Certificate.findById(certificateId);
        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        
        const alreadyReviewed = certificate.approvalHistory?.find(h => h.level === 'lower' || h.level === 'final');
        if (alreadyReviewed) {
            if (alreadyReviewed.action === status) {
                // Idempotent success if it was already updated to the same status (e.g., from a double-click on frontend)
                return res.status(200).json({ message: 'Certificate already updated', certificate });
            }
            return res.status(400).json({ message: 'Certificate already reviewed at lower level' });
        }

        console.log('Current Status:', certificate.status, 'New Status:', status);
        if (status == 'approved') {
            await Certificate.findByIdAndUpdate(certificateId, { $push: { approvalHistory: { level: 'lower', action: status, officer: req.user?.id, timestamp: new Date() } } });
            
            // Email Notification
            const user = await User.findById(certificate.userId);
            if (user && user.email) {
                const subject = `Certificate Update: Processed by Lower Authority`;
                const html = `
                    <h3>Hello ${user.name || 'Applicant'},</h3>
                    <p>Your application for <strong>${certificate.certificateType}</strong> (ID: ${certificate.certificateId || certificate._id}) has been processed and approved by the <strong>Lower Authority</strong>.</p>
                    <p>It has now been forwarded to the <strong>Mid-Level Authority</strong> for further review.</p>
                    <p>Current Status: <strong>Pending (Forwarded)</strong></p>
                `;
                await sendMail(user.email, subject, html);
            }

            return res.status(200).json({ message: 'Certificate status updated successfully', certificate });
        } else if (status == 'rejected') {
            if (!remarks) {
                return res.status(400).json({ message: 'Remarks are required for rejection' });
            }
            console.log('Rejection Remarks:', remarks);
            await Certificate.findByIdAndUpdate(certificateId, { status: 'rejected', $push: { approvalHistory: { level: 'lower', action: status, officer: req.user?.id, timestamp: new Date(), remarks } } });
            
            // Email Notification
            const user = await User.findById(certificate.userId);
            if (user && user.email) {
                const subject = `Certificate Update: Rejected by Lower Authority`;
                const html = `
                    <h3>Hello ${user.name || 'Applicant'},</h3>
                    <p>We regret to inform you that your application for <strong>${certificate.certificateType}</strong> (ID: ${certificate.certificateId || certificate._id}) has been <strong>Rejected</strong> by the Lower Authority.</p>
                    <p><strong>Reason:</strong> ${remarks}</p>
                    <p>You may review your application and any feedback in your dashboard.</p>
                `;
                await sendMail(user.email, subject, html);
            }

            return res.status(200).json({ message: 'Certificate status updated successfully', certificate });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update certificate status', error: error.message });
    }
}