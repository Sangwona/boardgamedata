from flask import Blueprint, jsonify, request, make_response
from models import db, Meeting, GameRecord, GameResult, Player, Game
from utils import add_cors_headers, create_cors_preflight_response
from datetime import datetime

meeting = Blueprint('meeting', __name__)

# API 엔드포인트: 모임 목록 조회
@meeting.route('/api/meetings', methods=['GET', 'OPTIONS'])
def api_meeting_list():
    if request.method == 'OPTIONS':
        return create_cors_preflight_response()
        
    meetings = Meeting.query.order_by(Meeting.date.desc()).all()
    result = []
    
    for meeting in meetings:
        # 등록된 참가자 수 계산
        participants = db.session.query(GameResult.player_id).join(
            GameRecord, GameResult.game_record_id == GameRecord.id
        ).filter(
            GameRecord.meeting_id == meeting.id,
            GameResult.player_id != None
        ).distinct().count()
        
        # 미등록 참가자 수 계산
        unregistered = db.session.query(GameResult.player_name).join(
            GameRecord, GameResult.game_record_id == GameRecord.id
        ).filter(
            GameRecord.meeting_id == meeting.id,
            GameResult.player_id == None,
            GameResult.player_name != None
        ).distinct().count()
        
        result.append({
            'id': meeting.id,
            'date': meeting.date,
            'location': meeting.location,
            'description': meeting.description,
            'participants_count': participants,
            'unregistered_count': unregistered
        })
    
    response = make_response(jsonify(result))
    return add_cors_headers(response)

# API 엔드포인트: 모임 추가
@meeting.route('/api/meetings', methods=['POST', 'OPTIONS'])
def api_add_meeting():
    if request.method == 'OPTIONS':
        return create_cors_preflight_response()
        
    data = request.json
    
    if not data:
        return jsonify({'error': '데이터가 누락되었습니다.'}), 400
    
    date = data.get('date')
    location = data.get('location')
    description = data.get('description', '')
    
    if not date or not location:
        return jsonify({'error': '날짜와 장소는 필수 입력 항목입니다.'}), 400
    
    meeting = Meeting(
        date=date,
        location=location,
        description=description
    )
    
    db.session.add(meeting)
    db.session.commit()
    
    response = make_response(jsonify({
        'id': meeting.id,
        'date': meeting.date,
        'location': meeting.location,
        'description': meeting.description,
        'message': '모임이 성공적으로 추가되었습니다.'
    }))
    return add_cors_headers(response), 201

# API 엔드포인트: 단일 모임 조회
@meeting.route('/api/meetings/<int:meeting_id>', methods=['GET', 'OPTIONS'])
def api_meeting_detail(meeting_id):
    if request.method == 'OPTIONS':
        return create_cors_preflight_response()
        
    meeting = Meeting.query.get_or_404(meeting_id)
    
    # 게임 기록 조회
    game_records = GameRecord.query.filter_by(meeting_id=meeting_id).all()
    
    # 게임 결과 조회
    game_results = []
    for record in game_records:
        results = GameResult.query.filter_by(game_record_id=record.id).all()
        game_results.extend(results)
    
    # 참가자 목록 (등록된 플레이어)
    registered_players = db.session.query(Player).join(
        GameResult, GameResult.player_id == Player.id
    ).join(
        GameRecord, GameResult.game_record_id == GameRecord.id
    ).filter(
        GameRecord.meeting_id == meeting_id
    ).distinct().all()
    
    # 등록되지 않은 참가자 이름 목록
    unregistered_players = db.session.query(GameResult.player_name).join(
        GameRecord, GameResult.game_record_id == GameRecord.id
    ).filter(
        GameRecord.meeting_id == meeting_id,
        GameResult.player_id == None,
        GameResult.player_name != None
    ).distinct().all()
    
    # 게임 목록
    games = db.session.query(Game).join(
        GameRecord, GameRecord.game_id == Game.id
    ).filter(
        GameRecord.meeting_id == meeting_id
    ).distinct().all()
    
    # 결과 데이터 구성
    games_data = []
    for game in games:
        # 해당 게임의 결과
        results = []
        
        # 해당 게임의 결과 필터링
        game_records_filtered = [r for r in game_records if r.game_id == game.id]
        for record in game_records_filtered:
            # 해당 게임 기록의 결과들 
            record_results = [r for r in game_results if r.game_record_id == record.id]
            
            for result in record_results:
                player_info = {}
                if result.player_id:
                    player = next((p for p in registered_players if p.id == result.player_id), None)
                    if player:
                        player_info = {
                            'id': player.id,
                            'name': player.name,
                            'registered': True
                        }
                else:
                    player_info = {
                        'id': None,
                        'name': result.player_name,
                        'registered': False
                    }
                
                results.append({
                    'id': result.id,
                    'player': player_info,
                    'score': result.score,
                    'is_winner': result.is_winner
                })
        
        games_data.append({
            'id': game.id,
            'name': game.name,
            'results': results
        })
    
    # 참가자 데이터 구성
    participants = []
    for player in registered_players:
        participants.append({
            'id': player.id,
            'name': player.name,
            'registered': True
        })
    
    for player_name in unregistered_players:
        participants.append({
            'id': None,
            'name': player_name[0],
            'registered': False
        })
    
    response = make_response(jsonify({
        'id': meeting.id,
        'date': meeting.date,
        'location': meeting.location,
        'description': meeting.description,
        'participants': participants,
        'games': games_data
    }))
    return add_cors_headers(response)