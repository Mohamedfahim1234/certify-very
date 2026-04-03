import { Request, Response } from "express";
import { SeniorAuthenticatedRequest } from "../../middleware/senior.middleware.js";
import Senior from "../../model/senior.model.js";

export const getSeniorProfileController = async (req: SeniorAuthenticatedRequest, res: Response) => {
    const seniorId = req.user?.id;
    try {
        const senior = await Senior.findById(seniorId).select('-password');
        if (!senior) {
            return res.status(404).json({ message: 'Senior not found' });
        }

        res.status(200).json({ senior });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch senior profile', error: error.message });
    }
}

export const updateSeniorProfileController = async (req: SeniorAuthenticatedRequest, res: Response) => {
    const seniorId = req.user?.id;
    const { name, email, department } = req.body;
    try {
        const existSenior = await Senior.findById(seniorId);
        if (!existSenior) {
            return res.status(404).json({ message: 'Senior not found' });
        }

        const senior = await Senior.findByIdAndUpdate(seniorId, { name, email, department }, { new: true }).select('-password');

        res.status(200).json({ message: 'Senior profile updated successfully', senior });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update senior profile', error: error.message });
    }
}