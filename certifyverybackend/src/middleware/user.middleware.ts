import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?:{
        id: string;
        name?: string;
        email: string;
    };
}

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    if(!process.env.SECRET_KEY){
        return res.status(500).json({ message: 'Internal server error: SECRET_KEY not configured'})
    }

    try {
        const decoded = jwt.verify(token,process.env.SECRET_KEY);
        req.user = {
            id: (decoded as any).id,
            name: (decoded as any).name,
            email: (decoded as any).email
        };
        return next();
    } catch (error: any) {
        return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
    }

}

