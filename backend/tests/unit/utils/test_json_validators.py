from app.utils.json_validators import validate_user_data

def test_validate_user_data_invalid_json():
    result = validate_user_data("{bad_json")
    assert "error" in result

def test_validate_user_data_wrong_type():
    result = validate_user_data(123)
    assert "error" in result

def test_validate_user_data_valid_dict_missing_fields():
    result = validate_user_data({})
    assert "errors" in result
