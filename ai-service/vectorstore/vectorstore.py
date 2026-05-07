from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
def get_vector_store(text_chunks):
    embeddings = OllamaEmbeddings(model="nomic-embed-text")

    metadatas = [{"chunk_id": i} for i in range(len(text_chunks))]

    return FAISS.from_texts(
        text_chunks,
        embedding=embeddings,
        metadatas=metadatas
    )