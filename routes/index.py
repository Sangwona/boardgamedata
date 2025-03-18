from flask import Blueprint, render_template, jsonify
from models import db, Player, Game, GameRecord, GameResult, Meeting
from datetime import datetime
from sqlalchemy import func, extract, case, desc

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
    # 1. 가장 많이 플레이된 게임
    popular_games = db.session.query(
        Game.id, Game.name, db.func.count(GameRecord.id).label('play_count')
    ).join(GameRecord).group_by(Game.id).order_by(db.func.count(GameRecord.id).desc()).limit(10).all()
    
    # 2. 가장 많이 이긴 플레이어
    top_winners = db.session.query(
        Player.id,
        Player.name,
        db.func.sum(case((GameResult.is_winner, 1), else_=0)).label('wins'),
        db.func.count(GameResult.id).label('plays')
    ).join(GameResult).group_by(Player.id).having(db.func.count(GameResult.id) >= 1).order_by(desc('wins')).limit(10).all()
    
    winners_data = []
    for player in top_winners:
        win_rate = (player.wins / player.plays) * 100 if player.plays > 0 else 0
        winners_data.append({
            'id': player.id,
            'name': player.name,
            'win_rate': round(win_rate, 1),
            'wins': player.wins,
            'plays': player.plays
        })
    
    # 3. 가장 참여를 많이 한 플레이어
    active_players = db.session.query(
        Player.id,
        Player.name,
        db.func.count(db.distinct(GameRecord.meeting_id)).label('meeting_count')
    ).join(
        GameResult, Player.id == GameResult.player_id
    ).join(
        GameRecord, GameResult.game_record_id == GameRecord.id
    ).group_by(Player.id).order_by(desc('meeting_count')).limit(10).all()
    
    active_players_data = []
    for player in active_players:
        active_players_data.append({
            'id': player.id,
            'name': player.name,
            'meeting_count': player.meeting_count
        })
    
    # 플레이어 수별 게임 통계 (유지)
    player_count_stats = db.session.query(
        func.count(GameResult.id).label('player_count'),
        func.count(GameRecord.id).label('game_count')
    ).join(
        GameRecord, GameResult.game_record_id == GameRecord.id
    ).group_by(GameRecord.id).all()
    
    # 플레이어 수별 데이터 구성
    player_counts = {2: 0, 3: 0, 4: 0, 5: 0, '6+': 0}
    for stat in player_count_stats:
        count = stat.player_count
        if count <= 5:
            player_counts[count] = player_counts.get(count, 0) + 1
        else:
            player_counts['6+'] = player_counts.get('6+', 0) + 1
    
    # 최종 통계 데이터
    return jsonify({
        'popular_games': [{'id': g.id, 'name': g.name, 'count': g.play_count} for g in popular_games],
        'top_winners': winners_data,
        'active_players': active_players_data,
        'player_counts': {
            'labels': list(map(str, player_counts.keys())),
            'data': list(player_counts.values())
        }
    })

@index.route('/api/stats/player/<int:player_id>', methods=['GET'])
def get_player_stats(player_id):
    # 플레이어 확인
    player = Player.query.get_or_404(player_id)
    
    # 플레이어가 많이 한 게임 및 이긴 게임
    player_games = db.session.query(
        Game.id,
        Game.name,
        db.func.count(GameResult.id).label('plays'),
        db.func.sum(case((GameResult.is_winner, 1), else_=0)).label('wins')
    ).join(
        GameRecord, Game.id == GameRecord.game_id
    ).join(
        GameResult, GameRecord.id == GameResult.game_record_id
    ).filter(
        GameResult.player_id == player_id
    ).group_by(Game.id).all()
    
    games_data = []
    total_plays = 0
    total_wins = 0
    
    for game in player_games:
        win_rate = (game.wins / game.plays) * 100 if game.plays > 0 else 0
        games_data.append({
            'id': game.id,
            'name': game.name,
            'plays': game.plays,
            'wins': game.wins,
            'win_rate': round(win_rate, 1)
        })
        total_plays += game.plays
        total_wins += game.wins
    
    # 최다 플레이 게임 순으로 정렬
    most_played_games = sorted(games_data, key=lambda x: x['plays'], reverse=True)
    
    # 전체 승률
    total_win_rate = (total_wins / total_plays) * 100 if total_plays > 0 else 0
    
    return jsonify({
        'most_played_games': most_played_games,
        'total_plays': total_plays,
        'total_wins': total_wins,
        'win_rate': round(total_win_rate, 1)
    })