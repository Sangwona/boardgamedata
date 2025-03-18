from flask import Blueprint, request, jsonify, make_response
from models import Player, GameResult, GameRecord, db
from utils import create_cors_preflight_response, add_cors_headers

player = Blueprint('player', __name__)

# API 엔드포인트: 플레이어 목록 조회
@player.route('/api/players', methods=['GET', 'OPTIONS'])
def api_player_list():
    if request.method == 'OPTIONS':
        return create_cors_preflight_response()
        
    players = Player.query.all()
    result = []
    for player in players:
        result.append({
            'id': player.id,
            'name': player.name,
            'birth_year': player.birth_year,
            'mbti': player.mbti,
            'location': player.location
        })
    
    return jsonify(result)

# API 엔드포인트: 단일 플레이어 조회
@player.route('/api/players/<int:player_id>', methods=['GET', 'OPTIONS'])
def api_player_detail(player_id):
    if request.method == "OPTIONS":
        return create_cors_preflight_response()
        
    player = Player.query.get_or_404(player_id)
    
    # 플레이어의 게임 기록 조회 - GameRecord 테이블과 조인하여 관련 정보 가져오기
    game_results = db.session.query(
        GameResult, GameRecord
    ).join(
        GameRecord, GameResult.game_record_id == GameRecord.id
    ).filter(
        GameResult.player_id == player_id
    ).all()
    
    game_history = []
    
    for result, record in game_results:
        game_history.append({
            'id': result.id,
            'game_id': record.game_id,
            'game_name': record.game.name if record.game else None,
            'score': result.score,
            'is_winner': result.is_winner,
            'meeting_id': record.meeting_id,
            'meeting_date': record.meeting.date.strftime('%Y-%m-%d') if record.meeting else None,
            'meeting_location': record.meeting.location if record.meeting else None
        })
    
    return jsonify({
        'id': player.id,
        'name': player.name,
        'birth_year': player.birth_year,
        'mbti': player.mbti,
        'location': player.location,
        'game_history': game_history
    })

# API 엔드포인트: 플레이어 추가
@player.route('/api/players', methods=['POST', 'OPTIONS'])
def api_add_player():
    if request.method == "OPTIONS":
        return create_cors_preflight_response()
        
    data = request.json
    
    if not data:
        return jsonify({'error': '데이터가 누락되었습니다.'}), 400
    
    name = data.get('name')
    birth_year = data.get('birth_year')
    mbti = data.get('mbti')
    location = data.get('location')
    
    if not name:
        return jsonify({'error': '이름은 필수 입력 항목입니다.'}), 400
    
    player = Player(
        name=name,
        birth_year=birth_year,
        mbti=mbti,
        location=location
    )
    
    db.session.add(player)
    db.session.commit()
    
    return jsonify({
        'id': player.id,
        'name': player.name,
        'birth_year': player.birth_year,
        'mbti': player.mbti,
        'location': player.location,
        'message': '플레이어가 성공적으로 추가되었습니다.'
    }), 201

# API 엔드포인트: 플레이어 수정
@player.route('/api/players/<int:player_id>', methods=['PUT', 'OPTIONS'])
def api_edit_player(player_id):
    if request.method == "OPTIONS":
        return create_cors_preflight_response()
        
    player = Player.query.get_or_404(player_id)
    data = request.json
    
    if not data:
        return jsonify({'error': '데이터가 누락되었습니다.'}), 400
    
    name = data.get('name')
    birth_year_2digit = data.get('birth_year')
    mbti = data.get('mbti')
    location = data.get('location')
    
    # 필수 필드 유효성 검사
    if not name or birth_year_2digit is None or not mbti or not location:
        return jsonify({'error': '모든 필드를 입력해주세요.'}), 400
    
    # 2자리 출생년도를 4자리로 변환
    if birth_year_2digit is not None:
        # 20보다 크면 1900년대, 작으면 2000년대로 가정
        prefix = 1900 if birth_year_2digit > 20 else 2000
        birth_year = prefix + birth_year_2digit
    else:
        birth_year = None
    
    player.name = name
    player.birth_year = birth_year
    player.mbti = mbti
    player.location = location
    
    db.session.commit()
    
    return jsonify({
        'id': player.id,
        'name': player.name,
        'birth_year': player.birth_year,
        'mbti': player.mbti,
        'location': player.location,
        'message': '플레이어 정보가 수정되었습니다.'
    })

# API 엔드포인트: 플레이어 삭제
@player.route('/api/players/<int:player_id>', methods=['DELETE', 'OPTIONS'])
def api_delete_player(player_id):
    if request.method == "OPTIONS":
        return create_cors_preflight_response()
        
    player = Player.query.get_or_404(player_id)
    
    # 플레이어와 관련된 게임 결과 삭제
    GameResult.query.filter_by(player_id=player_id).delete()
    
    db.session.delete(player)
    db.session.commit()
    
    return jsonify({'message': '플레이어가 삭제되었습니다.'}), 200