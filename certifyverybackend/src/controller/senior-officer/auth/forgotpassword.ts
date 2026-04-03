import { Request, Response } from "express";
import Senior from "../../../model/senior.model";
import bcrypt from "bcrypt";

export const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const senior = await Senior.findOne({ email });
        if (!senior) {
            return res.status(404).json({ message: "Senior not found" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        senior.password = hashedPassword;
        await senior.save();
        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}