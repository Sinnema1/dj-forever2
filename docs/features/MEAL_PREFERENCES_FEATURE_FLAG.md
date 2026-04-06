# Meal Preferences Feature Flag Implementation

## Overview

Feature flag system controlling when meal selection is available in the RSVP form. The dinner menu is finalized and the RSVP form can be toggled on or off without code changes.

## Current State

**Feature Status:** ✅ Implemented and tested
**Default State:** **DISABLED** (meal preferences hidden from guests)
**Menu Status:** Finalized — 2 adult entrees, kids menu, dietary accommodation option
**Production Ready:** Yes

## Menu Options

### Adult Entrees (choose one)
| Stored value | Display label |
|---|---|
| `brisket` | BBQ Beef Brisket (with chipotle honey BBQ sauce) |
| `tritip` | Carved Tri Tip (with chimichurri, horseradish cream, or au jus) |

### Kids Menu (ages 3-12, choose one)
| Stored value | Display label |
|---|---|
| `kids_chicken` | Chicken Tenders |
| `kids_mac` | Macaroni and Cheese |

Kids meals served with french fries, fresh fruit, and a juice box.

### Dietary Accommodation
| Stored value | Display label |
|---|---|
| `dietary` | Dietary Accommodation |

For guests who cannot eat either adult entree (Celiac, vegan, severe allergies). Prompts the guest to describe their needs in the existing allergies/dietary restrictions field.

### Shared for Everyone
Field of Greens salad, Roasted Garlic Mashed Potatoes, and Glazed Carrots. These are informational — not selectable options.

## How to Enable/Disable

### Backend (.env or environment variables)

```bash
# Disable meal preferences (default - current state)
ENABLE_MEAL_PREFERENCES=false

# Enable meal preferences
ENABLE_MEAL_PREFERENCES=true
```

### Frontend (.env or environment variables)

```bash
# Disable meal preferences (default - current state)
VITE_ENABLE_MEAL_PREFERENCES=false

# Enable meal preferences
VITE_ENABLE_MEAL_PREFERENCES=true
```

## User Experience

### When Feature is DISABLED (Current State)

**RSVP Form:**

- Guests see a "Dinner Menu" summary banner instead of meal dropdowns
- Banner lists both adult entrees, kids menu, shared sides, and dietary accommodation note
- Guests can still enter food allergies and dietary restrictions
- RSVP submission works without meal preferences

**Admin Dashboard:**

- Meal statistics show finalized entree labels for reporting
- Existing RSVPs with meal preferences display with mapped labels

### When Feature is ENABLED

**RSVP Form:**

- Grouped dropdown appears for each guest with `<optgroup>` sections:
  - Adult Entrees: BBQ Beef Brisket, Carved Tri Tip
  - Kids Menu (ages 3-12): Chicken Tenders, Macaroni and Cheese
  - Dietary Accommodation
- Required field for attending guests
- Shared items displayed as informational text below the dropdown
- Selecting "Dietary Accommodation" shows a hint to describe needs in the allergies field
- Selecting a kids option shows kids meal sides info

**Validation:**

- Meal preference required for attending guests
- Standard validation errors if missing

**Admin Dashboard:**

- Full meal preference statistics by finalized entree label
- Counts by meal type for catering planning
- Admin edit uses a structured dropdown (not free-text input)

## Files Modified

### Backend

- `server/src/config/index.ts` - features.mealPreferencesEnabled config
- `server/src/models/RSVP.ts` - Enum values: brisket, tritip, kids_chicken, kids_mac, dietary
- `server/src/utils/validation.ts` - validPreferences updated to match enum
- `server/src/services/rsvpService.ts` - Passes feature flag to validation
- `server/src/services/adminService.ts` - MEAL_PREFERENCE_LABELS mapping for stats and CSV export

### Frontend

- `client/src/config/features.ts` - Feature flag configuration
- `client/src/components/RSVP/RSVPForm.tsx` - Grouped meal dropdown, shared items note, dietary hint
- `client/src/components/RSVP/MealPreferencesComingSoon.tsx` - Dinner menu summary banner
- `client/src/components/admin/AdminRSVPManager.tsx` - Label mapping and structured dropdown

## Deployment Instructions

### To Enable Meal Preferences

1. Update environment variables on Render.com:

   **Backend Service:**
   - Add/update: `ENABLE_MEAL_PREFERENCES=true`

   **Frontend Service:**
   - Add/update: `VITE_ENABLE_MEAL_PREFERENCES=true`

2. Redeploy both services

3. Meal selection will immediately appear in RSVP form

4. Send notification email to guests who already RSVP'd:
   - "The dinner menu is ready — update your entree selection."
   - Link to RSVP page

## Data Considerations

### Existing RSVPs (submitted before enabling)

- RSVPs remain valid with empty meal preferences
- Admin dashboard can flag them as "Needs meal selection"
- Follow-up email campaign can collect missing preferences
- Guests can edit their RSVP to add meal selections

### New RSVPs After Enabling

- All new RSVPs require one entree selection
- Standard validation applies
- No data migration needed
