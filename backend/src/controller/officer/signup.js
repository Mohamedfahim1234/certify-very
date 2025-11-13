import { Officermodel } from '../../model/officer.model.js';
import bcrypt from 'bcrypt';

export const signupController = async (req, res) => {
    const { username, email, password, department } = req.body;

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

        const existingUser = await Officermodel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Officermodel.create(username, email, hashedPassword, department);

        return res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}