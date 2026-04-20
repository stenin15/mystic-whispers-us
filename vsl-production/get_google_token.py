"""
Gera refresh_token do Google Ads OAuth2
"""
from google_auth_oauthlib.flow import InstalledAppFlow
import socket

CLIENT_ID = "801114172685-evljiisrm6o0cqlqm3ogcqnde13f9jf9.apps.googleusercontent.com"
CLIENT_SECRET = "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"

client_config = {
    "installed": {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uris": ["http://localhost"],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }
}

SCOPES = ["https://www.googleapis.com/auth/adwords"]

# Achar porta livre
def free_port():
    for p in [8081, 8082, 8083, 9090, 9191]:
        with socket.socket() as s:
            if s.connect_ex(("localhost", p)) != 0:
                return p
    return 8084

port = free_port()
print(f"Usando porta {port}...")

flow = InstalledAppFlow.from_client_config(client_config, scopes=SCOPES)
credentials = flow.run_local_server(
    port=port,
    prompt="consent",
    access_type="offline",
    open_browser=True,
)

print("\n" + "="*60)
print("REFRESH TOKEN (copie este valor):")
print(credentials.refresh_token)
print("="*60)
