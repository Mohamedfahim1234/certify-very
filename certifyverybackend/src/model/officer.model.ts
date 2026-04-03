import mongoose from "mongoose";

export interface IOfficer extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    department: string;
    role: string;
};

const officerSchema = new mongoose.Schema<IOfficer>({
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

const Officer = mongoose.model<IOfficer>("Officer", officerSchema);

export default Officer;