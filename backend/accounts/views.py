from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from accounts import services
from accounts.jwt_serializers import RoleTokenObtainPairSerializer
from accounts.permissions import UserManagementPermission
from accounts.serializers import (
    ChangePasswordSerializer,
    MeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserCreateSerializer,
    UserSerializer,
)
from accounts.filters import UserFilterSet
from audit.models import ActionChoices
from audit.services import AuditService
from core.pagination import StandardPageNumberPagination

User = get_user_model()


def _set_refresh_cookie(response, refresh_token: str):
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=str(refresh_token),
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        httponly=True,
        secure=settings.REFRESH_COOKIE_SECURE,
        samesite=settings.REFRESH_COOKIE_SAMESITE,
        path="/api/v1/auth/",
    )


class LoginView(TokenObtainPairView):
    """
    POST credentials in. On success: access token in the JSON body, refresh
    token set as an httpOnly cookie (never exposed to JS), plus the user's
    profile/role so the frontend can hydrate auth state in one round trip.
    """

    serializer_class = RoleTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        access = serializer.validated_data["access"]
        refresh = serializer.validated_data["refresh"]

        AuditService.log(
            actor=serializer.user,
            action=ActionChoices.LOGIN,
            target=serializer.user,
            ip_address=AuditService.request_meta(request)[0],
            user_agent=AuditService.request_meta(request)[1],
        )

        response = Response(
            {"access": str(access), "user": MeSerializer(serializer.user).data},
            status=status.HTTP_200_OK,
        )
        _set_refresh_cookie(response, refresh)
        return response


class RegisterView(APIView):
    """
    Public self-registration for staff (engineers/technicians) and admins
    alike — any account created here starts as `technician`; an existing
    Admin promotes it afterward from Users & Roles. On success, logs the
    new account straight in (same token/cookie shape as LoginView) so
    there's no separate "now go log in" step.
    """

    permission_classes = []
    throttle_scope = "register"

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = services.register_user(serializer=serializer, request=request)

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        response = Response(
            {"access": str(access), "user": MeSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )
        _set_refresh_cookie(response, refresh)
        return response


class PasswordResetRequestView(APIView):
    """
    Always responds the same way regardless of whether the email matches an
    account — see accounts.services.request_password_reset for why.
    """

    permission_classes = []
    throttle_scope = "password_reset"

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.request_password_reset(email=serializer.validated_data["email"], request=request)
        return Response(
            {"detail": "If an account exists for that email, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = []
    throttle_scope = "password_reset"

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.confirm_password_reset(
            uid=serializer.validated_data["uid"],
            token=serializer.validated_data["token"],
            new_password=serializer.validated_data["new_password"],
            request=request,
        )
        return Response({"detail": "Password reset successfully."}, status=status.HTTP_200_OK)


class RefreshView(APIView):
    """Reads the refresh token from the httpOnly cookie, never from the request body."""

    permission_classes = []

    def post(self, request, *args, **kwargs):
        raw_token = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if not raw_token:
            raise InvalidToken("No refresh token cookie present.")

        try:
            refresh = RefreshToken(raw_token)
        except TokenError as exc:
            raise InvalidToken(str(exc)) from exc

        access = refresh.access_token
        response = Response({"access": str(access)}, status=status.HTTP_200_OK)

        if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
            user = User.objects.get(pk=refresh.payload["user_id"])
            if settings.SIMPLE_JWT.get("BLACKLIST_AFTER_ROTATION"):
                try:
                    refresh.blacklist()
                except AttributeError:
                    pass
            new_refresh = RefreshToken.for_user(user)
            _set_refresh_cookie(response, new_refresh)
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        raw_token = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if raw_token:
            try:
                RefreshToken(raw_token).blacklist()
            except (TokenError, AttributeError):
                pass

        AuditService.log(
            actor=request.user,
            action=ActionChoices.LOGOUT,
            target=request.user,
            ip_address=AuditService.request_meta(request)[0],
            user_agent=AuditService.request_meta(request)[1],
        )

        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(settings.REFRESH_COOKIE_NAME, path="/api/v1/auth/")
        return response


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MeSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class RolesView(APIView):
    """Read-only list of role choices. Roles are a fixed enum, not a CRUD table."""

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from core.constants import RoleChoices

        return Response([{"value": value, "label": label} for value, label in RoleChoices.choices])


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("email")
    permission_classes = [UserManagementPermission]
    pagination_class = StandardPageNumberPagination
    filterset_class = UserFilterSet
    search_fields = ["email", "username", "first_name", "last_name"]
    ordering_fields = ["email", "date_joined", "role"]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        services.create_user(serializer=serializer, actor=self.request.user, request=self.request)

    def perform_update(self, serializer):
        services.update_user(serializer=serializer, actor=self.request.user, request=self.request)

    def perform_destroy(self, instance):
        services.deactivate_user(user=instance, actor=self.request.user, request=self.request)
