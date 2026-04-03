import mongoose from "mongoose";

export interface ISenior extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    department: string;
    role: string;
};

const seniorSchema = new mongoose.Schema<ISenior>({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    role: { 
        type: String,
    }
});

const Senior = mongoose.model<ISenior>("Senior", seniorSchema);

export default Senior;