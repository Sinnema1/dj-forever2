# QR Test Cleanup Notes

## Test Failures

After implementing the QR-only login system, the following tests need to be updated:

1. **Navbar.e2e.test.tsx**:

   - The test is looking for a Login button that has been replaced with an informational message
   - Update test to verify the QR login guidance message instead

2. **QRLoginModal.e2e.test.tsx**:

   - This component has been removed since login is now handled via QR code URL
   - The test should be either deleted or rewritten to test the QRTokenLogin component

3. **App.e2e.test.tsx**:
   - Apollo MockedProvider error
   - Need to update Apollo mocks to match the queries/mutations used in the actual code

## Recommended Actions

1. Delete QRLoginModal.e2e.test.tsx (since the component was removed)
2. Update Navbar.e2e.test.tsx to check for the QR login message instead of a button
3. Update App.e2e.test.tsx to fix Apollo mock setup

## Next Personalization Opportunities

Consider these additional enhancements to further personalize the guest experience:

1. **Custom RSVP Questions**: Add custom questions based on guest type (e.g., dietary preferences, song requests)
2. **Family/Group Management**: Group guests by family/group for coordinated RSVPs
3. **Travel Information**: Display personalized travel recommendations based on guest location
4. **Gift Registry Targeting**: Show different registry items based on relationship to couple
5. **Countdown Milestones**: Send personalized notifications at wedding milestones (100 days to go, etc.)
6. **Photo Sharing**: Allow guests to upload photos to a shared gallery
7. **Table Assignments**: Show table assignments when available
8. **Digital Guestbook**: Allow guests to leave messages before the wedding
9. **Meal Selection Preview**: Show custom meal options based on dietary preferences

These features can be implemented by expanding the user model and leveraging the QR-token based authentication system already in place.
