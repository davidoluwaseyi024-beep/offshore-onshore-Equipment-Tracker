import pytest
from django.db import IntegrityError, transaction

from conftest import CategoryFactory, EquipmentFactory, SiteFactory
from equipment.models import Equipment

pytestmark = pytest.mark.django_db


class TestEquipmentConstraints:
    def test_serial_number_must_be_unique(self):
        EquipmentFactory(serial_number="SN-DUPLICATE")
        with pytest.raises(IntegrityError), transaction.atomic():
            EquipmentFactory(serial_number="SN-DUPLICATE")

    def test_qr_code_allows_multiple_nulls(self):
        EquipmentFactory(qr_code=None)
        EquipmentFactory(qr_code=None)  # must not raise — NULLs don't collide under a unique index

        assert Equipment.objects.filter(qr_code__isnull=True).count() == 2

    def test_negative_purchase_cost_is_rejected_at_db_level(self):
        with pytest.raises(IntegrityError), transaction.atomic():
            EquipmentFactory(purchase_cost=-100)

    def test_default_status_is_active(self):
        equipment = EquipmentFactory()
        assert equipment.status == "active"

    def test_soft_deleted_equipment_excluded_from_default_manager(self):
        equipment = EquipmentFactory()
        equipment.delete()
        assert not Equipment.objects.filter(pk=equipment.pk).exists()
        assert Equipment.all_objects.filter(pk=equipment.pk).exists()
