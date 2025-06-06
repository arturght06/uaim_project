from app.models.refresh_tokens import RefreshToken

def test_create_refresh_token():
    token = RefreshToken(user_id="1", token="abc123", revoked=False)
    assert token.token == "abc123"
    assert token.revoked is False
    assert token.user_id == "1"
