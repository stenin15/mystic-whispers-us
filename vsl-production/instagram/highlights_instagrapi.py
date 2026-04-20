# -*- coding: utf-8 -*-
"""
Posta stories + cria highlights via instagrapi (API mobile nativa).
Muito mais confiavel que Playwright para esta tarefa.
"""
import sys, time
from pathlib import Path
from instagrapi import Client

sys.stdout.reconfigure(encoding='utf-8')

USERNAME = 'madamauroraofficial'
PASSWORD = 'w89u.?kEWuGizhz'
BASE     = Path('C:/Users/Stenio/Documents/mystic-whispers-us/vsl-production/instagram')
STORIES  = BASE / 'stories'

HIGHLIGHTS = [
    ("Free Read",    ["fr01_cta_link.png", "fr02_how_it_works.png", "fr03_what_you_get.png"]),
    ("Results",      ["re01_sarah.png", "re02_dana.png", "re03_rachel.png", "re04_500k.png"]),
    ("Palm Lines",   ["pl01_heart_line.png", "pl02_head_line.png", "pl03_life_line.png", "pl04_fate_line.png"]),
    ("About Aurora", ["ab01_who.png", "ab02_why_palm.png", "ab03_mission.png"]),
    ("FAQ",          ["fq01_is_it_real.png", "fq02_how_does_it_work.png", "fq03_really_free.png", "fq04_skeptic.png"]),
]


def main():
    cl = Client()
    cl.delay_range = [2, 5]  # delay humano entre acoes

    print('Fazendo login...')
    try:
        cl.login(USERNAME, PASSWORD)
        print(f'Login OK — {cl.user_id}')
    except Exception as e:
        print(f'ERR login: {e}')
        return

    hl_ok = 0

    for hl_name, story_files in HIGHLIGHTS:
        print(f'\n=== {hl_name} ===')
        story_pks = []

        for fname in story_files:
            img = STORIES / fname
            if not img.exists():
                print(f'  SKIP: {fname} nao encontrado')
                continue

            print(f'  Postando story: {fname}')
            try:
                media = cl.photo_upload_to_story(str(img))
                story_pks.append(media.pk)
                print(f'    OK — pk={media.pk}')
                time.sleep(3)
            except Exception as e:
                print(f'    ERR: {e}')

        if not story_pks:
            print(f'  Nenhuma story postada, pulando highlight')
            continue

        print(f'  Criando highlight "{hl_name}" com {len(story_pks)} stories...')
        try:
            hl = cl.highlight_create(hl_name, story_pks)
            print(f'  Highlight criado! id={hl.pk}')
            hl_ok += 1
        except Exception as e:
            print(f'  ERR highlight: {e}')
            # Tenta metodo alternativo
            try:
                # Espera um momento e tenta novamente
                time.sleep(5)
                hl = cl.highlight_create(hl_name, story_pks)
                print(f'  Highlight criado (retry)! id={hl.pk}')
                hl_ok += 1
            except Exception as e2:
                print(f'  ERR retry: {e2}')

        time.sleep(5)

    print(f'\n=== {hl_ok}/{len(HIGHLIGHTS)} highlights criados ===')

    if hl_ok == len(HIGHLIGHTS):
        print('\nInstagram COMPLETO!')
        print('Acao manual restante: fixar 3 posts no perfil (celular, 2 min)')
    else:
        print('\nAlguns highlights falharam — tente criar manualmente no celular')


if __name__ == '__main__':
    main()
