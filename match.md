Prompt for Claude: Parea App Matching & Flow Logic
Role: You are a Senior React Native Developer. Build the core matching and navigation logic for the "Parea" app using Expo Router and React Native.

1. Navigation Structure (Tabs):
Create a 3-tab navigation system:

Explore: Feed of events (Official and Social).

Vibe Check: The "Waiting Room" for joined events that are still matching.

Chats: Active group chats for confirmed events.

2. The "Join" & Vibe-Check Flow:
When a user clicks "Join Event" on the Explore screen, trigger this flow:

Selection Modal:

Group Size: Duo (2), Small Group (5), or Party (20).

Transport: "I'm driving", "Need a lift", or "Meet there".

Daily Goal: "Chill", "Networking", or "Activity".

State Management: Move the event card to the Vibe Check tab.

UI: Show real photos of people already in the queue. Display their language icons and transport status.

3. Matching Logic Rules (Backend Mock):
Implement the logic (as a front-end simulation for now):

Language Filter (Strict): Everyone in the group must share at least one common language.

Age Filter: ±10-15 years difference.

Interest Filter: High priority initially, but implement a "Flexible Priority": if a match isn't found within a few hours of the event, decrease interest matching weight while keeping Language and Age strict.

4. Confirmation & Attendance Cycle:

Full Group Alert: Once the group is full (e.g., 5/5), show a prompt: "Group Ready! Confirm your attendance".

Buttons: "Confirm: I'm in!" and "Plans changed".

The "Plans Changed" Logic: - If a user clicks it during confirmation, they are removed.

If a user clicks "Leave Group" inside an active chat, trigger a system message: "[User Name]'s plans changed. Searching for a replacement..."

The event must automatically return to the Vibe Check state for the remaining members until a new person joins.

5. Visual Identity:

Language: Everything must be in English.

Design: Glassmorphism (using expo-blur), Mesh Gradient (Coral, Mint, Blue), and lucide-react-native icons.

Characters: Use the provided character illustrations (no background) for the empty states and backgrounds.

Technical Task: Write the code for app/(tabs)/index.tsx, app/(tabs)/vibecheck.tsx, and the MatchingModal component. Use useState to manage the transition from "Join" -> "Vibe Check" -> "Chat".
Ответ Gemini
Вот полный, максимально подробный промпт для Клода. Он учитывает всё: от визуального стиля до логики «кто эти люди» и возможности выйти из очереди.

Скопируй текст ниже полностью и отправь в чат Клоду:

Prompt for Claude: Parea App — Final Matching & Vibe Check Logic
Role: Senior React Native & Expo Developer.
Objective: Build the core event-matching system for the "Parea" app.

1. Architecture & Navigation:

Use Expo Router.

Create/Update 3 main tabs:

Explore (Event feed).

Vibe Check (The "Waiting Room" for joined events).

Chats (Active group conversations).

2. Explore Screen & Joining:

Every event card must have a "Join Event" button.

Clicking "Join" opens a Selection Modal (Glassmorphism style):

Group Size: Trio (2), Small Group (5), or Party (20).

Transport: "I'm driving", "Need a lift", "Meet there".

Daily Goal: "Chill", "Networking", "Activity".

After selection, move the event to the Vibe Check tab.

3. Vibe Check Screen (The Queue):

User Transparency: This is the most important part. Show a list of real user avatars (circles) for people already in the queue for this event.

Clickable Profiles: Every avatar must be clickable. When tapped, open a Profile Preview Modal (or Bottom Sheet) showing:

A carousel of 3 photos.

Name, Age, and a short Bio.

Tags for Interests (e.g., Tennis, Wine, IT) and Languages (flags).

Transport status icon (🚗 or 🚶).

Goal: This allows the user to vet the group. If they don't like the participants, they can leave before the chat is created.

4. Confirmation & "Plans Changed" Logic:

Group Formation: When the group reaches the required size (e.g., 5/5), change the card status to "Confirm Attendance".

Buttons: - "Confirm: I'm in!" (Moves the user to the active Chat tab once everyone confirms).

"Plans changed" (Removes the user from the queue and re-opens the slot for someone else).

In-Chat Exit: Inside an active chat, add a "Leave Group" option. If triggered, post a system message: " [User Name]'s plans changed. Searching for a replacement..." and put the event back into 'Vibe Check' status for the remaining members.

5. Design & Tech Specs:

Language: Everything MUST be in English.

Style: Glassmorphism (expo-blur), Mesh Gradient (Coral, Mint, Blue), and lucide-react-native icons.

Mock Data: Generate 5-10 diverse user profiles with photos and interests to demonstrate the vetting process.

Technical Task: Provide the updated code for app/(tabs)/index.tsx, app/(tabs)/vibecheck.tsx, and a new ProfilePreview component. Ensure all states (Joining -> Vetting -> Confirming -> Chatting) are handled.
«Claude, update the logic for the Party (20 people) group:

Threshold: Don't wait for exactly 20 people. Once the group reaches 12 participants, automatically trigger the Confirmation/Chat phase.

Open Slots: Keep the group open for new joins even after the chat is created, until it reaches the cap of 20.

Visuals: In the Vibe Check tab, show '12 / 20 joined — Group Active!' to let people know they can already start talking.»