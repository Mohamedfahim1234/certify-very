import mongoose from "mongoose";

export interface IHigher extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    department: string;
    role: string;
};

const higherSchema = new mongoose.Schema<IHigher>({
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

const Higher = mongoose.model<IHigher>("Higher", higherSchema);

export default Higher;