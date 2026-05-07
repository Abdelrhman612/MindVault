from utils.pdf_loader import get_pdf_text
from utils.text_splitter import get_text_chunks
from vectorstore.vectorstore import get_vector_store
from llm.llm import generate_answer
from rag.rag_pipeline import get_answer


def process_pdfs(pdf_docs):
    raw_text = get_pdf_text(pdf_docs)
    chunks = get_text_chunks(raw_text)
    return get_vector_store(chunks)


def process_question(vectorstore, question, chat_history=None):
    return get_answer(
        vectorstore,
        question,
        generate_answer,
        chat_history
    )