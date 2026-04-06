import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Forcefully reset the superuser password using DJANGO_SUPERUSER_PASSWORD env variable."

    def handle(self, *args, **options):
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
        username = "admin"
        email = "admin@example.com"

        if not password:
            self.stdout.write(self.style.WARNING("DJANGO_SUPERUSER_PASSWORD is not set. Skipping password reset."))
            return

        User = get_user_model()
        
        # Get or create the user
        user = User.objects.filter(username=username).first()
        
        if user:
            self.stdout.write(f"Found existing user: {username}. Resetting password...")
            user.set_password(password)
            user.is_superuser = True
            user.is_staff = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Password for user '{username}' has been forcefully reset."))
        else:
            self.stdout.write(f"User '{username}' not found. Creating new superuser...")
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created successfully with provided password."))
