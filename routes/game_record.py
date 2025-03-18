from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify, make_response
from models import db, GameRecord, GameResult, Game, Player, Meeting
from datetime import datetime, date

game_record = Blueprint('game_record', __name__)

# CORS 유틸리티 함수
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def create_cors_preflight_response():
    response = make_response()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# 템플릿 경로 상수 정의
GAME_RECORD_ADD_TEMPLATE = 'game_record/add_standalone.html'

@game_record.route('/game_records/add', methods=['GET', 'POST'])
def add_game_record():
    games = Game.query.all()
    players = Player.query.all()
    
    if request.method == 'POST':
        game_id = request.form.get('game_id')
        record_date = request.form.get('date')
        
        # 날짜 확인
        if not record_date:
            flash('날짜를 입력해주세요.', 'danger')
            return render_template(GAME_RECORD_ADD_TEMPLATE, games=games, players=players, today=date.today())
        
        # 게임 처리 (기존 게임 또는 새 게임)
        # 새 게임 처리
        new_game_name = request.form.get('new_game_name', '').strip()
        if not game_id and new_game_name:
            new_min_players = int(request.form.get('new_game_min_players', 1))
            new_max_players = int(request.form.get('new_game_max_players', 4))
            new_game_description = request.form.get('new_game_description', '').strip()
            
            new_game = Game(
                name=new_game_name,
                min_players=new_min_players,
                max_players=new_max_players,
                description=new_game_description
            )
            db.session.add(new_game)
            db.session.flush()  # ID 할당을 위해 flush
            game_id = new_game.id
            flash(f'"{new_game_name}" 게임이 추가되었습니다.', 'success')
        elif not game_id and not new_game_name:
            flash('게임을 선택하거나 새 게임 정보를 입력해주세요.', 'danger')
            return render_template(GAME_RECORD_ADD_TEMPLATE, games=games, players=players, today=date.today())
            
        # 모임 처리
        meeting_id = None
        meeting_location = request.form.get('meeting_location', '').strip()
        if meeting_location:
            meeting_description = request.form.get('meeting_description', '').strip()
            meeting_date = datetime.strptime(record_date, '%Y-%m-%d').date()
            
            # 새 모임 생성
            new_meeting = Meeting(
                date=meeting_date,
                location=meeting_location,
                description=meeting_description
            )
            db.session.add(new_meeting)
            db.session.flush()  # ID 할당을 위해 flush
            meeting_id = new_meeting.id
            flash(f'"{meeting_location}" 모임이 추가되었습니다.', 'success')
            
        # 새 게임 기록 생성
        game_record = GameRecord(
            game_id=game_id,
            meeting_id=meeting_id
        )
        db.session.add(game_record)
        db.session.flush()  # ID 할당을 위해 flush
        
        # 등록된 플레이어 결과 처리
        registered_players = request.form.getlist('player_id')
        registered_scores = request.form.getlist('player_score')
        registered_winners = request.form.getlist('player_winner')
        
        for i, player_id in enumerate(registered_players):
            if player_id:  # 플레이어가 선택된 경우에만
                score = registered_scores[i] if registered_scores[i] else None
                is_winner = True if str(i) in registered_winners else False
                
                result = GameResult(
                    game_record_id=game_record.id,
                    player_id=player_id,
                    score=score,
                    is_winner=is_winner
                )
                db.session.add(result)
        
        # 미등록 플레이어 결과 처리
        unregistered_names = request.form.getlist('unregistered_name')
        unregistered_scores = request.form.getlist('unregistered_score')
        unregistered_winners = request.form.getlist('unregistered_winner')
        
        for i, name in enumerate(unregistered_names):
            if name.strip():  # 이름이 있는 경우에만
                score = unregistered_scores[i] if unregistered_scores[i] else None
                is_winner = True if str(i) in unregistered_winners else False
                
                result = GameResult(
                    game_record_id=game_record.id,
                    player_id=None,
                    player_name=name.strip(),
                    score=score,
                    is_winner=is_winner
                )
                db.session.add(result)
        
        db.session.commit()
        flash('게임 기록이 추가되었습니다.', 'success')
        
        # 모임이 있으면 모임 상세 페이지로, 없으면 게임 목록으로
        if meeting_id:
            return redirect(url_for('meeting.meeting_detail', meeting_id=meeting_id))
        else:
            return redirect(url_for('game.game_list'))
    
    return render_template(GAME_RECORD_ADD_TEMPLATE, games=games, players=players, today=date.today())

# API 엔드포인트: 독립형 게임 기록 추가 (모임 없이)
@game_record.route('/api/game-records', methods=['POST', 'OPTIONS'])
def api_add_standalone_game_record():
    if request.method == 'OPTIONS':
        return create_cors_preflight_response()
    
    data = request.json
    
    # 필수 데이터 확인
    if not data or 'game_id' not in data or 'date' not in data or 'results' not in data:
        response = make_response(jsonify({'error': '필수 데이터가 누락되었습니다.'}), 400)
        return add_cors_headers(response)
    
    try:
        game_id = data['game_id']
        record_date = data['date']
        results = data['results']
        
        # 날짜 확인 및 변환
        try:
            parsed_date = datetime.strptime(record_date, '%Y-%m-%d').date()
        except ValueError:
            response = make_response(jsonify({'error': '날짜 형식이 올바르지 않습니다.'}), 400)
            return add_cors_headers(response)
        
        # 게임 존재 확인
        game = Game.query.get(game_id)
        if not game:
            response = make_response(jsonify({'error': '존재하지 않는 게임입니다.'}), 404)
            return add_cors_headers(response)
        
        # 최소 한 명 이상의 결과 확인
        if not results or len(results) == 0:
            response = make_response(jsonify({'error': '최소 한 명 이상의 플레이어를 추가해야 합니다.'}), 400)
            return add_cors_headers(response)
        
        # 새 게임 기록 생성 (모임 없이)
        game_record = GameRecord(
            game_id=game_id,
            meeting_id=None  # 모임 없음
        )
        db.session.add(game_record)
        db.session.flush()  # ID 할당을 위해 flush
        
        # 게임 결과 처리
        result_ids = []
        for result_data in results:
            # 등록된 플레이어 또는 미등록 플레이어 처리
            player_id = result_data.get('player_id')
            player_name = result_data.get('player_name')
            score = result_data.get('score', 0)
            is_winner = result_data.get('is_winner', False)
            
            # 등록된 플레이어인 경우 player_id 확인
            if player_id:
                player = Player.query.get(player_id)
                if not player:
                    response = make_response(jsonify({'error': f'존재하지 않는 플레이어 ID: {player_id}'}), 404)
                    return add_cors_headers(response)
            
            # 결과 저장
            result = GameResult(
                game_record_id=game_record.id,
                player_id=player_id,
                player_name=player_name if not player_id and player_name else None,
                score=score,
                is_winner=is_winner
            )
            db.session.add(result)
            db.session.flush()
            result_ids.append(result.id)
        
        db.session.commit()
        
        # 성공 응답
        response_data = {
            'id': game_record.id,
            'game_id': game_record.game_id,
            'date': record_date,
            'result_ids': result_ids,
            'message': '게임 기록이 성공적으로 추가되었습니다.'
        }
        
        response = make_response(jsonify(response_data), 201)
        return add_cors_headers(response)
    
    except Exception as e:
        # 오류 발생 시 롤백
        db.session.rollback()
        
        # 오류 응답
        response = make_response(jsonify({'error': f'게임 기록 저장 중 오류가 발생했습니다: {str(e)}'}), 500)
        return add_cors_headers(response)