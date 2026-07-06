from config.settings.base import *  # noqa: F401,F403
from config.settings.base import env

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Defaults to the console backend (emails print to the terminal, nothing
# ever reaches a real SMTP server) unless EMAIL_BACKEND is explicitly set in
# .env — that's the opt-in for testing real delivery from local dev.
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
