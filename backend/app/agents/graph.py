from langgraph.graph import StateGraph, END
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3
from .state import AgentState
from .triage import triage_node
from .pharmacy import pharmacy_node
from .reporter import reporter_node

def route_triage(state: AgentState):
    if state.get("condition") == "Normal":
        return END
    return "pharmacy"

def route_approval(state: AgentState):
    if state.get("approval_status") == "pending":
        return "human_approval"
    return END

# Human in the loop placeholder node
def human_approval(state: AgentState):
    return state

def build_graph():
    builder = StateGraph(AgentState)
    
    # Add nodes
    builder.add_node("triage", triage_node)
    builder.add_node("pharmacy", pharmacy_node)
    builder.add_node("reporter", reporter_node)
    builder.add_node("human_approval", human_approval)
    
    # Add edges
    builder.set_entry_point("triage")
    builder.add_conditional_edges("triage", route_triage)
    builder.add_edge("pharmacy", "reporter")
    builder.add_edge("reporter", "human_approval")
    builder.add_conditional_edges("human_approval", route_approval)
    
    return builder

# Compile the graph with a sqlite checkpointer for HITL
conn = sqlite3.connect("checkpoints.sqlite", check_same_thread=False)
memory = SqliteSaver(conn)
graph = build_graph().compile(checkpointer=memory, interrupt_before=["human_approval"])
