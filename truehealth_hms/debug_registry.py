import os
import sys
import django
from django.apps import apps
from django.apps.registry import Apps
import traceback

# Monkeypatch populate to catch re-entrant calls
original_populate = Apps.populate
in_populate = False

def patched_populate(self, installed_apps=None):
    global in_populate
    if in_populate:
        print("\n" + "!" * 80)
        print("RE-ENTRANT POPULATE DETECTED!")
        print("!" * 80 + "\n")
        traceback.print_stack()
        # Raise the error as usual to stop execution
        original_populate(self, installed_apps)
    
    in_populate = True
    try:
        return original_populate(self, installed_apps)
    finally:
        in_populate = False

Apps.populate = patched_populate

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    print("Attempting django.setup()...")
    try:
        django.setup()
        print("Success! Django is ready.")
    except Exception as e:
        print(f"\nCaught the error: {e}")

if __name__ == '__main__':
    main()
