from django.shortcuts import render

def dashboard(request):
    """
    Renders the Hospital Management (Main) Dashboard.
    """
    return render(request, 'staff/dashboard.html')
