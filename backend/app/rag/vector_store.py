import os
from typing import List
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from .parser import parse_guidelines

class LocalVectorStore:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        
        # We need Gemini API key for embeddings
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not set in environment.")
            
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
        
        self.vectorstore = Chroma(
            collection_name="clinical_guidelines",
            embedding_function=self.embeddings,
            persist_directory=self.persist_directory
        )

    def ingest_document(self, filepath: str):
        """Parses and ingests a single markdown document into the vector store."""
        docs = parse_guidelines(filepath)
        if docs:
            self.vectorstore.add_documents(docs)
            print(f"Ingested {len(docs)} chunks from {filepath}")
        
    def similarity_search(self, query: str, k: int = 3) -> List[str]:
        """
        Standard semantic search. Returns raw text chunks.
        """
        results = self.vectorstore.similarity_search(query, k=k)
        return [doc.page_content for doc in results]

    def get_retriever(self, k: int = 3):
        return self.vectorstore.as_retriever(search_kwargs={"k": k})
