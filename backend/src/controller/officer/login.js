import { Officermodel } from '../../model/officer.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    try{
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await Officermodel.findByEmail(email);
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        'your_jwt_secret_officer',{ expiresIn: '1h' });
    
    res.status(200).json({ message: 'Login successful', token });
   }catch(err){
    res.status(500).json({ message: 'Internal server error', error: err.message });
   }
}