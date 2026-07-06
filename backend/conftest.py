import factory
import pytest
from rest_framework.test import APIClient

from accounts.models import User
from categories.models import Category
from core.constants import RoleChoices
from equipment.models import Equipment
from sites.models import Site


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    username = factory.Sequence(lambda n: f"user{n}")
    role = RoleChoices.TECHNICIAN

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        self.set_password(extracted or "TestPass123!")
        if create:
            self.save()


class SiteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Site

    name = factory.Sequence(lambda n: f"Site {n}")
    code = factory.Sequence(lambda n: f"SITE-{n:04d}")


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f"Category {n}")


class EquipmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Equipment

    name = factory.Sequence(lambda n: f"Equipment {n}")
    serial_number = factory.Sequence(lambda n: f"SN-{n:06d}")
    category = factory.SubFactory(CategoryFactory)
    site = factory.SubFactory(SiteFactory)


@pytest.fixture
def admin_user(db):
    return UserFactory(role=RoleChoices.ADMIN, email="admin@example.com")


@pytest.fixture
def engineer_user(db):
    return UserFactory(role=RoleChoices.ENGINEER, email="engineer@example.com")


@pytest.fixture
def technician_user(db):
    return UserFactory(role=RoleChoices.TECHNICIAN, email="technician@example.com")


@pytest.fixture
def api_client():
    return APIClient()


def _authed_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def admin_client(admin_user):
    return _authed_client(admin_user)


@pytest.fixture
def engineer_client(engineer_user):
    return _authed_client(engineer_user)


@pytest.fixture
def technician_client(technician_user):
    return _authed_client(technician_user)
