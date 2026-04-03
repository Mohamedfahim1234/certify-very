import { Request, Response } from 'express';
import Officer from '../../../model/officer.model.js';
import bcrypt from 'bcrypt';

export const signupController = async (req: Request, res: Response) => {
    const { username, email, password, department, role } = req.body;

    try {
        if(!username){
            return res.status(400).json({ message: 'Username is required' });
        }

        if(!email){
            return res.status(400).json({ message: 'Email is required' });
        }

        if(!password){
            return res.status(400).json({ message: 'Password is required' });
        }

        if(!department){
            return res.status(400).json({ message: 'Department is required' });
        }

        const existingUser = await Officer.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Officer.create({ username, email, password: hashedPassword, department, role: 'officer' });

        return res.status(201).json({ message: 'User created successfully', user });
    } catch (error: any) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}