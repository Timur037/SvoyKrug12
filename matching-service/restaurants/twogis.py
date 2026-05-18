"""
2GIS Catalog API client.

Free demo: 1 000 requests/month → we cache aggressively.
Docs: https://docs.2gis.com/en/api/search/places/reference/3.0/items
"""

from __future__ import annotations
import logging
import os
import time

import httpx

from .models import Restaurant, DISTRICT_COORDS, DISTRICT_RADIUS

log = logging.getLogger(__name__)

_BASE = "https://catalog.api.2gis.com/3.0/items"
_RUBRIC_RESTAURANT = "164"  # Рестораны
_RUBRIC_CAFE = "163"        # Кафе

_FIELDS = ",".join([
    "items.id",
    "items.name",
    "items.full_address_name",
    "items.point",
    "items.contact_groups",
    "items.photos",
    "items.reviews",
    "items.schedule",
    "items.attribute_groups",
    "items.rubrics",
])

_PRICE_SYMBOL_MAP = {
    "₽":    1,
    "₽₽":   2,
    "₽₽₽":  3,
    "₽₽₽₽": 4,
}


def _parse_price_level(item: dict) -> int | None:
    for group in item.get("attribute_groups") or []:
        for attr in group.get("attributes") or []:
            value = attr.get("value", "")
            if "₽" in value:
                return _PRICE_SYMBOL_MAP.get(value.strip())
    return None


def _parse_phone(item: dict) -> str | None:
    for group in item.get("contact_groups") or []:
        for contact in group.get("contacts") or []:
            if contact.get("type") == "phone":
                return contact.get("value")
    return None


def _parse_rating(item: dict) -> float | None:
    reviews = item.get("reviews")
    if isinstance(reviews, dict):
        rating = reviews.get("rating")
        if rating is not None:
            return float(rating)
    return None


def _parse_photos(item: dict) -> list[str]:
    photos = []
    for p in (item.get("photos") or [])[:3]:
        url = p.get("url_template", "")
        if url:
            photos.append(url.replace("{width}x{height}", "800x600"))
    return photos


def _item_to_restaurant(item: dict, district: str) -> Restaurant | None:
    name = item.get("name", "").strip()
    address = item.get("full_address_name", "").strip()
    if not name or not address:
        return None

    point = item.get("point") or {}
    lat = point.get("lat")
    lon = point.get("lon")

    return Restaurant(
        name=name,
        district=district,
        address=address,
        phone=_parse_phone(item),
        rating=_parse_rating(item),
        price_level=_parse_price_level(item),
        photos=_parse_photos(item),
        tags=[],
        external_id_2gis=str(item.get("id", "")),
        lat=lat,
        lon=lon,
    )


def search_restaurants(
    district: str,
    price_level: int | None = None,
    min_rating: float = 4.2,
    group_size: int = 6,
    max_results: int = 20,
) -> list[Restaurant]:
    """
    Search restaurants in a Moscow district via 2GIS API.
    Returns filtered, deduplicated list ready for ranking.
    """
    api_key = os.environ.get("TWOGIS_API_KEY")
    if not api_key:
        log.warning("TWOGIS_API_KEY not set — skipping 2GIS search")
        return []

    coords = DISTRICT_COORDS.get(district)
    if not coords:
        log.warning("Unknown district: %s", district)
        return []

    lat, lon = coords
    results: list[Restaurant] = []
    seen_ids: set[str] = set()

    for rubric in [_RUBRIC_RESTAURANT, _RUBRIC_CAFE]:
        params = {
            "q":         "ресторан кафе",
            "point":     f"{lon},{lat}",   # 2GIS expects lon,lat
            "radius":    DISTRICT_RADIUS,
            "rubric_id": rubric,
            "type":      "branch",
            "fields":    _FIELDS,
            "page_size": 20,
            "key":       api_key,
        }

        try:
            resp = httpx.get(_BASE, params=params, timeout=10.0)
            resp.raise_for_status()
        except httpx.HTTPError as e:
            log.error("2GIS request failed (rubric=%s): %s", rubric, e)
            time.sleep(1)
            continue

        data = resp.json()
        items = data.get("result", {}).get("items") or []

        for item in items:
            ext_id = str(item.get("id", ""))
            if ext_id in seen_ids:
                continue
            seen_ids.add(ext_id)

            restaurant = _item_to_restaurant(item, district)
            if restaurant is None:
                continue

            # Filter: rating threshold
            if restaurant.rating is not None and restaurant.rating < min_rating:
                continue

            # Filter: must have phone (needed for booking)
            if not restaurant.phone:
                continue

            # Filter: price level compatibility (allow ±1 tier)
            if price_level is not None and restaurant.price_level is not None:
                if abs(restaurant.price_level - price_level) > 1:
                    continue

            results.append(restaurant)

        time.sleep(0.3)  # be polite to the API

    log.info("2GIS found %d restaurants in %s", len(results), district)
    return results[:max_results]
