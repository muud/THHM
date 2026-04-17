from django.shortcuts import render

def dashboard(request):
    """
    Renders the dedicated Kids Care / Immunization dashboard.
    """
    return render(request, 'immunization/dashboard.html')

def index(request):
    return render(request, 'placeholder.html')
