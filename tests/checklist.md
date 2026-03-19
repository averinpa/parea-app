# Parea — Test Checklist

Legend: ✅ tested & works · ❌ tested & broken · ⬜ not tested yet · 🔄 in progress

---

## Onboarding

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Registration (name, age, city) | ✅ | City = feed filter only, not saved to profile |
| 2 | Photo upload from gallery | ✅ | No crop black areas |
| 3 | Interests selection | ✅ | Continue button ok on Xiaomi 11i and 14 Pro |
| 4 | Languages / bio / prefs | ✅ | |
| 5 | Profile saved to Supabase DB | ✅ | |
| 6 | Photos uploaded to Supabase Storage (HTTPS URL in DB) | ✅ | |
| 7 | Login / session restore on reopen | ✅ | |
| 8 | Delete Account → removes from profiles + Auth | ✅ | Edge Function delete-account |

---

## Home Feed

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 9 | Official events load from DB (no mock flicker) | ✅ | Skeleton shown while loading |
| 10 | Community events shown | ⬜ | |
| 11 | Tonight's Vibe picker | ⬜ | |
| 12 | City filter | ⬜ | |
| 13 | Category filter | ⬜ | |
| 14 | Event detail sheet opens | ⬜ | |

---

## Joining Official Events

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 15 | "I'm going" → format sheet (duo / squad / party) | ⬜ | Step 1 of 2 |
| 16 | Transport step (step 2 of 2) | ⬜ | |
| 17 | Back button on transport → returns to format | ⬜ | |
| 18 | Confirm → record in event_attendees (correct group_size_min/max) | ⬜ | |
| 19 | Leaving event → row deleted from event_attendees | ⬜ | |
| 20 | Leaving event → pending invites cancelled in crew_invites | ⬜ | |

---

## VibeCheck — Official Events

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 21 | While alone: "Looking..." status, 1/cap, search message | ⬜ | |
| 22 | Real attendees appear (REAL badge, photo, name) | ⬜ | |
| 23 | Group size filter: duo user doesn't see party user | ⬜ | e.g. [2,2] vs [6,20] no overlap |
| 24 | Status shows "X found 🎯" when real attendees present | ⬜ | |
| 25 | "Let's go!" → sends crew_invite, no chat created yet | ⬜ | |
| 26 | "Let's go!" button changes to "Invite sent ✓" after press | ⬜ | |
| 27 | Invite sent ✓ persists after app restart | ⬜ | |
| 28 | Incoming invite card visible (inviter name, photo, event) | ⬜ | |
| 29 | Accept invite → chat created, navigate to Messages | ⬜ | |
| 30 | Decline invite → card removed | ⬜ | |
| 31 | Inviter gets "accepted" notification + chat appears in Messages | ⬜ | Polls every 15s |
| 32 | crew_match notification → tapping → VibeCheck | ⬜ | |
| 33 | crew_invite notification → tapping → VibeCheck | ⬜ | |
| 34 | crew_accepted notification → tapping → Messages | ⬜ | |
| 35 | eventAttendeesMap cleared when user leaves event | ⬜ | No stale profiles shown |
| 36 | Poll every 60s picks up new attendees + notification fires | ⬜ | |

---

## VibeCheck — Community Events (host approval)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 37 | Pending request card shown after joining | ⬜ | |
| 38 | Host sees join request in VibeCheck | ⬜ | |
| 39 | Host approves → chat created | ⬜ | |
| 40 | Host rejects → request removed | ⬜ | |
| 41 | "Confirm & Open Chat" button (no invite flow for community) | ⬜ | |

---

## Messages Tab

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 42 | Going tab shows joined events | ⬜ | |
| 43 | Crew card shows real found count ("X found 🎯") | ⬜ | |
| 44 | Chat opens and sends messages | ⬜ | |
| 45 | Leave chat → removed from list | ⬜ | |
| 46 | Chat expires after 24h | ⬜ | |

---

## Profile / Settings

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 47 | Profile photo change → uploads to Storage, shows HTTPS URL | ⬜ | |
| 48 | Edit bio / interests / prefs | ⬜ | |
| 49 | Changes saved to Supabase | ⬜ | |

---

## Notifications

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 50 | Bell badge shows unread count | ⬜ | |
| 51 | Bell shake animation on new notif | ⬜ | |
| 52 | Notification panel opens / closes | ⬜ | |
| 53 | Tapping notif navigates to correct tab | ⬜ | |

---

## Cross-device (2 phones)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 54 | User A joins event, User B joins same event → B appears in A's VibeCheck | ⬜ | |
| 55 | Group size mismatch → users not shown to each other | ⬜ | |
| 56 | A sends invite → B sees invite card within 30s | ⬜ | |
| 57 | B accepts → A sees chat within 15s | ⬜ | |
| 58 | A leaves event → A's profile removed from B's VibeCheck | ⬜ | |
