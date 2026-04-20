"""
Madam Aurora — Instagram Profile Setup
- Define foto de perfil
- Define bio
"""
from instagrapi import Client
from pathlib import Path

USERNAME = 'madamauroraofficial'
PASSWORD = 'Bitcoin14@'

PROFILE_PHOTO = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/instagram/images/00_profile.png')

BIO = "✦ Your palm already has the answer.\nFree personalized reading — takes 3 minutes.\n500,000+ women have found clarity here.\n👇 Upload your palm below"

WEBSITE = "https://madam-aurora.co"

print('=== MADAM AURORA — PROFILE SETUP ===\n')

cl = Client()
cl.delay_range = [2, 5]

print('[1] Logging in...')
cl.login(USERNAME, PASSWORD)
print(f'  Logged in as: {cl.account_info().username}')

print('\n[2] Setting profile photo...')
cl.account_change_picture(PROFILE_PHOTO)
print('  Profile photo updated.')

print('\n[3] Setting bio and website...')
cl.account_edit(biography=BIO, external_url=WEBSITE)
print('  Bio updated.')

print('\n=== PROFILE SETUP DONE ===')
print(f'  Visit: https://instagram.com/{USERNAME}')
