"""
Yandex Maps Organization Search (supplementary source).

Note: Yandex API does NOT return ratings in standard response.
Used as a fallback when 2GIS returns too few results.
Docs: https://yandex.com/maps-api/docs/geosearch-api/request.html
"""

from __future__ import annotations
import logging
import os

import httpx

from .models import Restaurant, DISTRICT_COORDS, DISTRICT_RADIUS

log = logging.getLogger(__name__)

_BASE = "https://search-maps.yandex.ru/v1/"

# Approximate span in degrees for a 3km radius
_SPAN_DEG = 0.045


def _item_to_restaurant(feature: dict, district: str) -> Restaurant | None:
    props = feature.get("properties") or {}
    name = (props.get("name") or "").strip()
    if not name:
        return None

    address = (
        props.get("description")
        or (props.get("CompanyMetaData") or {}).get("address")
        or ""
    ).strip()

    meta = props.get("CompanyMetaData") or {}

    # Phone
    phone = None
    for ph in meta.get("Phones") or []:
        raw = ph.get("formatted")
        if raw:
            phone = raw
            break

    # Coordinates
    geom = feature.get("geometry") or {}
    coords = geom.get("coordinates") or []
    lon, lat = (coords[0], coords[1]) if len(coords) >= 2 else (None, None)

    return Restaurant(
        name=name,
        district=district,
        address=address,
        phone=phone,
        rating=None,        # Yandex doesn't return rating in this API
        price_level=None,
        external_id_yandex=meta.get("id"),
        lat=lat,
        lon=lon,
    )


def search_restaurants(
    district: str,
    max_results: int = 15,
) -> list[Restaurant]:
    """
    Search restaurants via Yandex Maps API.
    Used as fallback when 2GIS returns insufficient results.
    """
    api_key = os.environ.get("YANDEX_MAPS_KEY")
    if not api_key:
        log.debug("YANDEX_MAPS_KEY not set — skipping Yandex search")
        return []

    coords = DISTRICT_COORDS.get(district)
    if not coords:
        return []

    lat, lon = coords
    params = {
        "text":    "ресторан",
        "ll":      f"{lon},{lat}",
        "spn":     f"{_SPAN_DEG},{_SPAN_DEG}",
        "type":    "biz",
        "lang":    "ru_RU",
        "results": max_results,
        "apikey":  api_key,
    }

    try:
        resp = httpx.get(_BASE, params=params, timeout=10.0)
        resp.raise_for_status()
    except httpx.HTTPError as e:
        log.error("Yandex request failed for district %s: %s", district, e)
        return []

    features = resp.json().get("features") or []
    restaurants: list[Restaurant] = []

    for feat in features:
        r = _item_to_restaurant(feat, district)
        if r and r.phone:
            restaurants.append(r)

    log.info("Yandex found %d restaurants in %s", len(restaurants), district)
    return restaurants
