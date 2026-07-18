import time
import logging

logger = logging.getLogger("request_timing")


class RequestTimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.monotonic()
        response = self.get_response(request)
        duration_ms = round((time.monotonic() - start_time) * 1000, 2)

        logger.info(
            "REQUEST_TIMING path=%s method=%s status=%s duration_ms=%s",
            request.path,
            request.method,
            response.status_code,
            duration_ms,
        )
        return response
