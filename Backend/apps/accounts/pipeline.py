# Add this to your apps/accounts/pipeline.py (create this file)
from django.contrib.auth import get_user_model

def link_existing_user(backend, user=None, *args, **kwargs):
    """
    Links social account to existing user if one exists with the same email.
    """
    if user:
        return {'user': user}
        
    email = kwargs.get('details', {}).get('email')
    if email:
        User = get_user_model()
        try:
            existing_user = User.objects.get(email=email)
            # Mark that this was not a new creation, for our callback view
            existing_user._newly_created = False
            return {'user': existing_user}
        except User.DoesNotExist:
            # If we get here, a new user will be created
            pass
    
    # Mark any newly created user
    if kwargs.get('is_new', False) and kwargs.get('user'):
        kwargs['user']._newly_created = True
        
    return {}