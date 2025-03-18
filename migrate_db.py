import sqlite3
import os
from datetime import datetime, timedelta
import random

# 데이터베이스 파일 경로
DB_FILE = 'instance/boardgame.db'

def migrate_database():
    print("데이터베이스 마이그레이션 시작...")
    
    # instance 디렉토리가 없으면 생성
    if not os.path.exists('instance'):
        os.makedirs('instance')
        print("instance 디렉토리를 생성했습니다.")
    
    # 파일이 존재하는지 확인
    if not os.path.exists(DB_FILE):
        print(f"오류: {DB_FILE} 파일이 존재하지 않습니다.")
        print("데이터베이스 파일을 생성합니다...")
        # 빈 데이터베이스 파일 생성
        conn = sqlite3.connect(DB_FILE)
        conn.close()
        print("데이터베이스 파일이 생성되었습니다.")
    
    # 데이터베이스 연결
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        print("데이터베이스 스키마 확인 중...")
        
        # 테이블 존재 여부 확인
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='meeting'")
        meeting_exists = cursor.fetchone() is not None

        if meeting_exists:
            # 테이블 스키마 확인 - host_id 컬럼 존재 여부
            cursor.execute("PRAGMA table_info(meeting)")
            columns = cursor.fetchall()
            column_names = [column[1] for column in columns]

            # host_id 컬럼이 없으면 추가
            if 'host_id' not in column_names:
                print("meeting 테이블에 host_id 컬럼이 없습니다. 추가합니다...")
                
                # 트랜잭션 시작
                conn.execute("BEGIN TRANSACTION")
                
                # 임시 테이블 생성
                cursor.execute("""
                CREATE TABLE meeting_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date DATE NOT NULL,
                    location TEXT NOT NULL,
                    description TEXT,
                    host_id INTEGER NOT NULL DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (host_id) REFERENCES player (id)
                )
                """)

                # 첫 번째 플레이어 ID를 가져와서 기본 호스트로 설정
                cursor.execute('SELECT id FROM player LIMIT 1')
                first_player = cursor.fetchone()
                default_host_id = first_player[0] if first_player else 1
                
                # 기존 데이터 복사
                cursor.execute("""
                INSERT INTO meeting_new (id, date, location, description, host_id, created_at)
                SELECT id, date, location, description, ?, COALESCE(created_at, CURRENT_TIMESTAMP)
                FROM meeting
                """, (default_host_id,))
                
                # 기존 테이블 삭제
                cursor.execute("DROP TABLE meeting")
                
                # 새 테이블 이름 변경
                cursor.execute("ALTER TABLE meeting_new RENAME TO meeting")
                
                # Meeting 테이블의 date 필드 형식 확인 및 수정
                cursor.execute('SELECT id, date FROM meeting')
                meetings = cursor.fetchall()
                
                for meeting in meetings:
                    meeting_id, date = meeting
                    if date and isinstance(date, str) and len(date.split('-')[0]) == 2:
                        # 날짜 형식 변환 (YY-MM-DD -> YYYY-MM-DD)
                        year = '20' + date.split('-')[0]
                        new_date = f"{year}-{date[3:]}"
                        cursor.execute('UPDATE meeting SET date = ? WHERE id = ?', (new_date, meeting_id))
                
                # 트랜잭션 커밋
                conn.commit()
                print("meeting 테이블 업데이트 완료!")
            else:
                print("meeting 테이블이 이미 최신 상태입니다.")
        else:
            print("meeting 테이블이 존재하지 않습니다. 새로 생성합니다...")
            # Meeting 테이블 생성
            cursor.execute('''
            CREATE TABLE meeting (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                location TEXT NOT NULL,
                description TEXT,
                host_id INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (host_id) REFERENCES player (id)
            )
            ''')
            print("meeting 테이블을 생성했습니다.")
        
        # 그 외 필요한 테이블 확인 및 생성
        # MeetingParticipant 테이블 확인
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='meeting_participant'")
        if not cursor.fetchone():
            print("meeting_participant 테이블이 없습니다. 생성합니다...")
            cursor.execute('''
            CREATE TABLE meeting_participant (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meeting_id INTEGER NOT NULL,
                player_id INTEGER NOT NULL,
                arrival_time TIME NOT NULL DEFAULT '00:00',
                status TEXT NOT NULL DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (meeting_id) REFERENCES meeting (id),
                FOREIGN KEY (player_id) REFERENCES player (id)
            )
            ''')
            print("meeting_participant 테이블을 생성했습니다.")
        
        # MeetingPlannedGames 테이블 확인
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='meeting_planned_games'")
        if not cursor.fetchone():
            print("meeting_planned_games 테이블이 없습니다. 생성합니다...")
            cursor.execute('''
            CREATE TABLE meeting_planned_games (
                meeting_id INTEGER NOT NULL,
                game_id INTEGER NOT NULL,
                PRIMARY KEY (meeting_id, game_id),
                FOREIGN KEY (meeting_id) REFERENCES meeting (id),
                FOREIGN KEY (game_id) REFERENCES game (id)
            )
            ''')
            print("meeting_planned_games 테이블을 생성했습니다.")
        
        print("데이터베이스 마이그레이션 완료!")
        
    except Exception as e:
        # 오류 발생 시 롤백
        conn.rollback()
        print(f"마이그레이션 오류 발생: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()