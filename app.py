from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from models import db, Player, Meeting, Game, GameRecord, GameResult
from routes import game, player, meeting, game_record, index
from utils import add_cors_headers, create_cors_preflight_response
import logging

# 로깅 설정
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///boardgame.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS 설정 - 기본 설정 적용
CORS(app, resources={r"/*": {"origins": "*"}})

# 모든 응답에 CORS 헤더 추가
@app.after_request
def after_request(response):
    logger.debug(f"Applying CORS headers to response for: {request.path}")
    return add_cors_headers(response)

# OPTIONS 요청에 대한 전역 핸들러
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    logger.debug(f"OPTIONS request received for path: {path}")
    return create_cors_preflight_response()

# API 요청 로깅
@app.before_request
def log_request():
    logger.debug(f"Request received: {request.method} {request.path}")
    logger.debug(f"Request headers: {request.headers}")
    if request.method in ['POST', 'PUT'] and request.is_json:
        logger.debug(f"Request body: {request.get_json()}")

db.init_app(app)

# 블루프린트 등록
app.register_blueprint(index.index)
app.register_blueprint(player.player)
app.register_blueprint(meeting.meeting)
app.register_blueprint(game.game)
app.register_blueprint(game_record.game_record)

# 404 에러 핸들러
@app.errorhandler(404)
def not_found(error):
    logger.error(f"404 error: {request.path}")
    return jsonify({'error': '요청한 리소스를 찾을 수 없습니다.'}), 404

# 500 에러 핸들러
@app.errorhandler(500)
def server_error(error):
    logger.error(f"500 error: {error}")
    return jsonify({'error': '서버 내부 오류가 발생했습니다.'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5005, host='0.0.0.0')
