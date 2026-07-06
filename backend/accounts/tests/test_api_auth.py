import pytest
from django.urls import reverse

from conftest import UserFactory
from core.constants import RoleChoices

pytestmark = pytest.mark.django_db


class TestLogin:
    def test_login_returns_access_token_and_sets_refresh_cookie(self, api_client):
        UserFactory(email="pilot@example.com", role=RoleChoices.ENGINEER, password="CorrectHorse123!")

        response = api_client.post(
            reverse("auth-login"), {"email": "pilot@example.com", "password": "CorrectHorse123!"}
        )

        assert response.status_code == 200
        assert "access" in response.data
        assert response.data["user"]["role"] == "engineer"
        assert "refresh_token" in response.cookies
        assert response.cookies["refresh_token"]["httponly"]

    def test_login_rejects_wrong_password(self, api_client):
        UserFactory(email="pilot@example.com", password="CorrectHorse123!")

        response = api_client.post(reverse("auth-login"), {"email": "pilot@example.com", "password": "wrong"})

        assert response.status_code == 401

    def test_me_endpoint_requires_authentication(self, api_client):
        response = api_client.get(reverse("auth-me"))
        assert response.status_code == 401

    def test_me_endpoint_returns_current_user(self, technician_client, technician_user):
        response = technician_client.get(reverse("auth-me"))
        assert response.status_code == 200
        assert response.data["email"] == technician_user.email
