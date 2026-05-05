from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq

load_dotenv()  

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_answer(prompt):
    response = llm.invoke(prompt)
    return response.content
    