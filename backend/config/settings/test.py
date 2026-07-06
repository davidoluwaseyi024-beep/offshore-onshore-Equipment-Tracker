from config.settings.base import *  # noqa: F401,F403
from config.settings.base import REST_FRAMEWORK

DEBUG = False

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# Django's test runner already creates/uses a "test_<NAME>" database
# automatically — no manual renaming needed here.

MEDIA_ROOT = BASE_DIR / "test_media"  # noqa: F405

# Throttling is a shared-cache concern (DRF's ScopedRateThrottle keys off
# the test client's "IP"), so without this, unrelated tests hitting the
# same endpoint in quick succession start tripping 429s on each other.
# Testing throttle behavior itself belongs in a dedicated test using
# `@override_settings`, not as ambient state for the whole suite.
REST_FRAMEWORK = {**REST_FRAMEWORK, "DEFAULT_THROTTLE_CLASSES": []}
