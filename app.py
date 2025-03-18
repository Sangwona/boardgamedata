from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from models import db, Player, Meeting, Game, GameRecord, GameResult
from routes import game, player, meeting, game_record, index
from utils import add_cors_headers

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///boardgame.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS 설정 강화
CORS(app, resources={r"/api/*": {"origins": "*", 
                                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                                "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]}},
     supports_credentials=True)

db.init_app(app)

# 블루프린트 등록
app.register_blueprint(index.index)
app.register_blueprint(player.player)
app.register_blueprint(meeting.meeting)
app.register_blueprint(game.game)
app.register_blueprint(game_record.game_record)

@app.before_request
def before_request():
    # 프리플라이트 요청 처리
    if request.method == "OPTIONS":
        response = make_response()
        add_cors_headers(response)
        return response

@app.route('/api/status', methods=['GET', 'OPTIONS'])
def api_status():
    if request.method == 'OPTIONS':
        response = make_response()
        add_cors_headers(response)
        return response, 204
    
    data = {
        'status': 'online',
        'version': '1.0.0',
        'message': 'API 서버가 정상적으로 실행 중입니다.'
    }
    
    response = make_response(jsonify(data))
    add_cors_headers(response)
    return response

# 404 에러 핸들러
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': '요청한 리소스를 찾을 수 없습니다.'}), 404

# 500 에러 핸들러
@app.errorhandler(500)
def server_error(error):
    app.logger.error(f'서버 오류: {error}')
    return jsonify({'error': '서버 내부 오류가 발생했습니다.'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5005)
