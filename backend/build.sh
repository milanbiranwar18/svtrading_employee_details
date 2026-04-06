#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser from environment variables if they are provided
# The '|| true' part ensures the build doesn't fail if the user already exists
if [[ -n "${DJANGO_SUPERUSER_PASSWORD}" ]]; then
    echo "Creating superuser..."
    python manage.py createsuperuser --noinput --username admin --email admin@example.com || true
fi
