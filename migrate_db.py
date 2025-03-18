import sqlite3
import os

def migrate_database():
    print("데이터베이스 마이그레이션 시작...")
    
    # 데이터베이스 파일 확인
    db_file = 'board_game_tracker.db'
    
    if not os.path.exists(db_file):
        print(f"오류: {db_file} 파일이 존재하지 않습니다.")
        return
    
    # 데이터베이스 연결
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # 테이블 구조 변경 진행
    try:
        print("테이블 구조 업데이트 중...")
        
        # 1. GameRecord 테이블의 meeting_id를 nullable로 변경
        # 2. Player 테이블에 새 필드 추가
        # 3. GameResult 테이블에 player_name 필드 추가
        
        # 트랜잭션 시작
        conn.execute("BEGIN TRANSACTION")
        
        # 임시 테이블 생성 및 데이터 복사
        # Player 테이블 업데이트
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS player_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            birth_year INTEGER,
            mbti VARCHAR(4),
            location VARCHAR(100)
        )
        """)
        
        cursor.execute("""
        INSERT INTO player_new (id, name)
        SELECT id, name FROM player
        """)
        
        # GameRecord 테이블 업데이트
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS game_record_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL,
            meeting_id INTEGER,
            date DATE NOT NULL,
            FOREIGN KEY (game_id) REFERENCES game (id),
            FOREIGN KEY (meeting_id) REFERENCES meeting (id)
        )
        """)
        
        cursor.execute("""
        INSERT INTO game_record_new (id, game_id, meeting_id, date)
        SELECT id, game_id, meeting_id, date_played FROM game_record
        """)
        
        # GameResult 테이블 업데이트
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS game_result_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_record_id INTEGER NOT NULL,
            player_id INTEGER,
            player_name VARCHAR(100),
            score INTEGER,
            is_winner BOOLEAN,
            FOREIGN KEY (game_record_id) REFERENCES game_record (id),
            FOREIGN KEY (player_id) REFERENCES player (id)
        )
        """)
        
        cursor.execute("""
        INSERT INTO game_result_new (id, game_record_id, player_id, score, is_winner)
        SELECT id, game_record_id, player_id, score, is_winner FROM game_result
        """)
        
        # 기존 테이블 삭제
        cursor.execute("DROP TABLE player")
        cursor.execute("DROP TABLE game_record")
        cursor.execute("DROP TABLE game_result")
        
        # 새 테이블 이름 변경
        cursor.execute("ALTER TABLE player_new RENAME TO player")
        cursor.execute("ALTER TABLE game_record_new RENAME TO game_record")
        cursor.execute("ALTER TABLE game_result_new RENAME TO game_result")
        
        # 트랜잭션 커밋
        conn.commit()
        print("마이그레이션 완료!")
        
    except Exception as e:
        # 오류 발생 시 롤백
        conn.rollback()
        print(f"마이그레이션 오류 발생: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()