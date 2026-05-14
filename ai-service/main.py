from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import List, Optional
from service.chat_service import process_pdfs, process_question
import uvicorn
import json

app = FastAPI(title="AI Service API")

@app.post("/upload/{user_id}")
async def upload_pdfs(user_id: str, files: List[UploadFile] = File(...)):
    try:
        # Pass the file-like objects (file.file)
        pdf_streams = [f.file for f in files]
        process_pdfs(pdf_streams, user_id)
        return {"message": "PDFs processed successfully", "user_id": user_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/{user_id}")
async def chat(user_id: str, question: str = Form(...), chat_history: Optional[str] = Form(None)):
    try:
        history = []
        if chat_history:
            history = json.loads(chat_history)
            
        answer = process_question(user_id, question, history)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
