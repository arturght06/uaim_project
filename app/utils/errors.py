from flask import jsonify


def handle_not_found(item: str):
    response = jsonify({'error': f'{item.capitalize()} not found'})
    response.status_code = 404
    return response


def handle_server_error():
    response = jsonify({'error': "Server error"})
    response.status_code = 500
    return response


def handle_creation_error():
    response = jsonify({'error': "Creation error"})
    response.status_code = 500
    return response
