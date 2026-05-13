# mulle.js

En Phaser CE-baserad JavaScript-port av spelstrukturen för **Mulle Meck bygger bilar**. Repot innehåller spelkod, scenlogik och exporterad JSON-data. Originalspelets bild- och ljudresurser är inte incheckade, så en full spelupplevelse kräver att dessa exporteras till `dist/assets/` och `dist/ui/` innan distribution.

## Krav

- Node.js 18 eller senare.
- npm.
- Valfritt för multiplayer: en websocket-server via `npm run server`.
- Valfritt för fulla originalresurser: Python-exportflödet i `assets.py` och lokala originalfiler. Sätt `resourcePath` i `assets.py` innan du kör exporten.

## Installera

```bash
npm install
```

## Bygg

```bash
npm run build
```

Bygget skapar `dist/` och kopierar:

- `src/index.html` till `dist/index.html`.
- `src/style.css` till `dist/style.css`.
- JSON-data från `data/` till `dist/data/`.
- Phaser från `node_modules/phaser-ce` till `dist/phaser.min.js`.
- Demosidan från `demo/` till `dist/demo/`.

Mappar som `assets/`, `ui/`, `topography/`, `progress/` och `info/` kopieras om de finns lokalt. Saknade mappar loggas och hoppas över. Om `dist/assets/` redan finns bevaras den katalogen när bygget städar `dist/`.

## Kör demo

```bash
npm run demo
```

Öppna sedan:

- `http://localhost:8080/` för spelet.
- `http://localhost:8080/demo/` för demosidan och databasstatus.

Spelet kör offline som standard för att inte blockera boot om ingen websocket-server finns. För multiplayer startar du servern och lägger till query-parametern:

```bash
npm run server
# öppna http://localhost:8080/?multiplayer=1
```

## Exportera originalresurser

`assets.py` är avsett för att exportera atlaser, ljudsprites och packfiler från lokala originalresurser. Innan det körs behöver platshållaren `resourcePath` peka på katalogen där originalfilerna finns.

Exempel på flöde:

```bash
npm run build
python assets.py 0   # utvecklingsresurser
# eller: python assets.py 7   # optimerade produktionsresurser
```

Efter exporten ska `dist/assets/*.json`, atlasbilder, ljudfiler och `dist/ui/` finnas på plats. `npm run build` bevarar en befintlig `dist/assets/`, men om du vill börja helt rent kan du ta bort `dist/` manuellt före bygget. Utan dessa resurser kan koden byggas och demosidan användas, men spelets scener saknar sina originalbilder och ljud.

## Användning i spelet

1. Kör `npm run demo`.
2. Öppna `http://localhost:8080/`.
3. Skriv ett namn i menyn och tryck Enter för att skapa eller ladda en lokal profil.
4. Spardata lagras i `window.localStorage` under nyckeln `mulle_SaveData`.
5. Använd knappen **wipe save** i UI:t för att rensa lokal sparfil.
6. Använd hash i URL:en för att starta en viss Phaser-state, till exempel `http://localhost:8080/#garage`.

## Scripts

| Kommando | Beskrivning |
| --- | --- |
| `npm run build` | Bygger utvecklingsdistributionen till `dist/`. |
| `npm run build:dev` | Samma som build med sourcemap. |
| `npm run build:prod` | Bygger med produktions-webpackkonfigurationen. |
| `npm run demo` | Bygger och startar statisk server på port 8080. |
| `npm run serve` | Serverar befintlig `dist/` på port 8080. |
| `npm run server` | Startar websocket-servern för multiplayer. |

## Felsökning

- **Saknade `assets/*.json`**: exportera originalresurserna med `assets.py` eller kopiera in ett färdigt `assets/`-paket i `dist/`.
- **Ingen multiplayeranslutning**: kör `npm run server` och starta spelet med `?multiplayer=1`.
- **Tom eller trasig sparprofil**: klicka **wipe save** eller rensa `mulle_SaveData` i webbläsarens localStorage.
