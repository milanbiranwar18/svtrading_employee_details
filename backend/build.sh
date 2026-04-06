#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

if [[ -n "${DJANGO_SUPERUSER_PASSWORD}" ]]; then
    echo "Processing superuser..."
    python manage.py reset_admin_password
fi
