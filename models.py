from flask_sqlalchemy import SQLAlchemy

# 데이터베이스 인스턴스 생성
db = SQLAlchemy()

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    birth_year = db.Column(db.Integer, nullable=True)
    mbti = db.Column(db.String(4), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    
    results = db.relationship('GameResult', backref=db.backref('player'), lazy=True, foreign_keys='GameResult.player_id')

# 모임 모델
class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(8), nullable=False)  # YY-MM-DD 형식
    location = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    
    # 관계 설정
    game_records = db.relationship('GameRecord', backref='meeting', lazy=True)
    
    def __repr__(self):
        return f'<Meeting {self.date} at {self.location}>'

# 게임 모델
class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    min_players = db.Column(db.Integer, default=2)
    max_players = db.Column(db.Integer, default=4)
    description = db.Column(db.String(500), nullable=True)
    
    # 관계 설정
    game_records = db.relationship('GameRecord', backref='game', lazy=True)
    
    def __repr__(self):
        return f'<Game {self.name}>'

# 게임 기록 모델
class GameRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meeting.id'), nullable=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    
    # 관계 설정
    results = db.relationship('GameResult', backref='game_record', cascade='all, delete-orphan', lazy=True)
    
    def __repr__(self):
        return f'<GameRecord {self.id}>'

# 게임 결과 모델
class GameResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_record_id = db.Column(db.Integer, db.ForeignKey('game_record.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=True)
    player_name = db.Column(db.String(100), nullable=True)  # 미등록 플레이어용
    score = db.Column(db.Integer, default=0)
    is_winner = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        if self.player:
            player_info = f'Player: {self.player.name}'
        else:
            player_info = f'Unregistered: {self.player_name}'
        return f'<GameResult {self.id}, {player_info}, Score: {self.score}, Winner: {self.is_winner}>'