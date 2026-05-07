from langdetect import detect

def get_answer(vectorstore, question, llm, chat_history=None):
    
    
    try:
        lang = detect(question)
    except:
        lang = "en"

    if lang == "ar":
        lang_rule = "Answer ONLY in Arabic."
    else:
        lang_rule = "Answer ONLY in English."

    docs = vectorstore.similarity_search(question, k=3)

    context = "\n".join([d.page_content for d in docs])

    history_str = ""
    if chat_history:
        for msg in chat_history[:-1]:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_str += f"{role}: {msg['content']}\n"

    prompt = f"""
You are a helpful assistant.

RULES:
0. {lang_rule}
1. Answer ONLY from the context below.
2. If answer is not in context, say "I don't know".
3. If multiple pieces of context are given, prioritize the one that directly matches the question.
Ignore unrelated context even if it seems similar.

Context:
{context}

Chat History:
{history_str}

Question:
{question}

Answer:
"""

    return llm(prompt)