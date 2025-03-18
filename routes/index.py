from flask import Blueprint, render_template, jsonify
from models import db, Player, Game, GameRecord, GameResult, Meeting

index = Blueprint('index', __name__)

@index.route('/')
def home():
    meetings = Meeting.query.order_by(Meeting.date.desc()).limit(5).all()
    games = Game.query.all()
    players = Player.query.all()
    
    # 게임 통계
    popular_games = db.session.query(
        Game.id, Game.name, db.func.count(GameRecord.id).label('play_count')
    ).join(GameRecord).group_by(Game.id).order_by(db.func.count(GameRecord.id).desc()).limit(5).all()
    
    return render_template('index.html', 
                          meetings=meetings, 
                          games=games, 
                          players=players, 
                          popular_games=popular_games)

@index.route('/api/stats', methods=['GET'])
def get_stats():
    # 가장 인기 있는 게임
    popular_games = db.session.query(
        Game.id, Game.name, db.func.count(GameRecord.id).label('play_count')
    ).join(GameRecord).group_by(Game.id).order_by(db.func.count(GameRecord.id).desc()).limit(5).all()
    
    # 승률이 가장 높은 플레이어
    top_winners = db.session.query(
        Player.name,
        db.func.sum(db.case([(GameResult.is_winner, 1)], else_=0)).label('wins'),
        db.func.count(GameResult.id).label('plays')
    ).join(GameResult).group_by(Player.id).having(db.func.count(GameResult.id) >= 5).all()
    
    top_win_rates = []
    for player in top_winners:
        win_rate = (player.wins / player.plays) * 100
        top_win_rates.append({
            'name': player.name,
            'win_rate': win_rate,
            'wins': player.wins,
            'plays': player.plays
        })
    
    top_win_rates = sorted(top_win_rates, key=lambda x: x['win_rate'], reverse=True)[:5]
    
    return jsonify({
        'popular_games': [{'id': g.id, 'name': g.name, 'count': g.play_count} for g in popular_games],
        'top_winners': top_win_rates
    })