# Parea — Test Checklist

Legend: ✅ tested & works · ❌ tested & broken · ⬜ not tested yet · 🔄 in progress

---

## Onboarding

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Registration (name, age, city) | ⬜ | |
| 2 | Photo upload from gallery | ⬜ | No crop black areas (allowsEditing removed) |
| 3 | Interests selection | ⬜ | Continue button position on Xiaomi/Android |
| 4 | Languages / bio / prefs | ⬜ | |
| 5 | Profile saved to Supabase DB | ⬜ | |
| 6 | Photos uploaded to Supabase Storage (HTTPS URL in DB) | ⬜ | Not local file:// |
| 7 | Login / session restore on reopen | ⬜ | |

---

## Home Feed

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 8 | Official events load from DB (no mock flicker) | ⬜ | Skeleton shown while loading |
| 9 | Community events shown | ⬜ | |
| 10 | Tonight's Vibe picker | ⬜ | |
| 11 | City filter | ⬜ | |
| 12 | Category filter | ⬜ | |
| 13 | Event detail sheet opens | ⬜ | |

---

## Joining Official Events

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 14 | "I'm going" → format sheet (duo / squad / party) | ⬜ | Step 1 of 2 |
| 15 | Transport step (step 2 of 2) | ⬜ | |
| 16 | Back button on transport → returns to format | ⬜ | |
| 17 | Confirm → record in event_attendees (correct group_size_min/max) | ⬜ | |
| 18 | Leaving event → row deleted from event_attendees | ⬜ | |
| 19 | Leaving event → pending invites cancelled in crew_invites | ⬜ | |

---

## VibeCheck — Official Events

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 20 | While alone: "Looking..." status, 1/cap, search message | ⬜ | |
| 21 | Real attendees appear (REAL badge, photo, name) | ⬜ | |
| 22 | Group size filter: duo user doesn't see party user | ⬜ | e.g. [2,2] vs [6,20] no overlap |
| 23 | Status shows "X found 🎯" when real attendees present | ⬜ | |
| 24 | "Let's go!" → sends crew_invite, no chat created yet | ⬜ | |
| 25 | "Let's go!" button changes to "Invite sent ✓" after press | ⬜ | |
| 26 | Invite sent ✓ persists after app restart | ⬜ | |
| 27 | Incoming invite card visible (inviter name, photo, event) | ⬜ | |
| 28 | Accept invite → chat created, navigate to Messages | ⬜ | |
| 29 | Decline invite → card removed | ⬜ | |
| 30 | Inviter gets "accepted" notification + chat appears in Messages | ⬜ | Polls every 15s |
| 31 | crew_match notification → tapping → VibeCheck | ⬜ | |
| 32 | crew_invite notification → tapping → VibeCheck | ⬜ | |
| 33 | crew_accepted notification → tapping → Messages | ⬜ | |
| 34 | eventAttendeesMap cleared when user leaves event | ⬜ | No stale profiles shown |
| 35 | Poll every 60s picks up new attendees + notification fires | ⬜ | |

---

## VibeCheck — Community Events (host approval)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 36 | Pending request card shown after joining | ⬜ | |
| 37 | Host sees join request in VibeCheck | ⬜ | |
| 38 | Host approves → chat created | ⬜ | |
| 39 | Host rejects → request removed | ⬜ | |
| 40 | "Confirm & Open Chat" button (no invite flow for community) | ⬜ | |

---

## Messages Tab

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 41 | Going tab shows joined events | ⬜ | |
| 42 | Crew card shows real found count ("X found 🎯") | ⬜ | |
| 43 | Chat opens and sends messages | ⬜ | |
| 44 | Leave chat → removed from list | ⬜ | |
| 45 | Chat expires after 24h | ⬜ | |

---

## Profile / Settings

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 46 | Profile photo change → uploads to Storage, shows HTTPS URL | ⬜ | |
| 47 | Edit bio / interests / prefs | ⬜ | |
| 48 | Changes saved to Supabase | ⬜ | |

---

## Notifications

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 49 | Bell badge shows unread count | ⬜ | |
| 50 | Bell shake animation on new notif | ⬜ | |
| 51 | Notification panel opens / closes | ⬜ | |
| 52 | Tapping notif navigates to correct tab | ⬜ | |

---

## Cross-device (2 phones)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 53 | User A joins event, User B joins same event → B appears in A's VibeCheck | ⬜ | |
| 54 | Group size mismatch → users not shown to each other | ⬜ | |
| 55 | A sends invite → B sees invite card within 30s | ⬜ | |
| 56 | B accepts → A sees chat within 15s | ⬜ | |
| 57 | A leaves event → A's profile removed from B's VibeCheck | ⬜ | |
