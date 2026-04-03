import { Request, Response } from "express";
import { OfficerAuthenticatedRequest } from "../../middleware/officer.middleware.js";
import Officer from "../../model/officer.model.js";

export const getOfficerProfileController = async (req: OfficerAuthenticatedRequest, res: Response) => {
    const officerId = req.user?.id;
    try {
        const officer = await Officer.findById(officerId).select('-password');
        if (!officer) {
            return res.status(404).json({ message: 'Officer not found' });
        }

        res.status(200).json({ officer });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch officer profile', error: error.message });
    }
}

export const updateOfficerProfileController = async (req: OfficerAuthenticatedRequest, res: Response) => {
    const officerId = req.user?.id;
    const { name, email, department } = req.body;
    try {
        const existofficer = await Officer.findById(officerId);
        if (!existofficer) {
            return res.status(404).json({ message: 'Officer not found' });
        }

        const officer = await Officer.findByIdAndUpdate(officerId, { name, email, department }, { new: true }).select('-password');

        res.status(200).json({ message: 'Officer profile updated successfully', officer });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update officer profile', error: error.message });
    }
}