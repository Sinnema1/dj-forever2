# Meal Preferences Feature Flag Implementation

## Overview

Implemented a feature flag system to control when meal selection is available in the RSVP form. This allows you to disable meal preferences until the menu is finalized in April, then re-enable it without code changes.

## Current State

**Feature Status:** ✅ Implemented and tested  
**Default State:** **DISABLED** (meal preferences hidden from guests)  
**Production Ready:** Yes

## How to Enable/Disable

### Backend (.env or environment variables)

```bash
# Disable meal preferences (default - current state)
ENABLE_MEAL_PREFERENCES=false

# Enable meal preferences (after menu is finalized)
ENABLE_MEAL_PREFERENCES=true
```

### Frontend (.env or environment variables)

```bash
# Disable meal preferences (default - current state)
VITE_ENABLE_MEAL_PREFERENCES=false

# Enable meal preferences (after menu is finalized)
VITE_ENABLE_MEAL_PREFERENCES=true
```

## User Experience

### When Feature is DISABLED (Current State)

**RSVP Form:**

- Guests see an attractive "Coming Soon" banner instead of meal dropdowns
- Banner message: "Menu Selection Coming in April"
- Lists feature preview: email notification, dietary options, kids menu
- Guests can still enter food allergies and dietary restrictions
- RSVP submission works without meal preferences

**Validation:**

- No meal preference required for attending guests
- RSVPs succeed without meal selections
- Allergies/dietary restrictions still collected

**Admin Dashboard:**

- Meal statistics section would show "Menu not yet finalized"
- Existing RSVPs with meal preferences still display correctly

### When Feature is ENABLED (After April)

**RSVP Form:**

- Full meal selection dropdown appears for each guest
- Required field for attending guests
- Options: Chicken, Beef, Fish, Vegetarian, Vegan, Kids Menu
- Real-time validation

**Validation:**

- Meal preference required for attending guests
- Standard validation errors if missing

**Admin Dashboard:**

- Full meal preference statistics
- Counts by meal type for catering planning

## Files Modified

### Backend

- `server/src/config/index.ts` - Added features.mealPreferencesEnabled config
- `server/src/utils/validation.ts` - Made validateMealPreference accept feature flag parameter
- `server/src/services/rsvpService.ts` - Pass feature flag to all validation calls
- `server/src/graphql/typeDefs.ts` - Made mealPreference optional in GraphQL schema
- `server/src/models/RSVP.ts` - Made mealPreference field not required at model level
- `server/src/types/graphql.ts` - Added qrAlias to AdminUserUpdateInput (from previous work)
- `server/tests/rsvp.e2e.test.ts` - Updated tests to handle both feature states

### Frontend

- `client/src/config/features.ts` - **NEW** - Feature flag configuration
- `client/src/components/RSVP/RSVPForm.tsx` - Conditional rendering based on feature flag
- `client/src/components/RSVP/MealPreferencesComingSoon.tsx` - **NEW** - Coming soon banner
- `client/src/components/RSVP/MealPreferencesComingSoon.css` - **NEW** - Banner styles

### Configuration

- `server/.env.example` - Added ENABLE_MEAL_PREFERENCES documentation
- `client/.env.example` - Added VITE_ENABLE_MEAL_PREFERENCES documentation

## Testing Results

### Backend Tests (server/tests/rsvp.e2e.test.ts)

✅ **With Feature DISABLED:** 9/9 tests passing

- RSVPs succeed without meal preferences
- Validation skips meal requirement
- All other validations work normally

✅ **With Feature ENABLED:** 9/9 tests passing

- Meal preferences required for attending guests
- Validation errors thrown when missing
- Standard behavior maintained

### Build Verification

✅ **Backend Build:** TypeScript compilation successful  
✅ **Frontend Build:** Vite production build successful

## Deployment Instructions

### For Current State (Meal Preferences DISABLED)

**No action required** - feature is disabled by default in both environments.

1. Verify `.env` files exist:

   ```bash
   # Server: server/.env
   ENABLE_MEAL_PREFERENCES=false

   # Client: client/.env
   VITE_ENABLE_MEAL_PREFERENCES=false
   ```

2. Deploy normally:

   ```bash
   # Backend
   cd server && npm install && npm run build

   # Frontend
   cd client && npm install && npm run build
   ```

3. Guests will see "Coming Soon" banner when RSVPing

### To Enable Meal Preferences (After April)

1. Update environment variables on Render.com (or hosting platform):

   **Backend Service:**
   - Add/update: `ENABLE_MEAL_PREFERENCES=true`

   **Frontend Service:**
   - Add/update: `VITE_ENABLE_MEAL_PREFERENCES=true`

2. Redeploy both services (or Render auto-deploys on env var change)

3. Meal selection will immediately appear in RSVP form

4. Send notification email to guests who already RSVP'd:
   - "Menu options now available! Update your meal preferences"
   - Link to RSVP page

## Data Considerations

### Existing RSVPs

**Scenario:** Some guests RSVP'd while feature was disabled (no meal preferences)

**Solution:**

- These RSVPs remain valid with empty meal preferences
- Admin dashboard can flag them as "Needs meal selection"
- Follow-up email campaign to collect missing preferences
- Guests can edit their RSVP to add meal selections

### New RSVPs After Enabling

- All new RSVPs require meal preferences
- Standard validation applies
- No data migration needed

## Admin Dashboard Notes

The meal preferences feature flag also affects:

1. **Statistics Display:**
   - When disabled: Could show "Menu to be announced"
   - When enabled: Shows full meal preference breakdown

2. **Guest Management:**
   - Existing meal data always visible (if present)
   - Editing RSVPs respects current feature flag state

3. **Data Export:**
   - CSV exports include meal preferences regardless of flag
   - Allows admin to see who needs follow-up

## Troubleshooting

### "Feature not toggling after env var change"

**Problem:** Changed env var but feature still shows old state

**Solutions:**

- Backend: Restart server process
- Frontend: Clear browser cache + rebuild
- Render: Trigger manual redeploy after env var change

### "Tests failing after enabling feature"

**Problem:** Some tests fail when `ENABLE_MEAL_PREFERENCES=true`

**Solution:**

- Tests are designed to handle both states
- Check that test environment is using correct env var
- Run: `ENABLE_MEAL_PREFERENCES=true npm run test:rsvp:server`

### "Guests see meal options but can't select"

**Problem:** Frontend shows dropdowns but backend rejects

**Cause:** Frontend and backend feature flags out of sync

**Solution:**

- Both must be enabled together
- Check both services have matching env vars

## Future Enhancements

### Notification System

When enabling feature in April:

1. **Email Campaign:**
   - Query users: `db.users.find({ hasRSVPed: true })`
   - Filter RSVPs missing meal preferences
   - Send "Menu now available" email with RSVP link

2. **In-App Banner:**
   - Show notification on next login
   - "New: Select your meal preferences!"

### Admin Controls

Consider adding admin dashboard toggle:

- Real-time feature enable/disable
- No deployment required
- Stored in database settings collection

### Analytics

Track meal selection adoption:

- How many guests update preferences post-enable
- Most popular meal choices
- Timeline of selections

## Summary

✅ Feature successfully implemented  
✅ Both enabled and disabled states tested  
✅ Default state is DISABLED until April  
✅ Zero data migration required  
✅ Simple environment variable toggle  
✅ Guest experience clearly communicated

**Next Steps:**

1. Deploy with feature disabled (current state)
2. Collect RSVPs without meal preferences
3. In April, flip env vars to `true`
4. Send notification to existing guests
5. Collect meal preferences for final headcount
