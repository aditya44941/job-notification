# Stock Market CRM

A lightweight CRM for stock market users and advisors.

## Features

- Client profiles with segment and risk profile
- Preferred sectors and symbol watchlists
- Holdings capture per client
- Interaction logging (call/email/meeting/note)
- Follow-up tasks with due dates and priorities
- Dashboard metrics (clients, tasks, aggressive users, due today)
- Search and filter across client records

## Run

```bash
npm start
```

Open `http://localhost:3000`.

## API Endpoints

- `GET /api/dashboard`
- `GET /api/clients`
- `POST /api/clients`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`
- `GET /api/interactions`
- `POST /api/interactions`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`

Data is stored in `data/db.json`.
