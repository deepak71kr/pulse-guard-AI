import os
import sys

# Ensure we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.rag.parser import parse_guidelines
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

def seed():
    load_dotenv()
    print("Parsing guidelines...")
    guidelines_path = os.path.join(os.path.dirname(__file__), "../../clinical_guidelines.md")
    docs = parse_guidelines(guidelines_path)
    
    print(f"Parsed {len(docs)} sections. Initializing Chroma DB...")
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    
    # Store in Chroma
    vectorstore = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name="clinical_guidelines",
        persist_directory="./chroma_db"
    )
    
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
