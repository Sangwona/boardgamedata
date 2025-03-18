from flask import make_response

# CORS 응답 헤더를 추가하는 유틸리티 함수
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Access-Control-Allow-Origin,Accept,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# OPTIONS 요청에 대한 응답을 생성하는 유틸리티 함수
def create_cors_preflight_response():
    response = make_response()
    add_cors_headers(response)
    return response, 204