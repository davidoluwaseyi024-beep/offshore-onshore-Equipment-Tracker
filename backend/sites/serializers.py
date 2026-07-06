from rest_framework import serializers

from sites.models import Site


class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = [
            "id",
            "name",
            "code",
            "address",
            "city",
            "state_region",
            "country",
            "latitude",
            "longitude",
            "is_active",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "updated_by", "created_at", "updated_at"]
