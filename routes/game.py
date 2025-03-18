from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from models import db, Game, GameRecord, GameResult

game = Blueprint('game', __name__)

# API 엔드포인트: 게임 목록 조회
@game.route('/api/games', methods=['GET'])
def api_game_list():
    games = Game.query.all()
    result = []
    
    for game in games:
        result.append({
            'id': game.id,
            'name': game.name,
            'description': game.description
        })
    
    return jsonify(result)

# API 엔드포인트: 게임 상세 조회
@game.route('/api/games/<int:game_id>', methods=['GET'])
def api_game_detail(game_id):
    game = Game.query.get_or_404(game_id)
    game_records = GameRecord.query.filter_by(game_id=game_id).all()
    
    # 게임 기본 정보
    result = {
        'id': game.id,
        'name': game.name,
        'description': game.description,
        'total_plays': len(game_records),
        'total_players': 0,
        'win_rate': 0,
        'average_score': 0
    }
    
    # 플레이어별 승률 통계
    player_stats = {}
    total_score = 0
    total_results = 0
    
    for record in game_records:
        for result_obj in record.results:
            total_results += 1
            total_score += result_obj.score
            
            player_id = result_obj.player_id
            if player_id:  # 등록된 플레이어만 통계에 포함
                if player_id not in player_stats:
                    player_stats[player_id] = {
                        'player_id': player_id,
                        'player_name': result_obj.player.name if result_obj.player else "알 수 없음",
                        'wins': 0, 
                        'plays': 0
                    }
                
                player_stats[player_id]['plays'] += 1
                if result_obj.is_winner:
                    player_stats[player_id]['wins'] += 1
    
    # 통계 계산
    result['total_players'] = len(player_stats)
    result['average_score'] = round(total_score / total_results, 1) if total_results > 0 else 0
    
    # 승률 계산
    total_wins = 0
    for player_id, stats in player_stats.items():
        stats['win_rate'] = round((stats['wins'] / stats['plays']) * 100, 1) if stats['plays'] > 0 else 0
        total_wins += stats['wins']
    
    result['win_rate'] = round((total_wins / total_results) * 100, 1) if total_results > 0 else 0
    
    return jsonify(result)

# API 엔드포인트: 게임 추가
@game.route('/api/games', methods=['POST'])
def api_add_game():
    data = request.json
    
    if not data:
        return jsonify({'error': '데이터가 누락되었습니다.'}), 400
    
    name = data.get('name')
    description = data.get('description', '')
    
    if not name:
        return jsonify({'error': '게임 이름은 필수 입력 항목입니다.'}), 400
    
    game = Game(
        name=name,
        description=description
    )
    
    db.session.add(game)
    db.session.commit()
    
    return jsonify({
        'id': game.id,
        'name': game.name,
        'description': game.description,
        'message': '게임이 성공적으로 추가되었습니다.'
    }), 201

# API 엔드포인트: 게임 수정
@game.route('/api/games/<int:game_id>', methods=['PUT'])
def api_update_game(game_id):
    game = Game.query.get_or_404(game_id)
    data = request.json
    
    if not data:
        return jsonify({'error': '데이터가 누락되었습니다.'}), 400
    
    name = data.get('name')
    description = data.get('description', '')
    
    if not name:
        return jsonify({'error': '게임 이름은 필수 입력 항목입니다.'}), 400
    
    game.name = name
    game.description = description
    
    db.session.commit()
    
    return jsonify({
        'id': game.id,
        'name': game.name,
        'description': game.description,
        'message': '게임이 성공적으로 수정되었습니다.'
    })

@game.route('/games')
def game_list():
    games = Game.query.all()
    return render_template('game/list.html', games=games)

@game.route('/games/add', methods=['GET', 'POST'])
def add_game():
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')
        
        if not name:
            flash('게임 이름을 입력해주세요.', 'danger')
            return render_template('game/add.html')
        
        game = Game(
            name=name,
            description=description
        )
        db.session.add(game)
        db.session.commit()
        
        flash('게임이 추가되었습니다.', 'success')
        return redirect(url_for('game.game_list'))
    
    return render_template('game/add.html')

@game.route('/games/<int:game_id>')
def game_detail(game_id):
    game = Game.query.get_or_404(game_id)
    game_records = GameRecord.query.filter_by(game_id=game_id).all()
    
    # 게임 통계
    play_count = len(game_records)
    
    # 플레이어별 승률
    player_stats = {}
    for record in game_records:
        for result in record.results:
            if result.player_id not in player_stats:
                player_stats[result.player_id] = {'player': result.player, 'wins': 0, 'plays': 0}
            
            player_stats[result.player_id]['plays'] += 1
            if result.is_winner:
                player_stats[result.player_id]['wins'] += 1
    
    for stats in player_stats.values():
        stats['win_rate'] = (stats['wins'] / stats['plays']) * 100 if stats['plays'] > 0 else 0
    
    return render_template('game/detail.html', 
                          game=game, 
                          game_records=game_records, 
                          play_count=play_count, 
                          player_stats=player_stats.values())

@game.route('/games/<int:game_id>/edit', methods=['GET', 'POST'])
def edit_game(game_id):
    game = Game.query.get_or_404(game_id)
    
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')
        
        if not name:
            flash('게임 이름을 입력해주세요.', 'danger')
            return render_template('game/edit.html', game=game)
        
        game.name = name
        game.description = description
        
        db.session.commit()
        flash('게임 정보가 수정되었습니다.', 'success')
        return redirect(url_for('game.game_detail', game_id=game_id))
    
    return render_template('game/edit.html', game=game)

@game.route('/games/<int:game_id>/delete', methods=['POST'])
def delete_game(game_id):
    game = Game.query.get_or_404(game_id)
    
    # 게임 기록 삭제
    for record in GameRecord.query.filter_by(game_id=game_id).all():
        # 게임 결과 먼저 삭제
        GameResult.query.filter_by(game_record_id=record.id).delete()
        db.session.delete(record)
    
    # 게임 삭제
    db.session.delete(game)
    db.session.commit()
    
    flash('게임이 삭제되었습니다.', 'success')
    return redirect(url_for('game.game_list')) 