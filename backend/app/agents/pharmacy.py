from .state import AgentState
from ..rag.vector_store import LocalVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI

# LRU Cache to avoid redundant LLM/Vector calls
_rag_cache = {}

def pharmacy_node(state: AgentState):
    """
    Pharmacology Specialist: Retrieves RAG guidelines and uses Gemini to synthesize treatment.
    """
    condition = state.get("condition", "")
    vitals = state.get("vitals", {})
    
    if condition == "Normal":
         return {"medical_guidance": "No intervention needed.", "recommendation": None}
         
    if condition in _rag_cache:
         return {"medical_guidance": _rag_cache[condition]}
         
    try:
        vs = LocalVectorStore()
        docs = vs.similarity_search(condition, k=1)
        raw_guidance = docs[0].page_content if docs else "Administer fluids and broad-spectrum antibiotics."
        
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
        prompt = f"""
        You are a clinical pharmacist AI. Based on the following patient condition and RAG guidelines, synthesize a precise, actionable medical order.
        
        Patient Condition: {condition}
        Vitals: {vitals}
        
        RAG Guidelines:
        {raw_guidance}
        
        Provide a concise medical order and dosage:
        """
        response = llm.invoke(prompt)
        guidance = response.content
        
    except Exception as e:
        print("Pharmacy LLM Error:", e)
        guidance = "Administer fluids and broad-spectrum antibiotics. (Fallback)"

    _rag_cache[condition] = guidance
    return {"medical_guidance": guidance}
