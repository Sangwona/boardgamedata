from flask import Blueprint, jsonify, request
from models import db, Meeting, GameRecord, GameResult, Player, Game, MeetingParticipant
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

meeting = Blueprint('meeting', __name__)

# API 엔드포인트: 모임 목록 조회
@meeting.route('/api/meetings', methods=['GET'])
def api_meeting_list():
    try:
        logger.debug("Fetching all meetings")
        meetings = Meeting.query.order_by(Meeting.date.desc()).all()
        result = []
        
        for m in meetings:
            try:
                # 게임 기록 수 계산
                game_count = GameRecord.query.filter_by(meeting_id=m.id).count()
                
                # 참가자 수 계산
                participant_count = MeetingParticipant.query.filter_by(
                    meeting_id=m.id,
                    status='confirmed'
                ).count()
                
                host_info = None
                if m.host_id and m.host:
                    host_info = {
                        'id': m.host.id,
                        'name': m.host.name
                    }
                
                result.append({
                    'id': m.id,
                    'date': m.date.strftime('%Y-%m-%d') if m.date else None,
                    'location': m.location,
                    'description': m.description,
                    'host_id': m.host_id,
                    'host': host_info,
                    'game_count': game_count,
                    'participant_count': participant_count,
                    'unregistered_count': 0,
                    'planned_games': [{
                        'id': game.id,
                        'name': game.name
                    } for game in m.planned_games] if hasattr(m, 'planned_games') else []
                })
            except Exception as e:
                logger.error(f"Error processing meeting {m.id}: {str(e)}")
                # 오류가 발생한 미팅은 건너뛰기
                continue
        
        logger.debug(f"Successfully fetched {len(result)} meetings")
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in api_meeting_list: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# API 엔드포인트: 모임 추가
@meeting.route('/api/meetings', methods=['POST'])
def api_add_meeting():
    data = request.get_json()
    
    # 필수 필드 검증
    if not all(k in data for k in ['date', 'location', 'host_id']):
        return jsonify({'error': '필수 필드가 누락되었습니다.'}), 400
    
    # 날짜 형식 변환
    try:
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': '잘못된 날짜 형식입니다.'}), 400
    
    # 호스트 확인
    host = Player.query.get(data['host_id'])
    if not host:
        return jsonify({'error': '존재하지 않는 호스트입니다.'}), 404
    
    # 모임 생성
    meeting = Meeting(
        date=date,
        location=data['location'],
        description=data.get('description'),
        host_id=data['host_id']
    )
    
    # 예정 게임 추가
    if 'planned_games' in data:
        for game_id in data['planned_games']:
            game = Game.query.get(game_id)
            if game:
                meeting.planned_games.append(game)
    
    db.session.add(meeting)
    db.session.commit()
    
    return jsonify({
        'id': meeting.id,
        'date': meeting.date.strftime('%Y-%m-%d'),
        'location': meeting.location,
        'description': meeting.description,
        'host': {
            'id': meeting.host.id,
            'name': meeting.host.name
        }
    })

# API 엔드포인트: 단일 모임 조회
@meeting.route('/api/meetings/<int:meeting_id>', methods=['GET'])
def api_meeting_detail(meeting_id):
    meeting = Meeting.query.get_or_404(meeting_id)
    
    # 게임 기록 조회
    game_records = GameRecord.query.filter_by(meeting_id=meeting_id).all()
    
    # 참가자 목록 조회
    participants = MeetingParticipant.query.filter_by(meeting_id=meeting_id).all()
    
    result = {
        'id': meeting.id,
        'date': meeting.date.strftime('%Y-%m-%d'),
        'location': meeting.location,
        'description': meeting.description,
        'host': {
            'id': meeting.host.id,
            'name': meeting.host.name
        },
        'participants': [{
            'id': p.player.id,
            'name': p.player.name,
            'arrival_time': p.arrival_time.strftime('%H:%M'),
            'status': p.status
        } for p in participants],
        'planned_games': [{
            'id': game.id,
            'name': game.name
        } for game in meeting.planned_games],
        'games': []
    }
    
    # 게임 기록 추가
    for record in game_records:
        game_results = GameResult.query.filter_by(game_record_id=record.id).all()
        result['games'].append({
            'id': record.id,
            'name': record.game.name,
            'results': [{
                'id': result.id,
                'player': {
                    'id': result.player.id if result.player.registered else None,
                    'name': result.player.name
                },
                'score': result.score,
                'is_winner': result.is_winner
            } for result in game_results]
        })
    
    return jsonify(result)

@meeting.route('/api/meetings/<int:meeting_id>/participants', methods=['POST'])
def api_add_participant(meeting_id):
    data = request.get_json()
    
    if not all(k in data for k in ['player_id', 'arrival_time']):
        return jsonify({'error': '필수 필드가 누락되었습니다.'}), 400
    
    # 모임 확인
    meeting = Meeting.query.get_or_404(meeting_id)
    
    # 플레이어 확인
    player = Player.query.get_or_404(data['player_id'])
    
    # 참여 시간 형식 변환
    try:
        arrival_time = datetime.strptime(data['arrival_time'], '%H:%M').time()
    except ValueError:
        return jsonify({'error': '잘못된 시간 형식입니다.'}), 400
    
    # 참가자 추가 또는 업데이트
    participant = MeetingParticipant.query.filter_by(
        meeting_id=meeting_id,
        player_id=data['player_id']
    ).first()
    
    if participant:
        participant.arrival_time = arrival_time
        participant.status = data.get('status', 'confirmed')
    else:
        participant = MeetingParticipant(
            meeting_id=meeting_id,
            player_id=data['player_id'],
            arrival_time=arrival_time,
            status=data.get('status', 'confirmed')
        )
        db.session.add(participant)
    
    db.session.commit()
    
    return jsonify({
        'id': participant.id,
        'player': {
            'id': player.id,
            'name': player.name
        },
        'arrival_time': participant.arrival_time.strftime('%H:%M'),
        'status': participant.status
    })