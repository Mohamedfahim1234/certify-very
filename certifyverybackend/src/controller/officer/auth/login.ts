import { Request, Response } from 'express';
import Officer from '../../../model/officer.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginController = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try{
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await Officer.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    if(!process.env.SECRET_KEY_OFFICER){
        return res.status(500).json({message: 'Internal server error: SECRET_KEY_OFFICER not configured' });
    }

    const token = jwt.sign(
        { id: user._id, email: user.email, role: 'lower_official' },process.env.SECRET_KEY_OFFICER,{ expiresIn: '1h' });
    
    res.status(200).json({ message: 'Login successful', token, user});
   }catch(err: any){
    res.status(500).json({ message: 'Internal server error', error: err.message });
   }
}