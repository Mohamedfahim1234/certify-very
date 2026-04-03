import { Request, Response } from "express";
import Officer from "../../../model/officer.model";
import bcrypt from "bcrypt";

export const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const officer = await Officer.findOne({ email });
        if (!officer) {
            return res.status(404).json({ message: "Officer not found" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        officer.password = hashedPassword;
        await officer.save();
        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}