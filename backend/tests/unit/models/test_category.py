from app.models.category import Category

def test_create_category():
    cat = Category(name="Music")
    assert cat.name == "Music"
