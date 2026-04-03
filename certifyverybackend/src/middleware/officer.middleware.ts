import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface OfficerAuthenticatedRequest extends Request {
    user?:{
        id: string;
        email: string;
    };
}

export const authenticateOffice = (req: OfficerAuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    if(!process.env.SECRET_KEY_OFFICER){
        return res.status(500).json({ message: 'Internal server error: SECRET_KEY_OFFICER not configured'})
    }

    try {
        const decoded = jwt.verify(token,process.env.SECRET_KEY_OFFICER);
        req.user = {
            id: (decoded as any).id,
            email: (decoded as any).email
        };
        next()
    } catch (error: any) {
        return res.status(401).json({message: 'Invalid or expired token', error: error.message})
    }
}