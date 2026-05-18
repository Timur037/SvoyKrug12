import os

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

CITY = os.getenv("MATCHING_CITY", "Москва")

MIN_GROUP_SIZE = int(os.getenv("MATCHING_MIN_GROUP_SIZE", "4"))
TARGET_GROUP_SIZE = int(os.getenv("MATCHING_TARGET_GROUP_SIZE", "5"))
MAX_GROUP_SIZE = int(os.getenv("MATCHING_MAX_GROUP_SIZE", "6"))

# Minimum Jaccard similarity to include someone in a group
HOBBY_THRESHOLD = float(os.getenv("MATCHING_HOBBY_THRESHOLD", "0.10"))

# Weights for the final pair score
HOBBY_WEIGHT = float(os.getenv("MATCHING_HOBBY_WEIGHT", "0.65"))
WORK_WEIGHT = float(os.getenv("MATCHING_WORK_WEIGHT", "0.35"))

# Users inactive longer than this are excluded
USER_INACTIVE_DAYS = int(os.getenv("MATCHING_USER_INACTIVE_DAYS", "30"))

# Users included in a match_group within this window are excluded
NO_REPEAT_GROUP_DAYS = int(os.getenv("MATCHING_NO_REPEAT_DAYS", "7"))

# Minimum people in a district to attempt matching
MIN_DISTRICT_SIZE = int(os.getenv("MATCHING_MIN_DISTRICT_SIZE", "3"))

# Maximum allowed age spread within a group (years)
MAX_AGE_DIFF = int(os.getenv("MATCHING_MAX_AGE_DIFF", "7"))

# External APIs
TWOGIS_API_KEY = os.getenv("TWOGIS_API_KEY", "")
YANDEX_MAPS_KEY = os.getenv("YANDEX_MAPS_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
