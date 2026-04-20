"""
Login com resolução de challenge por email
"""
from instagrapi import Client
from instagrapi.exceptions import ChallengeRequired
from pathlib import Path

USERNAME = 'madamauroraofficial'
PASSWORD = 'Bitcoin14@'

PROFILE_PHOTO = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/instagram/images/00_profile.png')
BIO = "✦ Your palm already has the answer.\nFree personalized reading — takes 3 minutes.\n500,000+ women have found clarity here.\n👇 Upload your palm below"
WEBSITE = "https://madam-aurora.co"

def challenge_code_handler(username, choice):
    print(f'\n  Instagram enviou um codigo para: {choice}')
    code = input('  Cole o codigo aqui: ')
    return code

cl = Client()
cl.delay_range = [2, 5]
cl.challenge_code_handler = challenge_code_handler

print('=== LOGIN ===')
try:
    cl.login(USERNAME, PASSWORD)
except ChallengeRequired:
    print('  Challenge detectado, resolvendo...')
    cl.challenge_resolve(cl.last_json)

print(f'  OK - logado como @{cl.account_info().username}')

# Salva sessao pra nao precisar logar de novo
cl.dump_settings('session.json')
print('  Sessao salva em session.json')

print('\n=== CONFIGURANDO PERFIL ===')

print('[1] Foto de perfil...')
cl.account_change_picture(PROFILE_PHOTO)
print('  OK')

print('[2] Bio e website...')
cl.account_edit(biography=BIO, external_url=WEBSITE)
print('  OK')

print('\n=== PERFIL CONFIGURADO ===')
print(f'  https://instagram.com/{USERNAME}')
