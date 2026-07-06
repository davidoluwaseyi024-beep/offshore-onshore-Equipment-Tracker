from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import User

ROLE_GROUP_NAMES = {
    "admin": "Admin",
    "engineer": "Engineer",
    "technician": "Technician",
}


@receiver(post_save, sender=User)
def sync_role_to_group(sender, instance, **kwargs):
    """
    Mirrors `User.role` onto a matching Django Group so the Django admin
    site and any code using django.contrib.auth's group/permission
    machinery stays consistent with the role field, which is the source
    of truth for application-level permission checks.
    """
    group_name = ROLE_GROUP_NAMES.get(instance.role)
    if not group_name:
        return
    group, _ = Group.objects.get_or_create(name=group_name)
    other_groups = Group.objects.filter(name__in=ROLE_GROUP_NAMES.values()).exclude(pk=group.pk)
    instance.groups.remove(*other_groups)
    instance.groups.add(group)
