from django.shortcuts import render

def dashboard(request):
    """
    Renders the dedicated maternity dashboard.
    """
    return render(request, 'maternity/dashboard.html')

def index(request):
    return render(request, 'placeholder.html')
