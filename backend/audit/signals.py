"""
Generic post_delete safety-net handler. Apps that want deletions which
bypass their service layer (Django admin bulk actions, management
commands, a direct ORM `.delete()` in a shell) to still be captured
connect this handler themselves, e.g.:

    from django.db.models.signals import post_delete
    from audit.signals import log_delete_safety_net

    post_delete.connect(log_delete_safety_net, sender=Equipment)

This is intentionally opt-in per model (rather than global) so `audit`
never has to import models from other apps, keeping it a leaf dependency
that everything else can call into without a circular import.
"""

from audit.models import ActionChoices, AuditLog
from django.contrib.contenttypes.models import ContentType


def log_delete_safety_net(sender, instance, **kwargs):
    AuditLog.objects.create(
        actor=None,
        action=ActionChoices.DELETE,
        content_type=ContentType.objects.get_for_model(sender),
        object_id=str(instance.pk),
        object_repr=f"{instance} (deleted outside service layer)",
        changes={},
    )
