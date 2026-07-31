# PlanEats — Product Context

## What it is
A web platform that generates personalized meal plans and shopping lists for people short on time. User picks how many days and meals/day (+ optional diet/allergy/dislike/time constraints); the app produces a day-by-day menu, a categorized shopping list (non-perishables buy-once vs. perishables buy-by-date), and a full recipe view per meal.

## Users
Busy adults who want to stop deciding "what's for dinner" every day and want one efficient grocery trip plan instead of several.

## Platform
Web only, responsive (desktop primary use case: weekly planning at a table/desk; mobile secondary use case: checking the shopping list in-store). *(Assumption — not asked explicitly, inferred from the "reduce stress of deciding" + "shopping list" use cases.)*

## Mode per surface
- Setup form → Operate (fast, low-friction task completion)
- Weekly menu view → Operate (scan a week, take action)
- Shopping list view → Operate (checklist, used in-store on mobile)
- Recipe detail view → Read (cook while reading — clarity, hierarchy, no distraction)

## Visual direction
Warm, editorial — feels like a premium cookbook/food magazine, not a productivity SaaS tool.
- Serif display type for recipe names/headers, clean sans for UI chrome and body/instructions.
- Palette: cream/warm-white base, olive/moss green + terracotta accents, charcoal ink text. No pure white, no pure black.
- Generous whitespace, photography-forward feel even where photos are placeholders (styled color blocks with food-adjacent texture) for MVP.

## MVP functional scope (confirmed by user)
1. Setup form: days (7/14/30), meals/day, optional diet type, allergies, disliked ingredients, max prep time.
2. Menu generation: day-by-day meals, avoids excessive repetition within the plan window.
3. Shopping list: categorized non-perishable (buy once, start of period) vs. perishable (grouped by suggested purchase date within the plan).
4. Recipe detail: name, ingredients, step-by-step instructions, prep/cook time.

## Stack (confirmed)
- Frontend: React + TypeScript (Vite), client-side routing.
- Backend: Node.js + Express REST API.
- DB: PostgreSQL (schema included). MVP ships with an in-memory seeded store behind the same API contract so it runs with zero DB setup; swapping to real Postgres is a data-layer change only, not an API change.

## Out of scope for this MVP (explicitly deferred)
- Auth/accounts, external recipe API integrations (Spoonacular/Edamam), persistence across sessions, nutrition tracking, drag-to-swap meal editing.
