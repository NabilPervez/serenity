Here is the updated and finalized Product Requirements Document (PRD) for Serenity, incorporating your technical and functional decisions. The "Critical Clarifications" section has been removed, as those parameters are now baked directly into the architecture and requirements.

***

# Product Requirements Document (PRD): "Serenity" (Anxiety Management PWA)

## 1. Context & Scope
### 1.1 Executive Summary
* **Elevator Pitch:** A privacy-first, purely local Progressive Web App (PWA) designed to help users manage anxiety through hourly mood and anxiety check-ins, scheduled breathing exercises, and personalized daily checklists for coping skills and affirmations.
* **Product Type:** New Product.
* **KPIs:**
    1.  Daily Active Users (DAU) to Monthly Active Users (MAU) ratio (>30% target).
    2.  Daily Checklist Completion Rate (>50% of items checked off daily).
    3.  Notification Engagement Rate (Percentage of hourly check-ins clicked).

### 1.2 Problem Statement
* **Pain Point:** Individuals suffering from anxiety often lack structured, accessible, and privacy-respecting tools to ground themselves throughout the day and build healthy daily habits.
* **Consequence:** Without regular grounding exercises (like box breathing) or hourly self-reflection, anxiety can snowball, leading to panic attacks and poor sleep hygiene.
* **Current Solutions:** Users currently rely on scattered tools (Apple Notes, physical journals, heavy subscription-based apps like Headspace/Calm) which often collect personal data and cost money.

### 1.3 Value Proposition
* **Why it's better:** It is 100% free, entirely local (zero data harvesting), and focuses strictly on evidence-based CBT/DBT techniques (box breathing, affirmations, coping mechanisms) packaged in a lightweight, accessible PWA.
* **"Aha!" Moment:** When the user completes their first 3-minute Box Breathing exercise, logs their mood/anxiety on the timeline, and visually sees their anxiety drop within the app's earthy, calming interface.

---

## 2. User Personas & Roles
### 2.1 The Personas
* **The Buyer:** None. The app is 100% free.
* **The End User:** Individuals managing generalized anxiety, high stress, or panic disorders who want a structured routine without cognitive overload.
* **The Admin:** None. This is a client-side only application.

### 2.2 Role-Based Access Control (RBAC)
* **Roles:** Single User Role (Local Client).
* **Data Isolation:** Data is siloed entirely to the user's specific device/browser via IndexedDB and localStorage. There is zero multi-tenancy, cloud database, or remote server.

---

## 3. User Stories & Functional Requirements
### 3.1 Authentication & Onboarding
* **Sign Up:** No authentication required. The app opens directly into onboarding upon first visit.
* **Onboarding Flow:**
    * *Welcome Screen:* Brief intro to the app's purpose.
    * *Coping Skills Selection:* Displays a static list of 26 positive coping skills. The user MUST select exactly 5.
    * *Affirmations Selection:* Displays a static list of 101 positive affirmations. The user MUST select exactly 7.
    * *Permissions:* Prompt the user to allow Local Push Notifications and instruct iOS users to "Add to Home Screen" to enable PWA features.

### 3.2 Core Workflow (The "Happy Path")
* **Action:** Managing the Daily Routine.
* **Inputs:** The user opens the app, views their "Today" checklist, taps checkboxes for their 5 coping skills and 7 affirmations, and clicks the "Breathe" button when triggered by a notification.
* **Processing (Midnight Reset):** The app checks the current date against the `last_login_date` stored in localStorage upon app initialization. If `current_date > last_login_date`, it programmatically unchecks all daily checklist items.
* **Output:** A visual timeline of the user's mood and anxiety levels throughout the day and a completed ring/progress bar for their daily habits.

### 3.3 Settings & Configuration
* **Configurations:** Users can re-open the onboarding lists to change their 5 coping skills or 7 affirmations (restricted to the pre-provided lists). Users can also adjust their default timezone and "Waking Hours" for notifications.
* **Data Export:** Users can export their Timeline and Checklist history as a locally generated `.csv` or `.json` file.
* **App Theme:** Fixed to the "Earthy/Warm" design system for MVP.

### 3.4 Notifications
* **Triggers & Schedule (Defaults to CST):**
    * *Hourly (Waking Hours default 8:00 AM - 8:00 PM):* "Time for a quick check-in. How are you feeling?"
    * *9:00 AM & 1:00 PM:* "Time for your Box Breathing exercise."
    * *9:00 PM:* "Wind down time. No electronics, take a warm bath/shower. You are safe."
* **Delivery:** Handled via the browser's native Notifications API driven by a ServiceWorker.
* **Customization:** Users can toggle notification categories on/off and configure their specific "Waking Hours" window.

---

## 4. Monetization & Billing
### 4.1 Pricing Model
* 100% Free. No billing, no ads, no freemium tiers.

---

## 5. Site Map & Information Architecture
### 5.1 Global Navigation
* **Mobile Menu:** Bottom Navigation Bar (App is designed mobile-first).
* **Icons:** Home (Checklist), Timeline (Journal), Breathe (Exercise), Settings.
* **Desktop Menu:** Left Sidebar (collapses to icons on smaller screens).

### 5.2 URL Structure
Client-side routing (e.g., React Router) using hash or browser history API:
* `/` (Home/Checklist)
* `/timeline`
* `/breathe`
* `/settings`

---

## 6. Page-by-Page Component Breakdown
### Page: Home (Daily Dashboard)
* **Goal:** Allow users to check off their daily habits and view progress.
* **Layout:** Vertical list layout separated by cards.
* **Components:**
    * *Progress Header:* A circular progress bar showing % of daily tasks completed.
    * *Affirmations Card:* A checklist of the 7 selected affirmations.
    * *Coping Skills Card:* A checklist of the 5 selected coping skills.
    * *Bedtime Routine Card:* A fixed checklist (Sleep hygiene, mantras).
* **Actions:** Tapping a checkbox marks it complete, triggering a satisfying UI animation and updating IndexedDB.

### Page: Timeline (Mood & Anxiety Journal)
* **Goal:** Track both the emotional state and quantitative anxiety level over the waking day.
* **Layout:** A vertical chronological timeline.
* **Components:**
    * *Current Check-In Form:* A Mood Selector (e.g., emotion tags like "Calm", "Overwhelmed", "Sad"), an Anxiety Level Slider (1-10), and a text area for brief notes.
    * *History List:* Nodes connected by a vertical line, displaying the time, mood tag, anxiety score, and notes.
* **Actions:** "Save Entry" button.

### Page: Box Breathing
* **Goal:** Guide the user through the 4-4-5 breathing technique.
* **Layout:** Centered immersive UI.
* **Components:**
    * *Breathing Visualizer:* A large circle or square that expands for 4 seconds (Inhale), holds for 4 seconds, and contracts for 5 seconds (Exhale).
    * *Counter:* "Cycle 1 of 10".
* **Actions:** "Start", "Pause", "Stop".

### Page: Settings & Onboarding Forms
* **Goal:** Configure the app and select skills/affirmations.
* **Fields:** Checkbox lists mapping to the 26 skills and 101 affirmations.
* **Validation:** App enforces exactly 5 skills and 7 affirmations. If the user selects 6 skills, the UI disables the remaining unchecked boxes or throws a toast error. Does not allow custom text entries.
* **Submission:** Saves arrays of selected IDs to localStorage.

---

## 7. Technical Requirements
### 7.1 Stack Preferences
* **Frontend:** React.js (via Vite) or Vanilla TypeScript. Tailwind CSS for rapid styling.
* **State Management:** Zustand (React) or plain JS Context.
* **Database (Local):** IndexedDB (using a wrapper like localForage or Dexie.js) for storing Timeline entries. localStorage for simple user preferences.
* **Hosting:** GitHub Pages or Netlify.
* **PWA Architecture:**
    * `manifest.json` for home screen installation.
    * ServiceWorker for offline caching of UI assets.

### 7.2 Performance & Reliability
* **Load Time:** < 1 second (Served from Service Worker cache after initial load).
* **Offline Capabilities:** 100% functional offline. The app requires no internet connection after the initial PWA installation.

### 7.3 Integrations & APIs
* **3rd Party APIs:** None. Zero external network requests to ensure strict privacy and continuous offline functionality. 

---

## 8. Data & Analytics
### 8.1 Internal Events
* **Requirement:** No remote tracking whatsoever.
* **Local Tracking:** The app will track "Current Streak" (days in a row the user has opened the app and completed at least 1 check-in) stored purely in localStorage to gamify the experience and encourage retention.

---

## 9. Design System & UI Rules
* **Vibe:** Light, earthy, warm, friendly, grounding.
* **Color Palette:**
    * *Primary:* Sage Green (`#9CAF88`)
    * *Secondary:* Terracotta/Warm Clay (`#E2856E`)
    * *Background:* Warm Off-White/Oatmeal (`#F9F6F0`)
    * *Text:* Deep Forest Green (`#2C3D30`)
* **Typography:** A friendly sans-serif like Nunito or Inter.
* **Iconography:** Rounded, outlined icons (e.g., Phosphor Icons or Lucide).
* **Responsiveness:** Mobile-first approach. Will adapt to tablet/desktop by centering a max-width mobile-proportioned container (e.g., `max-w-md mx-auto`).

---

## 10. Roadmap & Phasing
### 10.1 MVP (Phase 1)
* PWA Setup (Manifest + basic offline caching).
* Onboarding selection (Strictly restricted to 5 pre-set skills, 7 pre-set affirmations).
* Daily programmatic resetting checklists based on date evaluation.
* Timeline view for manual check-ins (Mood + Anxiety Slider).
* Box Breathing visualizer.

### 10.2 V1.1 / V2 (Future)
* Local scheduled notifications via Service Worker (Alarms API).
* Local data export (CSV/JSON).
* Weekly progress charts (Anxiety averages over time).
* Custom user-written affirmations.

---

## 11. Risks & Constraints
* **PWA iOS Limitations:** Apple restricts Push Notifications for PWAs. Users must add the app to their Home Screen, and they must be on iOS 16.4+.
* **Strict Local Notification Constraints:** Because the application architecture strictly prohibits any remote backend routing (e.g., Firebase), notifications must rely entirely on browser-based Service Worker background APIs (like Web Alarms). OS-level battery-saving protocols on mobile devices frequently kill or delay these background tasks. Users will need to be made aware that notifications are "best effort" based on their device settings, or they may need to keep the app active in the background.
* **Data Loss:** Because data is stored in IndexedDB/localStorage, if the user clears their browser cache or buys a new phone, their data is permanently lost.
