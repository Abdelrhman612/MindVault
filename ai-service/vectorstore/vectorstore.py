from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
import os

def get_embeddings():
    return OllamaEmbeddings(model="nomic-embed-text")

def get_vector_store(text_chunks, user_id):
    embeddings = get_embeddings()
    metadatas = [{"chunk_id": i, "user_id": user_id} for i in range(len(text_chunks))]
    
    vectorstore = FAISS.from_texts(
        text_chunks,
        embedding=embeddings,
        metadatas=metadatas
    )
    
    # Save to disk
    path = f"vector_indices/{user_id}"
    if not os.path.exists("vector_indices"):
        os.makedirs("vector_indices")
    vectorstore.save_local(path)
    return vectorstore

def load_vector_store(user_id):
    path = f"vector_indices/{user_id}"
    if not os.path.exists(path):
        return None
    embeddings = get_embeddings()
    return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)