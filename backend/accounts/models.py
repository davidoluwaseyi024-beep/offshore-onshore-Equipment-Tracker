from django.contrib.auth.models import AbstractUser
from django.db import models

from core.constants import RoleChoices


class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20, choices=RoleChoices.choices, default=RoleChoices.TECHNICIAN, db_index=True
    )
    phone_number = models.CharField(max_length=30, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        indexes = [
            models.Index(fields=["role"]),
        ]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return self.get_full_name() or self.email
