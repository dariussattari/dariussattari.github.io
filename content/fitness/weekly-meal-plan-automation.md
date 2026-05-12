# Weekly meal plan automation

Each week, I generate a new **meal plan + grocery list** via a scheduled job (Claude automation).

## What it produces

- A new week folder (incremented week number)
- A structured `meal_plan.json`
- A readable `meal_plan.md`
- A grocery list PDF formatted for Walmart (sections, checkboxes, price estimates, subtotal + budget summary)

## How it works (high level)

- Reads two cookbooks **locally** (not published on this site)
- Builds a 7‑day plan with a consistent structure:
  - **Mon–Fri:** cooked breakfast + cooked dinner; lunch is microwavable meals; plus snacks
  - **Sat–Sun:** all meals cooked; plus snacks
- Consolidates ingredients to keep costs down and make shopping easy

## Why the example on this site is “sanitized”

Cookbooks are copyrighted, so this site only shows **sanitized examples** (meal names + macros) and the automation description — not the full recipe text or directions.

