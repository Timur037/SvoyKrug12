from __future__ import annotations
from dataclasses import dataclass, field

# Mapping: budget key from onboarding → price_level integer
BUDGET_TO_PRICE_LEVEL: dict[str, int] = {
    "budget_1000":   1,
    "budget_3000":   2,
    "budget_5000":   3,
    "budget_premium": 4,
}

# Moscow districts → (lat, lon) of district center
DISTRICT_COORDS: dict[str, tuple[float, float]] = {
    "Центр":         (55.7558, 37.6173),
    "Север":         (55.8300, 37.5800),
    "Северо-Восток": (55.8500, 37.7200),
    "Восток":        (55.7500, 37.8200),
    "Юго-Восток":   (55.6800, 37.7500),
    "Юг":            (55.6200, 37.6100),
    "Юго-Запад":    (55.6600, 37.4800),
    "Запад":         (55.7400, 37.4200),
    "Северо-Запад": (55.8000, 37.4500),
    "Подмосковье":  (55.7558, 37.6173),  # fallback to center
    "mixed":         (55.7558, 37.6173),  # cross-district group
}

# Search radius per district (meters)
DISTRICT_RADIUS = 3000  # 3km covers most Moscow districts comfortably


@dataclass
class Restaurant:
    name: str
    district: str
    address: str
    city: str = "Москва"
    phone: str | None = None
    rating: float | None = None     # 1.0–5.0
    price_level: int | None = None  # 1=budget, 2=mid, 3=high, 4=premium
    capacity: int | None = None
    photos: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    external_id_2gis: str | None = None
    external_id_yandex: str | None = None
    lat: float | None = None
    lon: float | None = None

    def as_supabase_row(self) -> dict:
        return {
            "name":               self.name,
            "district":           self.district,
            "address":            self.address,
            "city":               self.city,
            "phone":              self.phone,
            "rating_2gis":        self.rating,
            "price_level":        self.price_level,
            "capacity":           self.capacity,
            "photos":             self.photos,
            "tags":               self.tags,
            "external_id_2gis":   self.external_id_2gis,
            "external_id_yandex": self.external_id_yandex,
        }


@dataclass
class RankedRestaurant:
    restaurant: Restaurant
    db_id: str | None          # UUID in restaurants table (None if not yet saved)
    claude_score: float        # 0.0–10.0 from Claude
    reason: str                # one sentence in Russian
    final_score: float = 0.0   # weighted final score
