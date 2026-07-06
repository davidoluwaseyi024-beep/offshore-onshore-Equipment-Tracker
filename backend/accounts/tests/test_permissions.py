import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db


class TestUserManagementPermission:
    def test_technician_cannot_list_users(self, technician_client):
        response = technician_client.get(reverse("user-list"))
        assert response.status_code == 403

    def test_engineer_can_read_but_not_write_users(self, engineer_client):
        list_response = engineer_client.get(reverse("user-list"))
        assert list_response.status_code == 200

        create_response = engineer_client.post(
            reverse("user-list"),
            {"email": "new@example.com", "username": "newuser", "password": "TestPass123!", "role": "technician"},
        )
        assert create_response.status_code == 403

    def test_admin_can_create_user(self, admin_client):
        response = admin_client.post(
            reverse("user-list"),
            {"email": "new@example.com", "username": "newuser", "password": "TestPass123!", "role": "technician"},
        )
        assert response.status_code == 201
