import sqlite3

def init_db():
    conn = sqlite3.connect("mock_ehr.db", check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS approved_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT,
            condition TEXT,
            action TEXT,
            reasoning TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def log_approval(recommendation: dict):
    conn = sqlite3.connect("mock_ehr.db", check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO approved_orders (patient_id, condition, action, reasoning)
        VALUES (?, ?, ?, ?)
    """, (
        recommendation.get("patient_id"),
        recommendation.get("condition_detected"),
        recommendation.get("recommended_action"),
        recommendation.get("reasoning")
    ))
    conn.commit()
    conn.close()

def get_patient_history(patient_id: str):
    conn = sqlite3.connect("mock_ehr.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT condition, action, reasoning, timestamp 
        FROM approved_orders 
        WHERE patient_id = ? 
        ORDER BY timestamp ASC
    """, (patient_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
