import { Usermodel } from "../../model/user.model.js";
import jwt from 'jsonwebtoken';

export const loginController = async (req, res) => {
    const { email, otp } = req.body;

    try{
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await Usermodel.findByEmail(email);
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    if (otp !== user.otp) {
        return res.status(401).json({ message: 'Invalid OTP' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        'your_jwt_secret',{ expiresIn: '1h' });
    
    res.status(200).json({ message: 'Login successful', token });
   }catch(err){
    res.status(500).json({ message: 'Internal server error', error: err.message });
   }
}