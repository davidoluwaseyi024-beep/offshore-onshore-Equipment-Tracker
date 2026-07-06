import pytest

from conftest import CategoryFactory, SiteFactory

pytestmark = pytest.mark.django_db


class TestSoftDeleteModel:
    def test_delete_sets_flags_instead_of_removing_row(self):
        from sites.models import Site

        site = SiteFactory()
        site.delete()

        assert not Site.objects.filter(pk=site.pk).exists()
        assert Site.all_objects.filter(pk=site.pk).exists()

        reloaded = Site.all_objects.get(pk=site.pk)
        assert reloaded.is_deleted is True
        assert reloaded.deleted_at is not None

    def test_restore_clears_soft_delete_flags(self):
        from sites.models import Site

        site = SiteFactory()
        site.delete()
        reloaded = Site.all_objects.get(pk=site.pk)
        reloaded.restore()

        assert Site.objects.filter(pk=site.pk).exists()
        assert reloaded.is_deleted is False
        assert reloaded.deleted_at is None

    def test_default_manager_excludes_soft_deleted_category(self):
        from categories.models import Category

        category = CategoryFactory()
        category.delete()

        assert not Category.objects.filter(pk=category.pk).exists()
        assert Category.all_objects.filter(pk=category.pk).exists()
