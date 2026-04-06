#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser from environment variables if they are provided
if [[ -n "${DJANGO_SUPERUSER_PASSWORD}" ]]; then
    echo "Creating superuser..."
    python manage.py createsuperuser --noinput --username admin --email admin@example.com || true

    echo "Updating admin password to ensure it matches the environment variable..."
    python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); u = User.objects.filter(username='admin').first(); u.set_password('${DJANGO_SUPERUSER_PASSWORD}'); u.save(); print('Password updated successfully.')" || true
fi
