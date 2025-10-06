
# Wizjonerka — demo-ready

To jest wersja demo przygotowana aby wyglądać i działać jak GIF pokazowy. Pełna interaktywna aplikacja frontend (HTML/CSS/JS) — bez serwera, dane w localStorage.

## Uruchomienie lokalne
1. Rozpakuj ZIP.
2. Otwórz `index.html` w przeglądarce (Chrome/Edge/Firefox). Dla najlepszych wyników użyj Live Server (VSCode).

## GitHub Pages
1. Stwórz repo `wizjonerka` i wrzuć zawartość folderu do gałęzi `main`.
2. W ustawieniach repo: Settings → Pages → Source → wybierz branch `main` i folder `/ (root)`.
3. Po publikacji aplikacja będzie dostępna pod `https://twojanazwa.github.io/wizjonerka/`

## Co zawiera
- pełne komponenty: tasks, payments, health, ideas, growth
- manualny przełącznik trybu ciemnego (zapamiętywany w localStorage)
- eksport/import JSON, QR generator, powiadomienia przeglądarkowe
- styl zgodny z GIF: pastelowa tęcza, delikatny szum, ładne modale

Jeśli chcesz, mogę też:
- dodać `manifest.json` + service worker by uczynić PWA (instalowalną),
- lub wrzucić paczkę bezpośrednio do Twojego repo (jeśli podasz uprawnienia).
