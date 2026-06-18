# TODO App

A full-stack TODO application with a FastAPI backend and a static HTML/CSS frontend.

## Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| API      | Python, FastAPI         |
| SOAP     | Python, spyne (SOAP 1.1)|
| Frontend | HTML, Tailwind CSS      |

## Project structure

```
├── api/
│   ├── main.py               # FastAPI TODO API (REST)
│   ├── soap_calculator.py    # SOAP Calculator service
│   └── requirements.txt
└── frontend/
    ├── login.html            # Login screen
    ├── dashboard.html        # Main task dashboard (includes calculator widget)
    ├── edit-task.html        # Edit task screen
    ├── task-detail.html      # Task detail screen (read-only)
    └── calculator.html       # Full SOAP calculator page
```

## Setup

### 1. Install Python dependencies

```bash
pip install -r api/requirements.txt
# nebo pokud pip nefunguje
pip3 install -r api/requirements.txt
```

### 2. Configure environment

Vytvoř soubor `.env` v adresáři `api/`:

```bash
cp api/.env.example api/.env
```

Otevři `api/.env` a nastav přihlašovací údaje:

```
API_USERNAME=your-username
API_PASSWORD=your-password
```

Soubor `.env` je gitignorován a nikdy se necommituje.

### 3. Install Task

Projekt používá [Task](https://taskfile.dev) jako task runner. Instalace:

```bash
# macOS
brew install go-task

# Windows
winget install Task.Task

# Linux
sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin
```

## Running the project

### 1. Spusť API + SOAP service

```bash
task be-up
```

REST API běží na `http://localhost:8000`, SOAP Calculator na `http://localhost:8001`.

### 2. Spusť frontend

```bash
task fe-up
```

Frontend běží na `http://localhost:3000`. Dostupné obrazovky:

```
http://localhost:3000/login.html        ← login screen
http://localhost:3000/dashboard.html    ← task dashboard (+ calculator widget)
http://localhost:3000/edit-task.html    ← edit task
http://localhost:3000/task-detail.html  ← task detail (read-only)
http://localhost:3000/calculator.html   ← SOAP calculator
```

### Zastavení API

```bash
task be-down
```

## Taskfile commands

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `task be-up`    | Spustí FastAPI backend + SOAP Calculator     |
| `task be-down`  | Zastaví FastAPI backend + SOAP Calculator    |
| `task soap-up`  | Spustí pouze SOAP Calculator (port 8001)     |
| `task soap-down`| Zastaví SOAP Calculator                      |
| `task fe-up`    | Spustí frontend server                       |
| `task fe-down`  | Zastaví frontend server                      |
| `task restart`  | Restartuje API (clean + be-up)               |
| `task clean`    | Smaže Python cache soubory                   |

## SOAP Calculator service

Projekt obsahuje SOAP 1.1 kalkulačkovou službu postavenou na knihovně [spyne](https://spyne.io). Slouží jako ukázka a testovací prostředí pro SOAP protokol.

**Dostupné operace:** `Add`, `Subtract`, `Multiply`, `Divide` (vstup i výstup: `Float`)

| URL                              | Popis                     |
| -------------------------------- | ------------------------- |
| `http://localhost:8001`          | SOAP endpoint             |
| `http://localhost:8001/?wsdl`    | WSDL definice             |

### Testování v SoapUI

1. Otevři SoapUI → **New SOAP Project**
2. WSDL: `http://localhost:8001/?wsdl`
3. Vyber operaci a odešli request

### Testování v Postman

1. New request → **POST** `http://localhost:8001`
2. Header: `Content-Type: text/xml`
3. Body (raw XML):

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
  <soap-env:Body>
    <tns:Add xmlns:tns="chronos.calculator">
      <tns:a>10</tns:a>
      <tns:b>5</tns:b>
    </tns:Add>
  </soap-env:Body>
</soap-env:Envelope>
```

Kalkulačka je také dostupná jako widget na dashboardu a jako plná stránka na `http://localhost:3000/calculator.html`.

## API dokumentace

Swagger UI je dostupný na `http://localhost:8000/docs` po spuštění API. Je chráněn stejnou Basic Auth jako ostatní endpointy.

## Autentizace

API používá HTTP Basic Auth. Přihlašovací údaje se nastavují v `api/.env`.

### Příklad použití

V Postmanu: záložka **Authorization** → Type: **Basic Auth** → zadej username + password z `.env`.

Nebo curl:

```bash
curl http://localhost:8000/todos --user 'your-username:your-password'
```

## API endpointy

Všechny endpointy vyžadují autentizaci.

| Method | Endpoint     | Description        |
| ------ | ------------ | ------------------ |
| GET    | `/todos`     | Seznam všech úkolů |
| POST   | `/todos`     | Vytvoření úkolu    |
| GET    | `/todos/:id` | Detail úkolu       |
| PUT    | `/todos/:id` | Aktualizace úkolu  |
| DELETE | `/todos/:id` | Smazání úkolu      |

## Testing

| Typ       | Nástroj    | Repozitář                                                                              |
| --------- | ---------- | -------------------------------------------------------------------------------------- |
| API testy | Jest       | [Chronos_App_Api_Testing](https://github.com/jirivondra/Chronos_App_Api_Testing)       |
| E2E testy | Playwright | [Chronos_Playwright_testing](https://github.com/jirivondra/Chronos_Playwright_testing) |
| Manuální  | Postman    | [chronos_postman_colection](https://github.com/jirivondra/chronos_postman_colection)   |
