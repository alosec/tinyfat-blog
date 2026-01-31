---
title: "Six Weeks of Infrastructure: A Technical Retrospective"
date: "2026-01-31"
description: "How we tried six different infrastructure approaches in six weeks and found the one that works."
investorOnly: false
---

## The Problem

We set out to build sandboxed AI agents as a service. The core requirement: give each user a persistent, isolated compute environment with filesystem access, session continuity, and multiple communication channels (web chat, email, eventually Slack/Telegram/WhatsApp).

This turned out to be harder than expected.

---

## The Journey

### Attempt 1: Cloudflare Containers (Dec 17)

Cloudflare's new Containers product seemed ideal. Managed infrastructure, auto-scaling, good pricing.

**Result:** Containers entered zombie states. `stop()` would return success while containers kept running. Agents disappeared mid-conversation. The foundation wasn't stable enough for production.

### Attempt 2: Docker on VPS (Late Dec)

Retreated to basics. Docker containers on a single VPS.

**Result:** Worked, but no isolation between agents. Single point of failure. Scaling meant "buy bigger box." Not a platform architecture.

### Attempt 3: Fly.io Machines (Jan 1-5)

Fly's Machines API offered individual VMs per agent with scale-to-zero pricing.

**Result:** VMs get new IPs when they wake from sleep, breaking OAuth callback flows. Volume management was fragile—data tied to specific machines. The update path was unclear.

### Attempt 4: Cloudflare Sandbox SDK (Jan 8-15)

Discovered CF's Sandbox SDK—a newer compute primitive with proper isolation. Built a one-turn agent runner called "step-mom."

**Result:** Sandboxes are request-scoped. Every email meant cold-starting a new sandbox. No persistent sockets for real-time channels. The 2GB memory limit was tight. But the isolation model was right.

### Attempt 5: External Agent Runtime on VPS (Jan 20-24)

Pivoted to running an open-source agent runtime (Clawdbot) in Docker on dedicated VPS per user. Full hardware isolation.

**Result:** Email round-trip worked. Real-time channels worked (persistent sockets). But now we were managing VPS infrastructure, yoked to an upstream project's technical decisions, and the operational overhead was significant.

### Attempt 6: Warm Daemon in Serverless Container (Jan 25-31)

The insight: what if we kept a daemon process warm *inside* a CF container? The container can sleep when idle (zero cost), but while awake, the daemon holds state across requests.

**Result:** This worked.

---

## The Architecture That Won

```
┌─────────────────────────────────────────┐
│  CF Container (sleeps after idle)       │
│  ┌───────────────────────────────────┐  │
│  │  step-mom daemon                  │  │
│  │  - Warm session (conversation)    │  │
│  │  - Warm model config              │  │
│  │  - WebSocket endpoint             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  R2 mount at /data                      │
│  - MEMORY.md (agent identity)           │
│  - sessions/ (conversation history)     │
│  - outbox/ (pending emails)             │
└─────────────────────────────────────────┘
```

The daemon serves two channels:

- **Web chat**: WebSocket connection, streaming responses, sub-3-second time to first token
- **Email**: Async queue, same agent, same memory, different latency tolerance

Same agent. Two doors in. Session continuity across both.

---

## The Latency Work

Initial implementation had 8-10 second latency to first token. Users noticed.

**Before optimization:**
- Storage mount check: ~1600ms
- Daemon config load: ~500ms
- Session directory scan: ~300ms
- API call: ~2000ms

**After optimization:**
- Skip storage check if daemon running: ~100ms
- Skip config if warm session exists: ~10ms
- API call: ~2000ms
- **Total: ~2.5s**

The key insight: when the daemon is already warm, skip everything except the actual work.

---

## What We Learned

### 1. Serverless CAN Work for Daemons

The conventional wisdom is that serverless doesn't work for persistent processes. TCP connections are stateful at the kernel level—when a VM suspends, remote endpoints don't know, and sockets die.

The workaround: keep a daemon warm inside the container. The container handles the sleep/wake lifecycle. The daemon handles request multiplexing while awake.

### 2. Own the Stack

Using an external runtime (Clawdbot) meant inheriting their technical debt and being constrained by their architectural decisions. When we needed to optimize latency, we couldn't. When we needed different session handling, we couldn't.

Building our own runtime (step-mom) meant full control. The latency optimizations that got us from 8s to 2.5s wouldn't have been possible otherwise.

### 3. Multi-Channel is a Feature

Email and web chat aren't competing interfaces—they're complementary. Email is async, good for delegation ("research this and get back to me"). Web chat is synchronous, good for collaboration ("let's figure this out together").

Same agent, same memory, same tools. Different interaction patterns.

### 4. R2 as Filesystem Works

Mounting R2 via rclone gives each agent a persistent filesystem that survives container restarts. MEMORY.md for identity/instructions. Sessions for conversation history. Outbox for email queue.

The agent doesn't know it's on object storage. It just sees `/data`.

---

## Current State

- **Web chat latency**: ~2.5s to first token
- **Email round-trip**: Working
- **Storage**: Persistent R2 per agent
- **Isolation**: Scoped credentials, agents can't see each other's data
- **Cost at idle**: Zero (container sleeps)

The platform handles real traffic. The architecture scales without scaling costs.

---

## What's Next

- **Fireworks AI integration**: MiniMax M2.1 and other models at 10-20x lower cost than Anthropic direct
- **Tool rendering polish**: The chat UI should communicate the power of what's happening
- **Additional channels**: Slack, Telegram, WhatsApp (now possible with the daemon architecture)

