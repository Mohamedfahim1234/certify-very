import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface HigherAuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const higherAuthMiddleware = (req: HigherAuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const secret = process.env.SECRET_KEY_HIGHER_OFFICER;
    if(!secret){
        return res.status(500).json({message: 'Internal server error: SECRET_KEY_HIGHER_OFFICER not configured' });
    }

    try {
        const decoded = jwt.verify(token, secret) as { id: string; email: string; };
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}