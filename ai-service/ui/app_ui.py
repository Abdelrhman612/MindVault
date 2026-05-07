import streamlit as st
from service.chat_service import process_question, process_pdfs


def run_ui():

    st.set_page_config(page_title="Chat with PDFs", page_icon="📚")
    st.header("Chat with Multiple PDFs 📚")

    if "vectorstore" not in st.session_state:
        st.session_state.vectorstore = None

    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # --- Ask question ---
    if user_question := st.chat_input("Ask a question"):
        st.session_state.messages.append({"role": "user", "content": user_question})
        with st.chat_message("user"):
            st.markdown(user_question)

        if st.session_state.vectorstore:
            with st.spinner("Thinking..."):
                response = process_question(
                    st.session_state.vectorstore,
                    user_question,
                    st.session_state.messages
                )
            with st.chat_message("assistant"):
                st.markdown(response)
            st.session_state.messages.append({"role": "assistant", "content": response})
        else:
            st.warning("Please upload and process PDFs first.")

    # --- Sidebar ---
    with st.sidebar:
        pdf_docs = st.file_uploader("Upload PDFs", accept_multiple_files=True)

        if st.button("Process"):
            if pdf_docs:
                st.session_state.vectorstore = process_pdfs(pdf_docs)
                st.success("Ready!")