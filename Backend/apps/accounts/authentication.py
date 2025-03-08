from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from bson import ObjectId
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.settings import api_settings
import logging

logger = logging.getLogger(__name__)

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        User = get_user_model()
        try:
            user_id_claim = api_settings.USER_ID_CLAIM
            user_id_value = validated_token[user_id_claim]
            logger.debug("Token user_id (raw): %s", user_id_value)
            if isinstance(user_id_value, int) or (isinstance(user_id_value, str) and user_id_value.isdigit()):
                user_id = int(user_id_value)
            else:
                user_id = ObjectId(user_id_value)
        except Exception as e:
            raise AuthenticationFailed('User id is invalid: ' + str(e), code='user_id_invalid')
        try:
            user = User.objects.get(id=user_id)
            logger.debug("Found user: %s", user)
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found', code='user_not_found')
        return user







