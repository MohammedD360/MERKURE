#!/bin/sh
# `exec` remplace ce shell par le process uvicorn (PID 1) au lieu de le lancer
# en enfant — indispensable pour que SIGTERM (docker stop / restart) atteigne
# directement uvicorn plutôt que de rester bloqué sur le shell jusqu'au
# SIGKILL de secours.
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers "${UVICORN_WORKERS:-2}"
