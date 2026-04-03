import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    name: string;
    phone: string;
    email: string;
    role: 'citizen' | 'officer';
    otp?: string;
};

const userSchema = new mongoose.Schema<IUser>({
    name: {
      type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum: ['citizen', 'officer'],
        default: 'citizen'
    },
    otp: {
        type: String,
    }
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;