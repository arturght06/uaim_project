import sys
import os
from datetime import datetime, date
import uuid
import requests

events_data = [
    {
        "title": "Wieczór Jazzowy z Trio Nowoczesnym",
        "description": "Zapraszamy na niezapomniany wieczór pełen improwizacji i jazzowych standardów w wykonaniu utalentowanego Trio Nowoczesnego. Ich muzyka to połączenie klasyki z nutą awangardy. Idealna propozycja na relaksujący wieczór.",
        "event_date_str": "27.05.2025 20:00",
        "location_name": "Klub Muzyczny \"Harmonia\"",
        "location_address": "ul. Jazzowa 5",
        "location_city": "Warszawa",
        "location_country": "Polska",
        "categories_list": ["Muzyka", "Koncert"],
        "max_participants": 150,
    },
    {
        "title": "Abstrakcje Rzeczywistości - Wystawa Malarstwa",
        "description": "Galeria Sztuki Współczesnej prezentuje wystawę prac Anny Kowalskiej. Artystka w swoich płótnach bada granice percepcji i abstrakcyjnego postrzegania świata. Kurator zaprasza na wernisaż, podczas którego będzie można porozmawiać z twórczynią.",
        "event_date_str": "26.05.2025 18:00",
        "location_name": "Galeria Sztuki \"Nowa Przestrzeń\"",
        "location_address": "Rynek Główny 10",
        "location_city": "Kraków",
        "location_country": "Polska",
        "categories_list": ["Sztuka", "Wystawa"],
        "max_participants": 100,
    },
    {
        "title": "Festiwal Filmów Niezależnych \"Krótkie Formy\"",
        "description": "Przegląd najciekawszych krótkometrażowych filmów niezależnych z kraju i zagranicy. Dyskusje z twórcami po seansach. Nie przegapcie okazji, by odkryć nowe talenty kina! Festiwal potrwa 3 dni.",
        "event_date_str": "28.05.2025 17:00",
        "location_name": "Kino \"Awangarda\"",
        "location_address": "ul. Filmowa 1",
        "location_city": "Łódź",
        "location_country": "Polska",
        "categories_list": ["Film", "Festiwal"],
        "max_participants": 200,
    },
    {
        "title": "Slam Poetycki \"Słowo Przeciw Słowu\"",
        "description": "Emocjonujący turniej poetycki, gdzie publiczność decyduje o zwycięzcy! Przyjdź, posłuchaj, zagłosuj lub sam stań na scenie. Otwarty mikrofon dla odważnych w pierwszej części wieczoru.",
        "event_date_str": "25.05.2025 19:00",
        "location_name": "Kawiarnia Literacka \"Metafora\"",
        "location_address": "ul. Wieszczów 3",
        "location_city": "Gdańsk",
        "location_country": "Polska",
        "categories_list": ["Literatura", "Performance"],
        "max_participants": 80,
    },
    {
        "title": "Recital Fortepianowy: Chopin i Współcześni",
        "description": "Młody, utalentowany pianista Jan Nowak zaprezentuje utwory Fryderyka Chopina oraz kompozycje współczesnych polskich twórców. Wieczór pełen wirtuozerii i muzycznych odkryć. Zapraszamy melomanów na to wyjątkowe spotkanie z muzyką klasyczną.",
        "event_date_str": "27.05.2025 19:30",
        "location_name": "Filharmonia Miejska, Sala Kameralna",
        "location_address": "ul. Symfoniczna 1",
        "location_city": "Wrocław",
        "location_country": "Polska",
        "categories_list": ["Muzyka", "Koncert", "Klasyka"],
        "max_participants": 250,
    },
    {
        "title": "Premiera Komedii \"Nieporozumienie w Akcie Drugim\"",
        "description": "Teatr \"Scena Absurdu\" zaprasza na premierę nowej, błyskotliwej komedii omyłek. Salwy śmiechu gwarantowane! Reżyseria: Ewa Malinowska. Obsada: znakomici aktorzy scen warszawskich.",
        "event_date_str": "29.05.2025 19:00",
        "location_name": "Teatr \"Scena Absurdu\"",
        "location_address": "ul. Komiczna 7",
        "location_city": "Poznań",
        "location_country": "Polska",
        "categories_list": ["Teatr", "Spektakl", "Komedia"],
        "max_participants": 300,
    },
    {
        "title": "Warsztaty Tańców Ludowych: Mazurek i Oberek",
        "description": "Odkryj radość polskich tańców ludowych! Warsztaty dla początkujących i średniozaawansowanych. Nauczymy się podstawowych kroków mazurka i oberka pod okiem doświadczonych instruktorów. Nie jest wymagane wcześniejsze doświadczenie, jedynie chęć do dobrej zabawy.",
        "event_date_str": "24.05.2025 11:00",
        "location_name": "Dom Kultury \"Korzenie\"",
        "location_address": "ul. Folklorystyczna 2",
        "location_city": "Zakopane",
        "location_country": "Polska",
        "categories_list": ["Taniec", "Warsztaty", "Folklor"],
        "max_participants": 30,
    },
    {
        "title": "Wykład: \"Tajemnice Średniowiecznych Zamków Polski\"",
        "description": "Prof. dr hab. Adam Historyk opowie o fascynujących historiach i sekretach kryjących się w murach polskich zamków. Prezentacja multimedialna wzbogaci wykład o niepublikowane dotąd zdjęcia i mapy. Wstęp wolny, po wykładzie przewidziana sesja pytań i odpowiedzi.",
        "event_date_str": "30.05.2025 18:30",
        "location_name": "Muzeum Regionalne, Aula Główna",
        "location_address": "ul. Historyczna 15",
        "location_city": "Toruń",
        "location_country": "Polska",
        "categories_list": ["Edukacja", "Wykład", "Historia"],
        "max_participants": 100,
    },
    {
        "title": "Wernisaż Fotografii \"Pejzaże Duszy\"",
        "description": "Zapraszamy na otwarcie wystawy fotografii autorstwa Marty Obiektyw. Artystka prezentuje cykl intymnych pejzaży, które są odzwierciedleniem jej wewnętrznych przeżyć i podróży. Możliwość spotkania z autorką i zakupu prac. Lampka wina dla gości.",
        "event_date_str": "27.05.2025 18:30",
        "location_name": "Galeria Fotografii \"Focus\"",
        "location_address": "ul. Światłoczuła 9",
        "location_city": "Sopot",
        "location_country": "Polska",
        "categories_list": ["Sztuka", "Wystawa", "Fotografia"],
        "max_participants": 70,
    },
    {
        "title": "Wieczór Stand-up: Śmiech To Zdrowie!",
        "description": "Najlepsi komicy polskiej sceny stand-upowej rozbawią Was do łez! Nowe materiały i sprawdzone żarty, które nikogo nie pozostawią obojętnym. Przygotujcie się na solidną dawkę humoru bez cenzury. Program tylko dla dorosłych.",
        "event_date_str": "30.05.2025 20:30",
        "location_name": "Klub Komediowy \"Chichot\"",
        "location_address": "Al. Uśmiechu 4",
        "location_city": "Katowice",
        "location_country": "Polska",
        "categories_list": ["Rozrywka", "Stand-up"],
        "max_participants": 120,
    }
]

BASE_API_URL = "https://uaim-api.karoada.ovh"

USER_DATA = {
    "login": "karoada",
    "password": "Haslo1234."
}

def login_user():
    url = f"{BASE_API_URL}/auth/login"
    data = {
        "login": USER_DATA["login"],
        "password": USER_DATA["password"]
    }
    resp = requests.post(url, json=data)
    print("Login:", resp.status_code, resp.text)
    if resp.ok:
        tokens = resp.json().get("tokens", {})
        user = resp.json().get("user", {})
        return tokens.get("access_token"), user.get("id")
    return None, None

category_descriptions = {
    "Folklor": "Wydarzenia związane z tradycjami ludowymi, kulturą i sztuką regionalną.",
    "Sztuka": "Prezentacje dzieł artystycznych, obejmujące malarstwo, rzeźbę, grafikę.",
    "Warsztaty": "Interaktywne zajęcia praktyczne rozwijające umiejętności i wiedzę.",
    "Performance": "Artystyczne wystąpienia na żywo, często interdyscyplinarne i eksperymentalne.",
    "Komedia": "Wydarzenia mające na celu rozbawienie publiczności, np. spektakle, filmy.",
    "Festiwal": "Cykliczne, wielodniowe wydarzenie kulturalne o określonym temacie przewodnim.",
    "Edukacja": "Spotkania i zajęcia poszerzające wiedzę i kompetencje uczestników.",
    "Film": "Projekcje filmowe, pokazy specjalne, spotkania z twórcami kina.",
    "Wystawa": "Publiczna prezentacja eksponatów artystycznych, historycznych lub innych.",
    "Historia": "Wydarzenia poświęcone przeszłości, odkryciom historycznym i dziedzictwu.",
    "Koncert": "Występ muzyczny na żywo, prezentujący różne gatunki i formy.",
    "Rozrywka": "Wydarzenia zapewniające dobrą zabawę i relaks dla uczestników.",
    "Stand-up": "Występy komediowe jednego artysty, często oparte na osobistych historiach.",
    "Teatr": "Sztuka sceniczna obejmująca spektakle dramatyczne, muzyczne, lalkowe.",
    "Taniec": "Pokazy taneczne, warsztaty i inne wydarzenia związane ze sztuką tańca.",
    "Spektakl": "Przedstawienie teatralne, operowe, baletowe lub inne widowisko sceniczne.",
    "Wykład": "Prezentacja tematu przez specjalistę, mająca na celu przekazanie wiedzy.",
    "Literatura": "Spotkania autorskie, dyskusje o książkach, wieczory poetyckie.",
    "Muzyka": "Ogólna kategoria dla wydarzeń związanych z dźwiękiem i kompozycją.",
    "Fotografia": "Wystawy, warsztaty i spotkania poświęcone sztuce utrwalania obrazu.",
    "Klasyka": "Dzieła i wydarzenia uznane za wzorcowe, ponadczasowe w swojej dziedzinie."
}

def create_category(name, description, token):
    url = f"{BASE_API_URL}/api/category/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {"name": name, "description": description}
    resp = requests.post(url, json=data, headers=headers)
    print("Create category:", name, resp.status_code, resp.text)
    if resp.ok:
        return resp.json().get("id")
    return None

def create_location(event, token):
    url = f"{BASE_API_URL}/api/location/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": event["location_name"],
        "address": event["location_address"],
        "city": event["location_city"],
        "country": event["location_country"],
    }
    resp = requests.post(url, json=data, headers=headers)
    print("Create location:", data["name"], resp.status_code, resp.text)
    if resp.ok:
        return resp.json().get("id")
    return None

def create_event(event, location_id, category_ids, token, organizer_id):
    url = f"{BASE_API_URL}/api/events/"
    headers = {"Authorization": f"Bearer {token}"}
    # Convert date string to ISO format
    event_date = datetime.strptime(event["event_date_str"], "%d.%m.%Y %H:%M").isoformat()
    data = {
        "title": event["title"],
        "description": event["description"],
        "event_date": event_date,
        "location_id": location_id,
        "max_participants": event["max_participants"],
        "category_ids": category_ids,
        "organizer_id": organizer_id
    }
    resp = requests.post(url, json=data, headers=headers)
    print("Create event:", data["title"], resp.status_code, resp.text)
    if resp.ok:
        return resp.json().get("id")
    return None

def create_event_category_relation(event_id, category_id, token):
    url = f"{BASE_API_URL}/api/event-category/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "event_id": event_id,
        "category_id": category_id
    }
    resp = requests.post(url, json=data, headers=headers)
    print("Create event-category relation:", event_id, category_id, resp.status_code, resp.text)
    return resp.ok

def main():
    # login user
    token, organizer_id = login_user()
    if not token or not organizer_id:
        print("Failed to get token or organizer_id, aborting.")
        return

    # Create all categories
    all_categories = set()
    for event in events_data:
        all_categories.update(event["categories_list"])
    category_name_to_id = {}
    for cat in all_categories:
        desc = category_descriptions.get(cat, "")
        cat_id = create_category(cat, desc, token)
        if cat_id:
            category_name_to_id[cat] = cat_id

    # Create locations and events
    location_key_to_id = {}
    for event in events_data:
        loc_key = (event["location_name"], event["location_address"], event["location_city"], event["location_country"])
        if loc_key not in location_key_to_id:
            loc_id = create_location(event, token)
            if loc_id:
                location_key_to_id[loc_key] = loc_id
        else:
            loc_id = location_key_to_id[loc_key]
        # Map event categories to ids
        event_cat_ids = [category_name_to_id[cat] for cat in event["categories_list"] if cat in category_name_to_id]
        event_id = create_event(event, loc_id, event_cat_ids, token, organizer_id)
        # Now create event-category relations
        if event_id:
            for cat_id in event_cat_ids:
                create_event_category_relation(event_id, cat_id, token)


if __name__ == "__main__":
    main()
