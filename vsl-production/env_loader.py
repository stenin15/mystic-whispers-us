# -*- coding: utf-8 -*-
"""Carregador de variaveis de ambiente compartilhado (sem dependencias externas).

Le o arquivo vsl-production/.env (se existir) e popula os.environ.
Variaveis ja definidas no ambiente tem prioridade sobre o .env.

Uso (scripts na raiz de vsl-production/):
    from env_loader import require_env
    OPENAI_API_KEY = require_env("OPENAI_API_KEY")

Uso (scripts em subpastas, ex. instagram/ ou pet_clipper/):
    import os, sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from env_loader import require_env
"""
import os

_ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
_loaded = False


def load_env(path=_ENV_PATH):
    """Le um .env simples (linhas KEY=VALUE, comentarios com #) e popula os.environ."""
    global _loaded
    if _loaded:
        return
    _loaded = True
    if not os.path.isfile(path):
        return
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip("'").strip('"')
            if key and key not in os.environ:
                os.environ[key] = value


def require_env(name):
    """Retorna o valor da env var ou aborta com mensagem clara."""
    load_env()
    value = os.environ.get(name, "")
    if not value:
        raise SystemExit(f"Defina {name} no ambiente ou no arquivo vsl-production/.env")
    return value
