from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Embeds the user's role in the JWT so the frontend can read it without an extra call."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token
