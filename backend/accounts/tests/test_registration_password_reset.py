import pytest
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from audit.models import ActionChoices, AuditLog
from conftest import UserFactory
from core.constants import RoleChoices

pytestmark = pytest.mark.django_db


class TestRegister:
    def test_register_creates_technician_regardless_of_requested_role(self, api_client):
        response = api_client.post(
            reverse("auth-register"),
            {
                "email": "newstaff@example.com",
                "username": "newstaff",
                "password": "SuperSecret123!",
                "role": "admin",  # not a real field on RegisterSerializer — must be silently ignored
            },
        )

        assert response.status_code == 201
        assert response.data["user"]["role"] == "technician"
        assert "access" in response.data
        assert "refresh_token" in response.cookies

    def test_register_logs_the_new_account_in(self, api_client):
        response = api_client.post(
            reverse("auth-register"),
            {"email": "newstaff2@example.com", "username": "newstaff2", "password": "SuperSecret123!"},
        )
        me = api_client.get(reverse("auth-me"), HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        assert me.status_code == 200
        assert me.data["email"] == "newstaff2@example.com"

    def test_register_rejects_duplicate_email(self, api_client):
        UserFactory(email="taken@example.com")

        response = api_client.post(
            reverse("auth-register"),
            {"email": "taken@example.com", "username": "someoneelse", "password": "SuperSecret123!"},
        )

        assert response.status_code == 400

    def test_register_rejects_weak_password(self, api_client):
        response = api_client.post(
            reverse("auth-register"),
            {"email": "weak@example.com", "username": "weakpw", "password": "12345678"},
        )
        assert response.status_code == 400

    def test_register_writes_audit_log_entry(self, api_client):
        response = api_client.post(
            reverse("auth-register"),
            {"email": "audited@example.com", "username": "audited", "password": "SuperSecret123!"},
        )
        user_id = response.data["user"]["id"]

        log = AuditLog.objects.get(action=ActionChoices.REGISTER, object_id=str(user_id))
        assert log.actor_id == user_id


class TestPasswordResetRequest:
    def test_existing_user_receives_reset_email(self, api_client):
        user = UserFactory(email="resetme@example.com")

        response = api_client.post(reverse("auth-password-reset"), {"email": user.email})

        assert response.status_code == 200
        assert len(mail.outbox) == 1
        assert user.email in mail.outbox[0].to
        assert "reset-password?uid=" in mail.outbox[0].body

    def test_unknown_email_still_returns_200_and_sends_nothing(self, api_client):
        response = api_client.post(reverse("auth-password-reset"), {"email": "nobody@example.com"})

        assert response.status_code == 200
        assert len(mail.outbox) == 0


class TestPasswordResetConfirm:
    def _build_link_params(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        return uid, token

    def test_valid_token_resets_password(self, api_client):
        user = UserFactory(email="confirmreset@example.com", password="OldPassword123!")
        uid, token = self._build_link_params(user)

        response = api_client.post(
            reverse("auth-password-reset-confirm"),
            {"uid": uid, "token": token, "new_password": "BrandNewPassword456!"},
        )
        assert response.status_code == 200

        login = api_client.post(
            reverse("auth-login"), {"email": user.email, "password": "BrandNewPassword456!"}
        )
        assert login.status_code == 200

    def test_valid_token_writes_audit_log(self, api_client):
        user = UserFactory(email="confirmaudit@example.com")
        uid, token = self._build_link_params(user)

        api_client.post(
            reverse("auth-password-reset-confirm"),
            {"uid": uid, "token": token, "new_password": "BrandNewPassword456!"},
        )

        assert AuditLog.objects.filter(action=ActionChoices.PASSWORD_RESET, object_id=str(user.pk)).exists()

    def test_token_cannot_be_reused(self, api_client):
        user = UserFactory(email="reuse@example.com")
        uid, token = self._build_link_params(user)

        first = api_client.post(
            reverse("auth-password-reset-confirm"),
            {"uid": uid, "token": token, "new_password": "FirstNewPassword1!"},
        )
        assert first.status_code == 200

        second = api_client.post(
            reverse("auth-password-reset-confirm"),
            {"uid": uid, "token": token, "new_password": "SecondNewPassword2!"},
        )
        assert second.status_code == 400

    def test_invalid_token_rejected(self, api_client):
        user = UserFactory(email="badtoken@example.com")
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        response = api_client.post(
            reverse("auth-password-reset-confirm"),
            {"uid": uid, "token": "not-a-real-token", "new_password": "WhateverPassword1!"},
        )
        assert response.status_code == 400

    def test_invalid_uid_rejected(self, api_client):
        response = api_client.post(
            reverse("auth-password-reset-confirm"),
            {"uid": "not-valid-base64", "token": "irrelevant", "new_password": "WhateverPassword1!"},
        )
        assert response.status_code == 400
