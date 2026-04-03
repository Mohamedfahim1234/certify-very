import { Request, Response } from 'express';
import Higher from '../../../model/higher.model';
import bcrypt from 'bcrypt';

export const signupController = async (req: Request, res: Response) => {
    const { username, email, password, department, role } = req.body;

    try {
        if(!username || !email || !password || !department){
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await Higher.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Higher.create({ username, email, password: hashedPassword, department, role});

        return res.status(201).json({ message: 'User created successfully', user });
    } catch (error: any) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}