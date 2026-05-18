from __future__ import annotations
from dataclasses import dataclass


@dataclass
class WalkLocation:
    district: str
    park_name: str
    meeting_point: str
    address: str | None = None
    lat: float | None = None
    lon: float | None = None
    rain_backup_name: str | None = None
    rain_backup_address: str | None = None
    db_id: str | None = None

    @classmethod
    def from_db_row(cls, row: dict) -> "WalkLocation":
        return cls(
            district=row["district"],
            park_name=row["park_name"],
            meeting_point=row["meeting_point"],
            address=row.get("address"),
            lat=row.get("lat"),
            lon=row.get("lon"),
            rain_backup_name=row.get("rain_backup_name"),
            rain_backup_address=row.get("rain_backup_address"),
            db_id=row.get("id"),
        )


# Hardcoded fallback — used if Supabase table is empty or unreachable
FALLBACK_LOCATIONS: dict[str, list[WalkLocation]] = {
    "Центр": [
        WalkLocation("Центр", "Александровский сад", "у Вечного огня",
                     "Манежная пл.", rain_backup_name="Кофе Хауз", rain_backup_address="Моховая, 15"),
        WalkLocation("Центр", "Парк Горького", "у центрального входа",
                     "Крымский Вал, 9", rain_backup_name='Кафе "Мороженое Горького"'),
    ],
    "Север": [
        WalkLocation("Север", "Парк Дружбы", "у главного входа, метро Речной вокзал",
                     "Фестивальная ул.", rain_backup_name="Шоколадница", rain_backup_address="Ленинградское ш., 120"),
        WalkLocation("Север", "Тимирязевский парк", "у главного входа, Дмитровское шоссе",
                     "Дмитровское ш., 57"),
    ],
    "Северо-Восток": [
        WalkLocation("Северо-Восток", "ВДНХ", 'у фонтана "Дружба народов"',
                     "просп. Мира, 119", rain_backup_name="Кофейня у главного входа"),
        WalkLocation("Северо-Восток", "Останкинский парк", "у главного входа с ул. Академика Королёва",
                     "ул. Академика Королёва, 12"),
    ],
    "Восток": [
        WalkLocation("Восток", "Измайловский парк", "у главного входа, метро Партизанская",
                     "Народный просп., 17", rain_backup_name="Кофейня у Измайловского Кремля"),
        WalkLocation("Восток", "Терлецкая дубрава", "у главного пруда, беседка",
                     "Свободный просп."),
    ],
    "Юго-Восток": [
        WalkLocation("Юго-Восток", "Кузьминский парк", "у Конного двора",
                     "Волгоградский просп., 168Б", rain_backup_name='Ресторан "Кузьминки"'),
        WalkLocation("Юго-Восток", "Люблинский парк", "у главного входа, метро Люблино",
                     "Краснодарская ул., 57А"),
    ],
    "Юг": [
        WalkLocation("Юг", "Коломенское", "у Дворцовой церкви Вознесения",
                     "просп. Андропова, 39", rain_backup_name='Кафе "Трапезная"'),
        WalkLocation("Юг", "Царицыно", "у Большого пруда, напротив дворца",
                     "ул. Дольская, 1"),
    ],
    "Юго-Запад": [
        WalkLocation("Юго-Запад", "Воробьёвы горы", "у смотровой площадки",
                     "Воробьёвское ш.", rain_backup_name="Coffee Shop у метро Воробьёвы горы"),
        WalkLocation("Юго-Запад", "Нескучный сад", "у Летнего театра, главный вход",
                     "Ленинский просп., 2"),
    ],
    "Запад": [
        WalkLocation("Запад", "Серебряный бор", "у пляжа №3, главная аллея",
                     "Хорошёвское ш., 76", rain_backup_name='Ресторан "Серебряный бор"'),
        WalkLocation("Запад", "Парк Фили", "у главного входа, Кутузовский проспект",
                     "Кутузовский просп."),
    ],
    "Северо-Запад": [
        WalkLocation("Северо-Запад", "Покровское-Стрешнево", "у центрального пруда, беседка",
                     "Волоколамское ш., 52", rain_backup_name="Шоколадница", rain_backup_address="Волоколамское ш., 50"),
        WalkLocation("Северо-Запад", "Тушинский аэродром", "у набережной, кинотеатр «Тушино»",
                     "ул. Свободы"),
    ],
}
