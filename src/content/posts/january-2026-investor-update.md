---
title: "January 2026: Full Steam Ahead on Clawdbot"
date: "2026-01-24"
investorOnly: true
---

## The Pivot

We've made a decisive architectural shift. The original vision — email-triggered AI agents running in serverless sandboxes — hit a fundamental wall: **Clawdbots need persistent sockets**.

WhatsApp, Telegram, Slack — these platforms require always-on connections. Serverless functions spin up, do work, spin down. They can't hold a WebSocket open for hours. We tried clever workarounds. None of them were good enough.

So we pivoted.

## The New Architecture

**Docker containers as neighbors on a shared VPS.**

This is the industry-standard pattern. It's boring. It's defensible. It works.

Your Clawdbot runs in an isolated container alongside other tenants. Persistent connections stay open. State stays in memory. No cold starts. No connection drops.

## Two Tiers

**tiny** ($50/month) — Shared VPS. Your Clawdbot container next to neighbors. True isolation via Docker. Persistent connections. Simple, affordable, always-on.

**FAT** ($200+/month) — Dedicated Hetzner box. Your metal. True isolation for compliance or enterprise. Self-hosted inference option.

## SAFE Round

The round is open. Friends & family. $10M cap.

**Closed:**
- First check in ✓

**Terms:**
- $10M valuation cap
- $5K minimum
- Standard YC SAFE

If you know anyone who should be in, introductions are appreciated.

## What's Next

1. First Docker-hosted Clawdbot running (this week)
2. Provisioning flow (signup → container creation)
3. Waitlist broadcast once onboarding is solid

We have 100+ signups waiting. Time to deliver.

---

*Questions? Reply to the email or reach out directly.*
