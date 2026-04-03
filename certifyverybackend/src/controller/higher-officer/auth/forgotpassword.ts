import { Request, Response } from "express";
import Higher from "../../../model/higher.model";
import bcrypt from "bcrypt";

export const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const higher = await Higher.findOne({ email });
        if (!higher) {
            return res.status(404).json({ message: "Higher not found" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        higher.password = hashedPassword;
        await higher.save();
        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}