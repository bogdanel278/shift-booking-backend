"I need to implement a Google-style Address Finder and an auto-fill system.

Address Finder: In the CompleteProfileScreen and ProfileDetailsScreen, implement an address autocomplete search (using a library like react-native-google-places-autocomplete).

Database Update: Ensure that selecting an address saves the full string to the business_address column in Supabase.

Shift Auto-Fill: On the CreateShiftScreen, fetch the business's business_address using the current user session.

Defaulting: Set the initial state of the 'Location' input in the shift form to this fetched address. The user should not have to type it again.

Override: Add a 'Use a different location' link. If clicked, it clears the field and allows a one-time address search for that specific shift.

Usability Note: Ensure the 'Arrival Instructions' (e.g., 'Park in the back') also carries over if possible."