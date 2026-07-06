from rest_framework import viewsets

from core.services import create_with_audit, soft_delete_with_audit, update_with_audit


class AuditedModelViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet for simple CRUD resources that use the soft-delete +
    audit-log pattern. Subclasses declare `tracked_fields` (the model
    fields whose changes should appear in the audit diff). Custom,
    non-CRUD actions (status changes, assignment return, etc.) are not
    covered by this base — they call AuditService explicitly from their
    own service functions, since they aren't plain create/update/delete.
    """

    tracked_fields: list[str] = []

    def perform_create(self, serializer):
        create_with_audit(
            serializer=serializer,
            actor=self.request.user,
            request=self.request,
            tracked_fields=self.tracked_fields,
        )

    def perform_update(self, serializer):
        update_with_audit(
            serializer=serializer,
            actor=self.request.user,
            request=self.request,
            tracked_fields=self.tracked_fields,
        )

    def perform_destroy(self, instance):
        soft_delete_with_audit(instance=instance, actor=self.request.user, request=self.request)
