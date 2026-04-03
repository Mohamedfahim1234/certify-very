import { Request, Response } from "express";
import { pipeline } from "@xenova/transformers";
import rag from "../../model/rag.model";

const embeddings = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

async function getEmbedding(text: string): Promise<number[]>{
    const result = await embeddings(text,{
        pooling: "mean",
        normalize: true
    });
    return Array.from(result.data)
}

function cosineSimilarity(a: number[],b: number[]): number{
    let dot = 0,na = 0, nb = 0;
    for(let i = 0; i < a.length && i < b.length; i++){
        dot += a[i]! * b[i]!;
        na += a[i]! * a[i]!;
        nb += b[i]! * b[i]!;
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function splitText(text: string, size: 300, overlap: 30){
    const chunks: string[] = [];

    for(let i = 0; i <= text.length; i += size - overlap){
        chunks.push(text.slice(i, i + size));
    }

    return chunks
}


export const ingest = async(req: Request,res: Response) => {
    const { text, docId } = req.body;

    if(!text) return res.status(401).json({message: 'Text is required'});

    if(!docId) return res.status(401).json({message: 'Id is required'});

    try {
     const chunks = await splitText(text, 300, 30);

    for(const chunk of chunks){
       const emb = await getEmbedding(chunk);

       if(!chunk) return res.status(401).json({message: "Chunk is required"})

       if(!emb) return res.status(401).json({message: "Emb is required"});

       await rag.create({
         text: chunk,
         embedding: emb,
         docId: docId
       });
    }

    return res.status(200).json({message: "text ingested successfully"});    
    } catch (error) {
        return res.status(500).json({ message:"An Error occured",error})
    }
}


export const ask = async(req: Request, res: Response) => {
    const { query, topk } = req.body;

    if(!query) return res.status(401).json({ message: "Query is required"});

    if(!topk) return res.status(401).json({ message: "TopK is required"});

    try {

        const qemb = await getEmbedding(query);

        const chunks = await rag.find();
        
        const docs = await Promise.all( chunks.map(async(data: any)=>{
          const score :number = cosineSimilarity(data.embedding, qemb);

          return{
          text: data.text,
          docId: data.docId,
          score
          }
        }));

        docs.sort((a,b)=> b.score - a.score );

        const scored = docs.slice(0,topk);

        const MIN_SCORE = 0.3;

        if(scored.length === 0 || scored[0]!.score < MIN_SCORE ){
             return res.status(200).json({
                query,
                message: "Sorry, we don't have information related to this."
             })
        }

        return res.status(200).json({query, result: scored})  
    } catch (error) {
      return res.status(500).json({message: "An Internal Error Occured", error});  
    }
}