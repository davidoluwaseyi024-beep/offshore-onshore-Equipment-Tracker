from django.db import models
from django.utils.text import slugify

from core.models import SoftDeleteModel, TimeStampedModel, UserStampedModel


class Category(TimeStampedModel, SoftDeleteModel, UserStampedModel):
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    parent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.PROTECT, related_name="children"
    )
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"
        indexes = [models.Index(fields=["parent"])]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
