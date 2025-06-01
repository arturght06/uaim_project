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


def handle_database_error(details=None):
    response_data = {'error': "Database error"}
    if details:
        response_data['details'] = str(details)
    response = jsonify(response_data)
    response.status_code = 500
    return response
