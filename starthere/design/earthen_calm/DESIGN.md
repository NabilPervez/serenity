# Design System Document: Tactical Serenity

## 1. Overview & Creative North Star
**Creative North Star: "The Tactile Sanctuary"**

This design system moves away from the cold, clinical precision of standard digital interfaces. Instead, it draws inspiration from high-end editorial wellness journals and the physical layering of textured paper. The goal is to create a "Sanctuary" that feels grounding, intentional, and human. 

We break the "template" look by rejecting rigid borders and standard grids in favor of **Tonal Layering** and **Intentional Asymmetry**. By utilizing generous whitespace and overlapping elements, we create a sense of breathability essential for an anxiety management PWA. Every interaction should feel like a soft exhale.

---

## 2. Color & Surface Philosophy
The palette is rooted in the earth: Sage, Clay, and Oatmeal. To achieve a premium feel, we move beyond flat HEX codes into a system of "Environmental Tones."

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections.
Boundaries must be created through:
1.  **Background Shifts:** Transitioning from `surface` (#fcf9f3) to `surface-container-low` (#f6f3ed).
2.  **Soft Volume:** Using `surface-container-lowest` (#ffffff) to make elements appear "raised" naturally.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine-paper sheets.
*   **Base Layer:** `surface` (#fcf9f3)
*   **In-Page Sections:** `surface-container` (#f0eee8)
*   **Actionable Cards:** `surface-container-lowest` (#ffffff) to provide maximum "lift" and focus.
*   **Interactive Overlays:** Use `surface_bright` with a 10% opacity backdrop blur (Glassmorphism) to keep the user grounded in their current context.

### Signature Textures
Avoid 100% flat CTAs. For primary actions, use a **Linear Gradient** (45deg) from `primary` (#526442) to `primary_container` (#9caf88). This adds a "silk" sheen that feels expensive and tactile.

---

## 3. Typography: The Editorial Voice
We use a high-contrast scale to create an editorial feel, mixing the character of **Plus Jakarta Sans** for headers and the legibility of **Inter** for utility.

*   **Display (Plus Jakarta Sans):** Large, expressive, and slightly tracking-tight (-2%). Used for daily affirmations or "Welcome" states to create an immediate emotional connection.
*   **Headline & Title (Plus Jakarta Sans):** Bold and grounding. Use `headline-lg` for section headers to act as visual anchors.
*   **Body & Labels (Inter):** High legibility. We use `body-lg` for journaling and content to ensure the eye doesn't strain, adhering to the "calming" ethos.

**The Typographic "Soul":** Never center-align long-form body text. Always left-align to maintain a strong "spine" for the layout, reflecting stability.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often too "heavy" for a serenity-focused app. We use **Ambient Depth**.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card on a `surface-container-low` background. The subtle shift in hex value creates enough contrast for the brain to perceive depth without the visual noise of a drop shadow.
*   **Ambient Shadows:** If a floating element (like a FAB) is required, use:
    *   `Box-shadow: 0px 12px 32px rgba(44, 61, 48, 0.06);` 
    *   *Note: The shadow uses a tint of our Forest Green text color, not black, to keep it organic.*
*   **The Ghost Border Fallback:** For inputs, use a 1px border of `outline_variant` (#c5c8bc) at **20% opacity**. It should be felt, not seen.

---

## 5. Components & Primitive Styling

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`). Radius: `full` (pill-shaped) for a friendly, approachable touch.
*   **Secondary:** Ghost style. No background, `outline` color text, and a `Ghost Border` (20% opacity).
*   **Interactions:** On hover/tap, the button should subtly scale (0.98) to mimic the physical compression of a soft material.

### Cards & Lists
*   **Rule:** No dividers. Separate list items using `sm` (0.5rem) vertical spacing or alternating `surface-container` shifts.
*   **Cards:** Use `lg` (2rem) corner radius. This "super-ellipse" feel is softer on the eyes than standard 4px corners.

### Specialized Components
*   **The Breathing Pebble (Action Chip):** Use `secondary_container` (#fe9c84) for meditation or breathing triggers. These should use a "pulser" animation—a soft, slow expansion and contraction of the container.
*   **Progress Indicators:** Instead of a thin line, use a thick, organic "track" using `surface-container-high` and a `primary` fill.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use "Overlapping Content": Have a card slightly overlap a header section to create a sense of architectural depth.
*   **DO** use `xl` (3rem) corner radii for main containers to emphasize the "Soft" vibe.
*   **DO** utilize `on_surface_variant` (#44483f) for secondary text to reduce visual vibration and eye strain.

### Don’t
*   **DON'T** use 100% Black (#000000). Use `on_background` (#1c1c18) or `on_surface`.
*   **DON'T** use sharp corners (0px-4px). They feel "aggressive" and counter-productive to anxiety management.
*   **DON'T** use "Snap" animations. All transitions must use `cubic-bezier(0.4, 0.0, 0.2, 1)`—the "Standard Ease"—at a minimum duration of 300ms to feel fluid and natural.

---

## 7. Spacing & Rhythm
We follow an **8px Linear Scale**, but we prioritize "Macro-Whitespace."
*   Between major sections, use `xl` spacing (48px+).
*   Between related elements, use `md` (16px).
*   **The "Hugging" Rule:** Elements should never feel "tight" in their containers. Ensure internal padding is always one step larger than the external margin to create a "cushioned" effect.