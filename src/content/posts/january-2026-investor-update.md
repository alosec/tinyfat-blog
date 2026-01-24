---
title: "January 2026: The FAT Tier Goes Live"
date: "2026-01-24"
investorOnly: true
---

## The Six-Week Infrastructure Odyssey

Since December, we've migrated the entire TinyFat architecture across six different infrastructure approaches. This isn't indecision — it's methodical elimination. Each migration taught us what doesn't work for our specific use case.

Here's the journey:

### 1. Cloudflare Containers (Dec 17)

Started with Cloudflare's new Containers product. Seemed perfect: managed infrastructure, auto-scaling, good pricing.

**What went wrong:** Containers entered zombie states. `stop()` would return success while the container kept running. Agents would disappear mid-conversation. Foundation was shaky.

### 2. Docker on VPS (Late Dec)

Migrated to Docker containers on our existing VPS. Basic, but reliable.

**What went wrong:** Single VPS meant single point of failure. No isolation between agents. Scaling meant "buy bigger box."

### 3. Fly.io Machines (Jan 1-5)

Fly's Machines API was promising: individual VMs per agent, scale-to-zero pricing, fast cold starts.

**What went wrong:** OAuth flows broke constantly. Fly's VMs get new IPs when they wake from sleep, which breaks OAuth callback flows. Volume management was fragile — data tied to specific machines. Update path unclear.

### 4. Cloudflare Sandbox SDK (Jan 8-15)

Discovered CF's Sandbox SDK — a new compute primitive with proper isolation. Built "step-mom", a one-turn agent runner. Got all F&F agents running on it.

**What went wrong:** Sandboxes are request-scoped. Every email = cold start a new sandbox. No persistent sockets (WhatsApp/Telegram/Slack connections drop when sandbox exits). The 2GB memory limit was tight.

### 5. Clawdbot Discovery (Jan 11)

Found Clawdbot (Peter Steinberger's open-source project). Same product we were building, but MIT-licensed with a thriving community. Strategic pivot: become "managed Clawdbot hosting" rather than building our own agent runtime.

### 6. Docker + VPS, Again (Jan 20-24)

Full circle, but different. Clawdbot running in Docker on dedicated VPS. Full email round-trip working. The proof of concept that proves the model.

---

## The Fundamental Problem We Kept Hitting

Every serverless platform has the same issue: **TCP connections are stateful at the kernel level.**

When you suspend a VM, remote endpoints don't know. Their TCP stacks time out and close. No way around this without an external proxy holding sockets while compute sleeps.

Clawdbot needs persistent connections to WhatsApp, Telegram, Slack. These platforms don't handle reconnect gracefully. Socket drops = broken integrations.

The solutions (Fly Sprites, E2B, CF Workers) all assume request/response workloads. We're running a daemon.

---

## The Two-Tier Model

This journey crystallized our product architecture:

### FAT Tier — Going into the Spotlight

Dedicated Hetzner VPS per user. ~$5.50/mo base cost. Full Clawdbot with persistent sockets.

- **Hardware isolation** — Your own box, no neighbors
- **Persistent connections** — WhatsApp, Telegram, Slack all work
- **SSH access** — "It's your server, we maintain it"
- **Code execution** — Users can run anything, isolation makes it safe

**Price:** $30/mo managed, $20/mo BYOK (bring your own API key)

This is the main product now. The experience we can deliver with confidence.

### Tiny Tier — Back to R&D

Serverless sandboxes for email-only agents. Lower cost, but limited.

**What works:**
- Email in → agent runs → email out
- One-turn conversations
- No persistent state requirements

**What doesn't:**
- WhatsApp, Telegram, Slack (socket-based)
- Long-running conversations with memory
- Code execution (sandboxes are ephemeral)

Tiny tier is going back into the lab. We need to figure out how to make Clawdbot (or a stripped-down version) fit the serverless model. The 2GB limit, socket persistence, and session continuity are all unsolved.

**Not selling Tiny tier publicly yet.** Internal R&D until we have an answer.

---

## What's Working Now

Proof of concept on FAT tier:
- Clawdbot running in Docker on test VPS
- Full email round-trip (email in → agent processes → email out)
- MiniMax M2.1 via Fireworks for inference
- R2 workspace mounting for persistent storage
- Slack, Telegram integration ready (not just email)

This is the product. Now we scale it.

---

## Pricing (FAT Tier Only)

**Standard Managed: $30/month**

| Component | Our Cost | What You Get |
|-----------|----------|--------------|
| Dedicated VPS | ~$5.50 | Hardware isolation |
| AI inference | ~$5-8 | MiniMax M2.1 included |
| Platform + support | — | We handle ops |

**Standard BYOK: $20/month**
- Same VPS, you bring your own API key
- For devs who already have Anthropic/OpenAI accounts

**Comparison:**
- ChatGPT Plus ($20): No persistence, no integrations, can't hold sockets
- Claude Pro ($20): Same limitations
- DIY: Hours of setup, maintenance forever

We're not competing on price. We're competing on "it works and you didn't have to learn ops."

---

## Immediate Roadmap

1. **Hetzner API integration** — Programmatic VPS provisioning
2. **Cloud-init automation** — One-click Clawdbot setup on new VPS
3. **DNS automation** — `{agent-name}.tinyfat.com` → user's VPS
4. **Fix email bugs** — Threading not preserved, duplicate responses
5. **CI/CD pipeline** — Currently deploying by hand (rsync + docker cp)

---

## Strategic Position

The infrastructure odyssey wasn't wasted time. We now know:

1. **Serverless doesn't work for daemons** — Every platform assumes request/response
2. **Clawdbot is the right runtime** — MIT-licensed, active community, we don't build from scratch
3. **Isolation requires hardware** — Container isolation isn't enough when users run arbitrary code
4. **VPS per user is the right model** — Simple, explainable, secure

The market is moving toward AI agents. Most competitors are building on shared infrastructure because VPS-per-user seems expensive. But we're targeting a premium market (people who'll pay $30/mo for "it just works"), and the security story matters.

When the market eventually solves "isolated sandbox with persistent sockets," we can add a cheaper tier. Until then, FAT tier is the product.

---

## SAFE Round

Still open. Friends & family. $10M cap.

**Closed:**
- First check in ✓

**Terms:**
- $10M valuation cap
- $5K minimum
- Standard YC SAFE

If you know anyone who should be in, introductions are appreciated.

---

*Questions? Reply to the email or reach out directly.*
