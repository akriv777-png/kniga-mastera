# Feature parity: old books → Mini App

Audit of the pre-rewrite books (history through `cd5756b` plus the private plaintext `master_src`) against the Telegram Mini App on `main`.

| Old feature | Where it lived | New place | Status |
|---|---|---|---|
| Player room-code entry | `player.js` gate | `player/` gate, SHA-256 vs public `rooms.json` | Ported |
| Master password / vault | old master unlock | `master/` gate, PBKDF2 250k + AES-GCM `vault/master.enc.json` | Ported (always password, no session unlock) |
| Player hero sheet | `player.js` tab `hero` | Player «Герой» | Ported |
| Ability / skill rolls | hero sheet | Tap characteristic or skill → к20 + modifier | Ported |
| HP, temp HP, death, inspiration | hero sheet | «Герой» | Ported |
| Short / long rest | hero sheet | «Герой» buttons; also restore class charges | Ported |
| Conditions | hero sheet | Chip row on «Герой» | Ported |
| Class resource pips (rage, ki, bardic, channel, …) | `uses.js` | «Герой» → «Умения и заряды» (`app/js/features.js`) | Ported |
| Hero export / import `DND1:` / `KP1:` | player KP1 | «Экспорт листа» / «Импорт листа» | Ported |
| Inventory / coins | `bag` | «Сумка» | Ported |
| Spellbook + slots | `spells` | «Чары» | Ported |
| Item catalog | items reference | Player «Предметы», master «Лут» | Ported |
| Spell / item search, favourites, recent | lists + `fav` | Search boxes, ☆, «Записи» | Ported |
| Maps gallery | `map` | «Карты» | Ported |
| Notes / journal | `notes` | Player «Записи», master «Заметки» | Ported |
| Dice roller + formulas | `dice` | «Кубики» (`1d20`, `2к6+3`) | Ported |
| Attack / damage calculator | old dice widgets | «Кубики» → «Атака и урон» | Ported |
| Player live table (PeerJS / WebRTC, tokens, fog) | `table.js` | **Not ported** — it crashed iOS Telegram WebView. Replacement: Telegram chat itself + player «Стол» handouts | Replaced |
| Player «Стол» / handouts | `table.js` + `handout.js` | Player «Стол»: local parchment handouts | Ported (offline handouts) |
| Master session: party | `session.js` party | «Сессия» → «Герои за столом» | Ported |
| Room code create / publish | session + bot | «Сессия» → создать код → `sendData` `type=room` | Ported |
| Session clock / calendar | `session.js` clock | «Сессия» → «Календарь стола» | Ported |
| Weather widget | `weather.js` / session | «Сессия» → «Погода» | Ported |
| Round / encounter timer | session timer | «Сессия» → «Таймер» 1/5/10 мин | Ported |
| Quests | session quests | «Сессия» → «Квесты» | Ported |
| Session log | session log | «Сессия» → «Журнал сессии» | Ported |
| Session backup / restore | session backup | «Сессия» → «Резервная копия стола» | Ported |
| Shops / generated stock | `shops.js` | «Сессия» → «Лавки» | Ported |
| Bestiary + tactics | `npc` / monsters | «Бестиарий» (vault) | Ported |
| Original legends | legends | «Персонажи» / легенды | Ported |
| NPC cards with secrets | `npc` | «Персонажи» → НИП (master-only secrets stay in vault) | Ported |
| Combat tracker | `combat.js` | «Бой» (initiative, HP, rounds) | Ported (core tracker; no token FX) |
| Campaigns + chapters + finales | campaigns | «Кампании» | Ported |
| Screen / rule cards (33) + search | `screen.js` | «Ширма» search + `content/public/screen.json` | Ported |
| Random tables (enc, quest, tavern, rumor, oneshot, loot, villain, …) | vault `tables` + `oneshot.js` / `loot.js` / `improv.js` | «Ширма» → «Генераторы» | Ported |
| Name picks from race tables | screen names + `nhum`/`nelf`/… | Ширма card «Случайные имена НИП» | Ported |
| Spirit of the book | old chat / bot only | «Дух»: request id+key, mailbox poll, in-book decrypt, chat mirror | Ported and extended |
| Telegram WebApp hooks | partial / hashed Vite | `ready`, `expand`, theme, Back/Main/Settings, Haptics, CloudStorage, `sendData` / deep-link | Ported |
| Master edit pipeline | plaintext files in repo (historical) | Private `master_src` → `encrypt_master.py` → published ciphertext | Ported (safer) |
| Map tokens, fog of war, AOE templates, blood/ink FX, mapgen | `mapgen`/`maptok`/`aoe`/`fx`/`blood`/`ink`/`tokx` | **Not ported** (same iOS/WebRTC reason; visual battle-map tooling) | Documented omission |
| PeerJS networking | `table.js` | **Not ported** | Documented omission |

Content counts carried from `master_src` / public JSON: 1854 spells, 1622 items, 15 maps, 219 spell-art ids, 600 monsters, 64 legends, 225 NPCs, 5 campaigns, 30 table groups, 24 tactics, 33 screen cards.
