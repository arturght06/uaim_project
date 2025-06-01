import sys
import os
from datetime import datetime, date
import uuid
import requests
import random

# Multiple users data - expanded to 20 users
users_data = [
    {
        "username": "user1",
        "name": "Anna",
        "surname": "Kowalska",
        "birthday": "1985-03-15",
        "email": "anna.kowalska@example.com",
        "phone_country_code": "+48",
        "phone_number": "501234567",
        "password": "Haslo1234."
    },
    {
        "username": "user2", 
        "name": "Piotr",
        "surname": "Nowak",
        "birthday": "1990-07-22",
        "email": "piotr.nowak@example.com",
        "phone_country_code": "+48",
        "phone_number": "502345678",
        "password": "Haslo1234."
    },
    {
        "username": "user3",
        "name": "Maria",
        "surname": "Wiśniewska",
        "birthday": "1988-11-08",
        "email": "maria.wisniewska@example.com",
        "phone_country_code": "+48",
        "phone_number": "503456789",
        "password": "Haslo1234."
    },
    {
        "username": "user4",
        "name": "Tomasz",
        "surname": "Zieliński",
        "birthday": "1992-12-03",
        "email": "tomasz.zielinski@example.com",
        "phone_country_code": "+48",
        "phone_number": "504567890",
        "password": "Haslo1234."
    },
    {
        "username": "user5",
        "name": "Katarzyna",
        "surname": "Lewandowska",
        "birthday": "1987-05-18",
        "email": "katarzyna.lewandowska@example.com",
        "phone_country_code": "+48",
        "phone_number": "505678901",
        "password": "Haslo1234."
    },
    {
        "username": "user6",
        "name": "Michał",
        "surname": "Wójcik",
        "birthday": "1991-09-14",
        "email": "michal.wojcik@example.com",
        "phone_country_code": "+48",
        "phone_number": "506789012",
        "password": "Haslo1234."
    },
    {
        "username": "user7",
        "name": "Aleksandra",
        "surname": "Krawczyk",
        "birthday": "1989-02-28",
        "email": "aleksandra.krawczyk@example.com",
        "phone_country_code": "+48",
        "phone_number": "507890123",
        "password": "Haslo1234."
    },
    {
        "username": "user8",
        "name": "Jakub",
        "surname": "Szymański",
        "birthday": "1993-08-07",
        "email": "jakub.szymanski@example.com",
        "phone_country_code": "+48",
        "phone_number": "508901234",
        "password": "Haslo1234."
    },
    {
        "username": "user9",
        "name": "Monika",
        "surname": "Dąbrowska",
        "birthday": "1986-11-22",
        "email": "monika.dabrowska@example.com",
        "phone_country_code": "+48",
        "phone_number": "509012345",
        "password": "Haslo1234."
    },
    {
        "username": "user10",
        "name": "Adam",
        "surname": "Jankowski",
        "birthday": "1994-04-11",
        "email": "adam.jankowski@example.com",
        "phone_country_code": "+48",
        "phone_number": "510123456",
        "password": "Haslo1234."
    },
    {
        "username": "user11",
        "name": "Paulina",
        "surname": "Mazur",
        "birthday": "1990-06-30",
        "email": "paulina.mazur@example.com",
        "phone_country_code": "+48",
        "phone_number": "511234567",
        "password": "Haslo1234."
    },
    {
        "username": "user12",
        "name": "Łukasz",
        "surname": "Kozłowski",
        "birthday": "1988-10-17",
        "email": "lukasz.kozlowski@example.com",
        "phone_country_code": "+48",
        "phone_number": "512345678",
        "password": "Haslo1234."
    },
    {
        "username": "user13",
        "name": "Natalia",
        "surname": "Woźniak",
        "birthday": "1991-01-25",
        "email": "natalia.wozniak@example.com",
        "phone_country_code": "+48",
        "phone_number": "513456789",
        "password": "Haslo1234."
    },
    {
        "username": "user14",
        "name": "Sebastian",
        "surname": "Kamiński",
        "birthday": "1987-07-13",
        "email": "sebastian.kaminski@example.com",
        "phone_country_code": "+48",
        "phone_number": "514567890",
        "password": "Haslo1234."
    },
    {
        "username": "user15",
        "name": "Agnieszka",
        "surname": "Król",
        "birthday": "1993-03-09",
        "email": "agnieszka.krol@example.com",
        "phone_country_code": "+48",
        "phone_number": "515678901",
        "password": "Haslo1234."
    },
    {
        "username": "user16",
        "name": "Marcin",
        "surname": "Pawłowski",
        "birthday": "1989-12-21",
        "email": "marcin.pawlowski@example.com",
        "phone_country_code": "+48",
        "phone_number": "516789012",
        "password": "Haslo1234."
    },
    {
        "username": "user17",
        "name": "Karolina",
        "surname": "Michalska",
        "birthday": "1992-08-16",
        "email": "karolina.michalska@example.com",
        "phone_country_code": "+48",
        "phone_number": "517890123",
        "password": "Haslo1234."
    },
    {
        "username": "user18",
        "name": "Bartosz",
        "surname": "Grabowski",
        "birthday": "1986-04-02",
        "email": "bartosz.grabowski@example.com",
        "phone_country_code": "+48",
        "phone_number": "518901234",
        "password": "Haslo1234."
    },
    {
        "username": "user19",
        "name": "Magdalena",
        "surname": "Lis",
        "birthday": "1990-11-07",
        "email": "magdalena.lis@example.com",
        "phone_country_code": "+48",
        "phone_number": "519012345",
        "password": "Haslo1234."
    },
    {
        "username": "user20",
        "name": "Grzegorz",
        "surname": "Adamski",
        "birthday": "1988-05-24",
        "email": "grzegorz.adamski@example.com",
        "phone_country_code": "+48",
        "phone_number": "520123456",
        "password": "Haslo1234."
    }
]

events_data = [
    {
        "title": "Wieczór Jazzowy z Trio Nowoczesnym",
        "description": "Zapraszamy na niezapomniany wieczór pełen improwizacji i jazzowych standardów w wykonaniu utalentowanego Trio Nowoczesnego. Ich muzyka to połączenie klasyki z nutą awangardy. Idealna propozycja na relaksujący wieczór.",
        "event_date_str": "07.06.2025 20:00", # Zmieniona data
        "location_name": "Klub Muzyczny \"Harmonia\"",
        "location_address": "ul. Jazzowa 5",
        "location_city": "Warszawa",
        "location_country": "Polska",
        "categories_list": ["Muzyka", "Koncert"],
        "max_participants": 40, # Zmniejszona liczba uczestników
    },
    {
        "title": "Abstrakcje Rzeczywistości - Wystawa Malarstwa",
        "description": "Galeria Sztuki Współczesnej prezentuje wystawę prac Anny Kowalskiej. Artystka w swoich płótnach bada granice percepcji i abstrakcyjnego postrzegania świata. Kurator zaprasza na wernisaż, podczas którego będzie można porozmawiać z twórczynią.",
        "event_date_str": "06.06.2025 18:00", # Zmieniona data
        "location_name": "Galeria Sztuki \"Nowa Przestrzeń\"",
        "location_address": "Rynek Główny 10",
        "location_city": "Kraków",
        "location_country": "Polska",
        "categories_list": ["Sztuka", "Wystawa"],
        "max_participants": 35, # Zmniejszona liczba uczestników
    },
    {
        "title": "Festiwal Filmów Niezależnych \"Krótkie Formy\"",
        "description": "Przegląd najciekawszych krótkometrażowych filmów niezależnych z kraju i zagranicy. Dyskusje z twórcami po seansach. Nie przegapcie okazji, by odkryć nowe talenty kina! Festiwal potrwa 3 dni.",
        "event_date_str": "10.06.2025 17:00", # Zmieniona data
        "location_name": "Kino \"Awangarda\"",
        "location_address": "ul. Filmowa 1",
        "location_city": "Łódź",
        "location_country": "Polska",
        "categories_list": ["Film", "Festiwal"],
        "max_participants": 40, # Zmniejszona liczba uczestników
    },
    {
        "title": "Slam Poetycki \"Słowo Przeciw Słowu\"",
        "description": "Emocjonujący turniej poetycki, gdzie publiczność decyduje o zwycięzcy! Przyjdź, posłuchaj, zagłosuj lub sam stań na scenie. Otwarty mikrofon dla odważnych w pierwszej części wieczoru.",
        "event_date_str": "05.06.2025 19:00", # Zmieniona data
        "location_name": "Kawiarnia Literacka \"Metafora\"",
        "location_address": "ul. Wieszczów 3",
        "location_city": "Gdańsk",
        "location_country": "Polska",
        "categories_list": ["Literatura", "Performance"],
        "max_participants": 30, # Zmniejszona liczba uczestników
    },
    {
        "title": "Recital Fortepianowy: Chopin i Współcześni",
        "description": "Młody, utalentowany pianista Jan Nowak zaprezentuje utwory Fryderyka Chopina oraz kompozycje współczesnych polskich twórców. Wieczór pełen wirtuozerii i muzycznych odkryć. Zapraszamy melomanów na to wyjątkowe spotkanie z muzyką klasyczną.",
        "event_date_str": "12.06.2025 19:30", # Zmieniona data
        "location_name": "Filharmonia Miejska, Sala Kameralna",
        "location_address": "ul. Symfoniczna 1",
        "location_city": "Wrocław",
        "location_country": "Polska",
        "categories_list": ["Muzyka", "Koncert", "Klasyka"],
        "max_participants": 40, # Zmniejszona liczba uczestników
    },
    {
        "title": "Premiera Komedii \"Nieporozumienie w Akcie Drugim\"",
        "description": "Teatr \"Scena Absurdu\" zaprasza na premierę nowej, błyskotliwej komedii omyłek. Salwy śmiechu gwarantowane! Reżyseria: Ewa Malinowska. Obsada: znakomici aktorzy scen warszawskich.",
        "event_date_str": "15.06.2025 19:00", # Zmieniona data
        "location_name": "Teatr \"Scena Absurdu\"",
        "location_address": "ul. Komiczna 7",
        "location_city": "Poznań",
        "location_country": "Polska",
        "categories_list": ["Teatr", "Spektakl", "Komedia"],
        "max_participants": 40, # Zmniejszona liczba uczestników
    },
    {
        "title": "Warsztaty Tańców Ludowych: Mazurek i Oberek",
        "description": "Odkryj radość polskich tańców ludowych! Warsztaty dla początkujących i średniozaawansowanych. Nauczymy się podstawowych kroków mazurka i oberka pod okiem doświadczonych instruktorów. Nie jest wymagane wcześniejsze doświadczenie, jedynie chęć do dobrej zabawy.",
        "event_date_str": "03.06.2025 11:00", # Zmieniona data
        "location_name": "Dom Kultury \"Korzenie\"",
        "location_address": "ul. Folklorystyczna 2",
        "location_city": "Zakopane",
        "location_country": "Polska",
        "categories_list": ["Taniec", "Warsztaty", "Folklor"],
        "max_participants": 25, # Zmniejszona liczba uczestników (już było <=40, ale zmniejszono)
    },
    {
        "title": "Wykład: \"Tajemnice Średniowiecznych Zamków Polski\"",
        "description": "Prof. dr hab. Adam Historyk opowie o fascynujących historiach i sekretach kryjących się w murach polskich zamków. Prezentacja multimedialna wzbogaci wykład o niepublikowane dotąd zdjęcia i mapy. Wstęp wolny, po wykładzie przewidziana sesja pytań i odpowiedzi.",
        "event_date_str": "18.06.2025 18:30", # Zmieniona data
        "location_name": "Muzeum Regionalne, Aula Główna",
        "location_address": "ul. Historyczna 15",
        "location_city": "Toruń",
        "location_country": "Polska",
        "categories_list": ["Edukacja", "Wykład", "Historia"],
        "max_participants": 38, # Zmniejszona liczba uczestników
    },
    {
        "title": "Wernisaż Fotografii \"Pejzaże Duszy\"",
        "description": "Zapraszamy na otwarcie wystawy fotografii autorstwa Marty Obiektyw. Artystka prezentuje cykl intymnych pejzaży, które są odzwierciedleniem jej wewnętrznych przeżyć i podróży. Możliwość spotkania z autorką i zakupu prac. Lampka wina dla gości.",
        "event_date_str": "08.06.2025 18:30", # Zmieniona data
        "location_name": "Galeria Fotografii \"Focus\"",
        "location_address": "ul. Światłoczuła 9",
        "location_city": "Sopot",
        "location_country": "Polska",
        "categories_list": ["Sztuka", "Wystawa", "Fotografia"],
        "max_participants": 30, # Zmniejszona liczba uczestników
    },
    {
        "title": "Wieczór Stand-up: Śmiech To Zdrowie!",
        "description": "Najlepsi komicy polskiej sceny stand-upowej rozbawią Was do łez! Nowe materiały i sprawdzone żarty, które nikogo nie pozostawią obojętnym. Przygotujcie się na solidną dawkę humoru bez cenzury. Program tylko dla dorosłych.",
        "event_date_str": "20.06.2025 20:30", # Zmieniona data
        "location_name": "Klub Komediowy \"Chichot\"",
        "location_address": "Al. Uśmiechu 4",
        "location_city": "Katowice",
        "location_country": "Polska",
        "categories_list": ["Rozrywka", "Stand-up"],
        "max_participants": 40, # Zmniejszona liczba uczestników
    },
    # Dodatkowe eventy dla mniejszej liczby osób
    {
        "title": "Kameralne Warsztaty Ceramiczne",
        "description": "Stwórz własne, unikatowe naczynie ceramiczne pod okiem doświadczonego artysty. Zapewniamy wszystkie materiały i narzędzia. Idealne dla początkujących, którzy chcą spróbować swoich sił w nowej dziedzinie sztuki.",
        "event_date_str": "11.06.2025 16:00",
        "location_name": "Pracownia \"Gliniana Chata\"",
        "location_address": "ul. Rękodzielnicza 12",
        "location_city": "Wrocław",
        "location_country": "Polska",
        "categories_list": ["Sztuka", "Warsztaty"],
        "max_participants": 10, # Mała grupa
    },
    {
        "title": "Spotkanie Autorskie z Poetą - Edycja Limitowana",
        "description": "Intymne spotkanie z poetą Janem Wierszem, który opowie o swojej najnowszej twórczości i inspiracjach. Możliwość zadawania pytań i zdobycia dedykacji. Tylko dla wąskiego grona miłośników poezji.",
        "event_date_str": "19.06.2025 19:00",
        "location_name": "Antykwariat \"Stare Księgi\"",
        "location_address": "ul. Książkowa 1",
        "location_city": "Kraków",
        "location_country": "Polska",
        "categories_list": ["Literatura", "Spotkanie"], # Użycie istniejącej kategorii "Literatura"
        "max_participants": 15, # Mała grupa
    },
    {
        "title": "Degustacja Win z Sommelierem - Kurs Podstawowy",
        "description": "Poznaj tajniki degustacji win pod okiem profesjonalnego sommeliera. Naucz się rozpoznawać aromaty i smaki. Degustacja 5 rodzajów win w małej, kameralnej grupie.",
        "event_date_str": "25.06.2025 18:30",
        "location_name": "Winiarnia \"Bachus\"",
        "location_address": "ul. Winogronowa 8",
        "location_city": "Zielona Góra",
        "location_country": "Polska",
        "categories_list": ["Edukacja", "Rozrywka"], # Użycie istniejących kategorii
        "max_participants": 12, # Mała grupa
    }
]

# Możesz teraz użyć `events_data_updated`
# print(events_data_updated)

BASE_API_URL = "https://uaim-api.karoada.ovh"

# Updated user data to match one of the registered users
USER_DATA = {
    "login": "user1",
    "password": "Haslo1234."
}

def register_user(user_data):
    """Register a single user via the registration endpoint"""
    url = f"{BASE_API_URL}/auth/register"
    resp = requests.post(url, json=user_data)
    print(f"Register user {user_data['username']}: {resp.status_code} {resp.text}")
    return resp.ok

def register_all_users():
    """Register all users"""
    registered_users = []
    for user_data in users_data:
        if register_user(user_data):
            registered_users.append(user_data["username"])
    return registered_users

def login_user_by_username(username):
    """Login a specific user and return token and user_id"""
    url = f"{BASE_API_URL}/auth/login"
    data = {
        "login": username,
        "password": "Haslo1234."
    }
    resp = requests.post(url, json=data)
    print(f"Login {username}:", resp.status_code, resp.text)
    if resp.ok:
        tokens = resp.json().get("tokens", {})
        user = resp.json().get("user", {})
        return tokens.get("access_token"), user.get("id")
    return None, None

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

def create_reservation(event_id, user_id, token):
    """Create a reservation for a user to join an event"""
    url = f"{BASE_API_URL}/api/reservations/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "user_id": user_id,
        "event_id": event_id,
        "status": "confirmed"
    }
    resp = requests.post(url, json=data, headers=headers)
    print(f"Create reservation: user {user_id[:8]}... -> event {event_id[:8]}... : {resp.status_code}")
    return resp.ok

# Random comments list
random_comments = [
    "Nie mogę się doczekać! 🎉",
    "Brzmi super! 😊",
    "Ktoś jeszcze idzie? 👀",
    "O, to coś dla mnie! 👍",
    "Zapowiada się ciekawie.",
    "Będę na pewno! ✅",
    "Świetny pomysł! ✨",
    "Już odliczam dni! 🤩",
    "Mam nadzieję, że uda mi się wpaść.",
    "Ekstra! 🔥",
    "To jest to! 💯",
    "Słyszałem dobre opinie.",
    "Idealnie! ❤️",
    "Wow, super inicjatywa!",
    "Może wpadnę... 🤔",
    "Wygląda obiecująco!",
    "Zapisane w kalendarzu! 📅",
    "Czekam na to z niecierpliwością! 😄",
    "Zapowiada się świetna zabawa! 🥳",
    "Genialne! Trzeba być.",
    "Super sprawa!",
    "Wreszcie coś interesującego!",
    "Bardzo ciekawy temat/wydarzenie.",
    "No to super! Do zobaczenia! 👋",
    "Brzmi jak plan na udany wieczór/dzień! 🌟"
]

def create_comment(event_id, user_id, content, token):
    """Create a comment for an event"""
    url = f"{BASE_API_URL}/api/comments/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "event_id": event_id,
        "user_id": user_id,
        "content": content
    }
    resp = requests.post(url, json=data, headers=headers)
    print(f"Create comment: user {user_id[:8]}... -> event {event_id[:8]}... : {resp.status_code}")
    return resp.ok

def make_random_comments(event_ids, user_credentials):
    """Make random users comment on random events"""
    print("\nCreating random comments...")
    
    # For each event, randomly select 10-50% of users to comment
    for event_id in event_ids:
        # Get random subset of users (10-50% of all users)
        comment_rate = random.uniform(0.1, 0.5)
        num_commenters = int(len(user_credentials) * comment_rate)
        
        # Randomly select users to comment
        commenting_users = random.sample(list(user_credentials.keys()), num_commenters)
        
        print(f"Event {event_id[:8]}... will have {len(commenting_users)} comments")
        
        for username in commenting_users:
            user_data = user_credentials[username]
            # Pick a random comment
            comment_content = random.choice(random_comments)
            success = create_comment(event_id, user_data["id"], comment_content, user_data["token"])
            if success:
                print(f"  ✓ {username} commented: {comment_content[:30]}...")
            else:
                print(f"  ✗ {username} failed to comment")

def make_random_reservations(event_ids, user_credentials):
    """Make random users join random events"""
    print("\nCreating random reservations...")
    
    # For each event, randomly select 30-70% of users to join
    for event_id in event_ids:
        # Get random subset of users (30-70% of all users)
        participation_rate = random.uniform(0.1, 1)
        num_participants = int(len(user_credentials) * participation_rate)
        
        # Randomly select users to participate
        participating_users = random.sample(list(user_credentials.keys()), num_participants)
        
        print(f"Event {event_id[:8]}... will have {len(participating_users)} participants")
        
        for username in participating_users:
            user_data = user_credentials[username]
            success = create_reservation(event_id, user_data["id"], user_data["token"])
            if success:
                print(f"  ✓ {username} joined event")
            else:
                print(f"  ✗ {username} failed to join event")

def main():
    # Register all users first
    print("Registering users...")
    registered_users = register_all_users()
    print(f"Successfully registered users: {registered_users}")
    
    # Login all users to get their tokens and IDs
    user_credentials = {}
    for user_data in users_data:
        username = user_data["username"]
        token, user_id = login_user_by_username(username)
        if token and user_id:
            user_credentials[username] = {"token": token, "id": user_id}
    
    if not user_credentials:
        print("Failed to login any users, aborting.")
        return
    
    print(f"Successfully logged in {len(user_credentials)} users")
    
    # Use first available user for creating categories and locations
    first_user = list(user_credentials.values())[0]
    token = first_user["token"]

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

    # Create locations and events with different organizers
    location_key_to_id = {}
    user_list = list(user_credentials.keys())
    event_ids = []
    
    for i, event in enumerate(events_data):
        # Distribute events among users (round-robin)
        current_user = user_list[i % len(user_list)]
        organizer_token = user_credentials[current_user]["token"]
        organizer_id = user_credentials[current_user]["id"]
        
        print(f"Creating event '{event['title']}' with organizer: {current_user}")
        
        loc_key = (event["location_name"], event["location_address"], event["location_city"], event["location_country"])
        if loc_key not in location_key_to_id:
            loc_id = create_location(event, organizer_token)
            if loc_id:
                location_key_to_id[loc_key] = loc_id
        else:
            loc_id = location_key_to_id[loc_key]
        
        # Map event categories to ids
        event_cat_ids = [category_name_to_id[cat] for cat in event["categories_list"] if cat in category_name_to_id]
        event_id = create_event(event, loc_id, event_cat_ids, organizer_token, organizer_id)
        
        if event_id:
            event_ids.append(event_id)
            # Create event-category relations
            for cat_id in event_cat_ids:
                create_event_category_relation(event_id, cat_id, organizer_token)
    
    # Make random reservations after all events are created
    if event_ids:
        make_random_reservations(event_ids, user_credentials)
        make_random_comments(event_ids, user_credentials)
    
    print(f"\nPopulation complete!")
    print(f"Created {len(registered_users)} users")
    print(f"Created {len(event_ids)} events")
    print(f"Created random reservations for user participation")
    print(f"Created random comments on events")


if __name__ == "__main__":
    main()
