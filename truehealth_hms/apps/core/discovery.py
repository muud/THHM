from django.http import JsonResponse
from django.conf import settings
import socket

def get_server_info(request):
    # Try to get ngrok URL if it exists in settings or environment
    # In a real setup, we might hit the ngrok API (localhost:4040/api/tunnels)
    
    server_info = {
        "local_ip": socket.gethostbyname(socket.gethostname()),
        "port": 8000, # Default django port
        "is_debug": settings.DEBUG,
    }
    
    # Check for ngrok-free.dev in the request host
    host = request.get_host()
    if 'ngrok-free.dev' in host or 'ngrok.io' in host:
        server_info["current_url"] = f"https://{host}"
    else:
        server_info["current_url"] = f"http://{host}"
        
    return JsonResponse(server_info)
