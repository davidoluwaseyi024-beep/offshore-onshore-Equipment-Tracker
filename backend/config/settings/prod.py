from config.settings.base import *  # noqa: F401,F403
from config.settings.base import env

DEBUG = False
import requests

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")  + [".elb.amazonaws.com"]

try:
    token = requests.put(
        'http://169.254.169.254/latest/api/token',
        headers={'X-aws-ec2-metadata-token-ttl-seconds': '21600'},
        timeout=1
    ).text

    local_ip = requests.get(
        'http://169.254.169.254/latest/meta-data/local-ipv4',
        headers={'X-aws-ec2-metadata-token': token},
        timeout=1
    ).text
    ALLOWED_HOSTS.append(local_ip)

    # Also allow the instance's public IP — the health checker/agent
    # sometimes hits the instance directly over its public address.
    try:
        public_ip = requests.get(
            'http://169.254.169.254/latest/meta-data/public-ipv4',
            headers={'X-aws-ec2-metadata-token': token},
            timeout=1
        ).text
        if public_ip:
            ALLOWED_HOSTS.append(public_ip)
    except requests.exceptions.RequestException:
        pass

except requests.exceptions.RequestException:
    pass

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", default=True)
CSRF_COOKIE_SECURE = env.bool("CSRF_COOKIE_SECURE", default=True)
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")  # noqa: F405

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
