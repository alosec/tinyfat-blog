---
title: "What TinyFat Is"
date: "2026-01-31"
description: "Sandboxed AI agents as a service."
investorOnly: false
---

TinyFat runs AI agents in sandboxed containers. Each agent gets:

- A persistent filesystem (R2 bucket mounted at `/data`)
- Session continuity across conversations
- Two channels in: web chat and email

The agent doesn't know it's in a sandbox. It just sees a Linux environment with a home directory.

---

## Architecture

<pre class="mermaid">
flowchart TB
  subgraph Container[Cloudflare Container]
    direction TB
    Daemon[step-mom daemon]
    Daemon --- Session[Warm session]
    Daemon --- WS[WebSocket endpoint]

    subgraph Storage["/data (R2 mount)"]
      Memory[MEMORY.md]
      Sessions[sessions/]
      Outbox[outbox/]
    end
  end

  WebChat[Web Chat] --> Daemon
  Email[Email] --> Daemon
  Daemon <--> Storage
</pre>

A daemon stays warm inside the container. Web chat connects via WebSocket. Email triggers async runs. Both hit the same agent with the same memory.

Container sleeps when idle. Zero cost at rest.

---

## Current Numbers

- ~2.5s to first token on web chat
- Email round-trip working
- Agents isolated via scoped R2 credentials

---

## What's Next

- Fireworks AI for cheaper inference
- More channels (Slack, Telegram)
- Better tool rendering in the chat UI
