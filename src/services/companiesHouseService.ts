/**
 * Companies House API Service
 * 
 * Fetches company information from the UK Companies House API
 * API Docs: https://developer.company-information.service.gov.uk/
 */

const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY || 'YOUR_API_KEY_HERE';
const COMPANIES_HOUSE_BASE_URL = 'https://api.company-information.service.gov.uk';

export interface CompanyData {
    company_name: string;
    company_number: string;
    registered_office_address: {
        address_line_1?: string;
        address_line_2?: string;
        locality?: string;
        region?: string;
        postal_code?: string;
        country?: string;
    };
    company_status: string;
    type: string;
    date_of_creation?: string;
    sic_codes?: string[];
}

export interface CompaniesHouseError {
    error: string;
    message: string;
}

/**
 * Fetch company data by company number
 * @param companyNumber - UK Company Number (e.g., "12345678" or "AB123456")
 * @returns Company data or null if not found
 */
export async function fetchCompanyData(companyNumber: string): Promise<CompanyData | null> {
    try {
        // Clean company number - remove spaces and convert to uppercase
        const cleanNumber = companyNumber.replace(/\s/g, '').toUpperCase();

        if (!cleanNumber || cleanNumber.length < 6) {
            throw new Error('Invalid company number format');
        }

        // Create Basic Auth header using base64
        // Format: "API_KEY:" (username is API key, password is empty)
        const credentials = `${COMPANIES_HOUSE_API_KEY}:`;
        const base64Credentials = btoa(credentials);

        console.log('🔍 Fetching company data for:', cleanNumber);

        const response = await fetch(
            `${COMPANIES_HOUSE_BASE_URL}/company/${cleanNumber}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${base64Credentials}`,
                    'Accept': 'application/json',
                },
            }
        );

        if (response.status === 404) {
            console.warn('❌ Company not found:', cleanNumber);
            return null;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Companies House API error:', response.status, errorData);
            throw new Error(`Failed to fetch company data: ${response.status}`);
        }

        const data: CompanyData = await response.json();
        console.log('✅ Company data fetched:', data.company_name);

        return data;
    } catch (error) {
        console.error('💥 Error fetching company data:', error);
        throw error;
    }
}

/**
 * Format registered office address as a single string
 */
export function formatCompanyAddress(address: CompanyData['registered_office_address']): string {
    const parts = [
        address.address_line_1,
        address.address_line_2,
        address.locality,
        address.region,
        address.postal_code,
        address.country,
    ].filter(Boolean);

    return parts.join(', ');
}

/**
 * Validate UK company number format
 */
export function isValidCompanyNumber(companyNumber: string): boolean {
    const cleaned = companyNumber.replace(/\s/g, '').toUpperCase();

    // UK company numbers are either:
    // - 8 digits (e.g., 12345678)
    // - 2 letters followed by 6 digits (e.g., SC123456, NI123456)
    const pattern = /^([0-9]{8}|[A-Z]{2}[0-9]{6})$/;

    return pattern.test(cleaned);
}
