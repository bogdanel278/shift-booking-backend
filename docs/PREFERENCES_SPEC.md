# Spec: Experience Tiers & Uniform Requirements

## 1. Database Columns (Add via SQL)
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS min_experience_level TEXT DEFAULT 'entry', -- 'entry', 'experienced', 'expert'
ADD COLUMN IF NOT EXISTS uniform_instructions TEXT,
ADD COLUMN IF NOT EXISTS ppe_required BOOLEAN DEFAULT false;

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS default_uniform_instructions TEXT,
ADD COLUMN IF NOT EXISTS default_min_experience TEXT DEFAULT 'entry';

## 2. Shift Creation UI
- **Experience Selector:** Use a Segmented Control or 3 large buttons:
    - [Junior] (0-1 years)
    - [Pro] (2-5 years)
    - [Expert] (5+ years)
- **Uniform Input:** - A 'Smart Template' dropdown with common options: "Full Black (Smart)", "Casual (Clean)", "Safety Gear Provided".
    - A text area for 'Specific Details' (e.g., "Must wear non-slip shoes").

## 3. Auto-Fill Usability
- When a new shift is created, the app should pull the `default_uniform_instructions` from the Business Profile preferences so the manager doesn't have to type them every time.