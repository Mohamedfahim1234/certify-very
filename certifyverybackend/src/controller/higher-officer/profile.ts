import { Request, Response } from "express";
import Higher from "../../model/higher.model";
import { HigherAuthenticatedRequest } from "../../middleware/higher.middleware";

export const getHigherProfileController = async (req: HigherAuthenticatedRequest, res: Response) => {
    const higherId = req.user?.id;
    try {
        const higher = await Higher.findById(higherId).select('-password');
        if (!higher) {
            return res.status(404).json({ message: 'Higher officer not found' });
        }

        res.status(200).json({ higher });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch higher officer profile', error: error.message });
    }
}

export const updateHigherProfileController = async (req: HigherAuthenticatedRequest, res: Response) => {
    const higherId = req.user?.id;
    const { name, email, department } = req.body;
    try {
        const existHigher = await Higher.findById(higherId);
        if (!existHigher) {
            return res.status(404).json({ message: 'Higher officer not found' });
        }

        const higher = await Higher.findByIdAndUpdate(higherId, { name, email, department }, { new: true }).select('-password');
        res.status(200).json({ message: 'Higher officer profile updated successfully', higher });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update higher officer profile', error: error.message });
    }
}