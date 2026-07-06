from django.db import models


class RoleChoices(models.TextChoices):
    ADMIN = "admin", "Admin"
    ENGINEER = "engineer", "Engineer"
    TECHNICIAN = "technician", "Technician"
