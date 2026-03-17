# COMPLETE BUSINESS & VERIFICATION SPEC

## 1. DATABASE SETUP (Run in Supabase SQL Editor)
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS v_status verification_status DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS company_number TEXT,
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS insurance_doc_url TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS trading_name TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create 'verification-docs' bucket in Supabase Storage manually for insurance PDFs.

## 2. API & LOGIC REQUIREMENTS
- **Companies House API:** Fetch `company_name` and `registered_office_address` using `https://api.company-information.service.gov.uk/company/{number}`. Use Basic Auth (API Key as username, empty password).
- **Address Finder:** Integrate Google Places Autocomplete for the profile address.
- **Auto-Fill Logic:** The `CreateShift` screen must fetch the `business_address` from the profile and set it as the default location value.

## 3. UI & USABILITY (INDEED FLEX STYLE)
- **Profile Layout:** Use a 'Settings Hub' design with clickable tiles.
- **Verification Tile:** Display dynamic states: Red (Unverified), Amber (Pending), or Green (Verified).
- **The Feature Guard:** If `v_status !== 'verified'`:
    - Disable the 'Create Shift' button (opacity 0.5).
    - If clicked, trigger a 'Verification Required' Modal explaining that identity and insurance checks are mandatory.
- **Navigation:** Root Navigator must check `v_status` on mount to determine if the user is locked into the 'Complete Profile' flow.