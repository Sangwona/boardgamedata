import sqlite3

def check_schema():
    conn = sqlite3.connect('instance/boardgame.db')
    cursor = conn.cursor()
    
    # game_record 테이블의 컬럼 정보 확인
    cursor.execute("PRAGMA table_info(game_record)")
    columns = cursor.fetchall()
    
    print("game_record 테이블 컬럼:")
    for col in columns:
        print(f"- {col[1]} ({col[2]})")
    
    conn.close()

if __name__ == "__main__":
    check_schema() 