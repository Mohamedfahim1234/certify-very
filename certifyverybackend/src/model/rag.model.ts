import mongoose from "mongoose";

export interface IRag extends mongoose.Document{
    text: string,
    embedding: number[],
    docId: string
}

const ragSchema = new mongoose.Schema<IRag>({
    text:{
        type: String,
        required: true
    },
    embedding:{
        type: [Number],
        required: true
    },
    docId: {
        type: String,
        required: true
    }
});

const rag = mongoose.model<IRag>("Rag",ragSchema);
export default rag;