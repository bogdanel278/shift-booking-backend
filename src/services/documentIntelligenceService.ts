import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';

export interface PassportExtractedFields {
  passportNumber: string;
  expiryDate: string;
  countryOfIssue: string;
  name: string;
  dateOfBirth: string;
}

export interface GenericExtractedFields {
  documentNumber: string;
  expiryDate: string;
  countryOfIssue: string;
  name: string;
  dateOfBirth: string;
  visaType: string;
  shareCode: string;
  rawText: string;
}

export class DocumentIntelligenceService {
  private client: DocumentAnalysisClient;

  private isPlaceholderValue(value: string): boolean {
    const normalized = value.toLowerCase();
    return (
      normalized.includes('your-resource-name') ||
      normalized.includes('yourresource') ||
      normalized.includes('your_azure_document_intelligence_key') ||
      normalized.includes('changeme')
    );
  }

  private validateConfiguration(endpoint: string, key: string): void {
    if (this.isPlaceholderValue(endpoint) || this.isPlaceholderValue(key)) {
      throw new Error(
        'Azure Document Intelligence is using placeholder values. Update AZURE_DOC_INTELLIGENCE_ENDPOINT and AZURE_DOC_INTELLIGENCE_KEY in .env.',
      );
    }

    try {
      const parsed = new URL(endpoint);
      if (!parsed.hostname || !parsed.hostname.includes('cognitiveservices.azure.com')) {
        throw new Error('invalid-host');
      }
    } catch {
      throw new Error(
        'AZURE_DOC_INTELLIGENCE_ENDPOINT is invalid. Expected format: https://<resource-name>.cognitiveservices.azure.com/',
      );
    }
  }

  private mapAzureError(error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error);
    const normalized = message.toLowerCase();

    if (normalized.includes('getaddrinfo') && normalized.includes('enotfound')) {
      return new Error(
        'Cannot resolve Azure Document Intelligence endpoint. Check AZURE_DOC_INTELLIGENCE_ENDPOINT in .env (resource host name is likely wrong).',
      );
    }

    if (normalized.includes('401') || normalized.includes('unauthorized') || normalized.includes('forbidden')) {
      return new Error(
        'Azure Document Intelligence authentication failed. Check AZURE_DOC_INTELLIGENCE_KEY.',
      );
    }

    return new Error(`Document extraction failed: ${message}`);
  }

  constructor() {
    const endpoint = process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT;
    const key = process.env.AZURE_DOC_INTELLIGENCE_KEY;

    if (!endpoint || !key) {
      throw new Error('Azure Document Intelligence is not configured. Set AZURE_DOC_INTELLIGENCE_ENDPOINT and AZURE_DOC_INTELLIGENCE_KEY.');
    }

    this.validateConfiguration(endpoint, key);

    this.client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
  }

  private fieldText(field: any): string {
    if (!field) return '';

    if (field.valueString) return String(field.valueString);
    if (field.valueDate) return String(field.valueDate);
    if (field.valueCountryRegion) return String(field.valueCountryRegion);
    if (field.valueName) return String(field.valueName);
    if (field.content) return String(field.content);

    return '';
  }

  async analyzePassport(buffer: Buffer): Promise<PassportExtractedFields> {
    let result;
    try {
      const poller = await this.client.beginAnalyzeDocument('prebuilt-idDocument', buffer);
      result = await poller.pollUntilDone();
    } catch (error) {
      throw this.mapAzureError(error);
    }

    const doc = result.documents?.[0];
    const fields: any = doc?.fields || {};

    const firstName = this.fieldText(fields.FirstName || fields.GivenNames || fields.GivenName);
    const lastName = this.fieldText(fields.LastName || fields.Surname || fields.FamilyName);
    const fullName = this.fieldText(fields.FullName || fields.Name);

    const name = [firstName, lastName].filter(Boolean).join(' ').trim() || fullName;

    return {
      passportNumber: this.fieldText(fields.DocumentNumber || fields.PassportNumber),
      expiryDate: this.fieldText(fields.DateOfExpiration || fields.ExpiryDate),
      countryOfIssue: this.fieldText(fields.IssuingCountryRegion || fields.CountryRegion || fields.Nationality),
      name,
      dateOfBirth: this.fieldText(fields.DateOfBirth || fields.BirthDate),
    };
  }

  private findDateInText(text: string, labels: string[]): string {
    const lines = text.split('\n');

    const extractDate = (input: string): string => {
      const normalized = input.replace(/\b([A-Za-z]{3,})\/([A-Za-z]{3,})\b/g, '$2');

      const numeric = normalized.match(/(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/);
      if (numeric?.[1]) return numeric[1];

      const dayMonthYear = normalized.match(/(\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{2,4})/i);
      if (dayMonthYear?.[1]) return dayMonthYear[1];

      const monthDayYear = normalized.match(/((?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{1,2},?\s+\d{2,4})/i);
      if (monthDayYear?.[1]) return monthDayYear[1];

      return '';
    };

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (!labels.some((label) => lower.includes(label))) continue;

      const matchedDate = extractDate(line);
      if (matchedDate) return matchedDate;
    }

    // OCR sometimes places labels and dates on adjacent lines.
    for (let index = 0; index < lines.length - 1; index += 1) {
      const current = lines[index].toLowerCase();
      if (!labels.some((label) => current.includes(label))) continue;
      const matchedDate = extractDate(`${lines[index]} ${lines[index + 1]}`);
      if (matchedDate) return matchedDate;
    }

    return '';
  }

  private findTokenInText(text: string, labels: string[], pattern: RegExp): string {
    const lines = text.split('\n');
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (!labels.some((label) => lower.includes(label))) continue;
      const match = line.match(pattern);
      if (match?.[1]) return match[1];
    }

    const fallback = text.match(pattern);
    return fallback?.[1] || '';
  }

  private normalizeShareCode(value: string): string {
    const normalized = value
      .toUpperCase()
      .replace(/[–—−_]/g, '-')
      .replace(/\s*-\s*/g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^A-Z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const compact = normalized.replace(/-/g, '');
    if (/^[A-Z0-9]{9}$/.test(compact)) {
      return compact;
    }

    return normalized;
  }

  private findShareCodeInText(text: string): string {
    const normalizedText = text.replace(/[–—−_]/g, '-');
    const exactMatch = normalizedText.match(/\b([A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3})\b/i);
    if (exactMatch?.[1]) {
      return this.normalizeShareCode(exactMatch[1]);
    }

    const exactNoDashMatch = normalizedText.match(/\b([A-Z0-9]{9})\b/i);
    if (exactNoDashMatch?.[1]) {
      return this.normalizeShareCode(exactNoDashMatch[1]);
    }

    const lines = normalizedText.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (!/share\s*code/i.test(line)) continue;

      const searchWindow = [line, lines[index + 1] || '', lines[index + 2] || ''].join(' ');
      const labeledMatch = searchWindow.match(/share\s*code\s*[:#-]?\s*([A-Z0-9]{3})[\s-]*([A-Z0-9]{3})[\s-]*([A-Z0-9]{3})/i);
      if (labeledMatch) {
        return this.normalizeShareCode(`${labeledMatch[1]}-${labeledMatch[2]}-${labeledMatch[3]}`);
      }

      // OCR can split characters by spaces, e.g. A B C 1 2 3 X Y Z.
      const compactWindow = searchWindow.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const compactMatch = compactWindow.match(/([A-Z0-9]{9})/);
      if (compactMatch?.[1]) {
        return this.normalizeShareCode(compactMatch[1]);
      }
    }

    const fallbackGroups = normalizedText.match(/\b([A-Z0-9]{3})[\s-]+([A-Z0-9]{3})[\s-]+([A-Z0-9]{3})\b/i);
    if (fallbackGroups) {
      return this.normalizeShareCode(`${fallbackGroups[1]}-${fallbackGroups[2]}-${fallbackGroups[3]}`);
    }

    return '';
  }

  async analyzeGeneric(buffer: Buffer): Promise<GenericExtractedFields> {
    let result;
    try {
      const poller = await this.client.beginAnalyzeDocument('prebuilt-read', buffer);
      result = await poller.pollUntilDone();
    } catch (error) {
      throw this.mapAzureError(error);
    }

    const rawText = result.content || '';

    const name = this.findTokenInText(rawText, ['name'], /name\s*[:#-]?\s*([A-Za-z][A-Za-z\s'-]{2,})/i);
    const documentNumber = this.findTokenInText(rawText, ['number', 'document', 'id', 'visa'], /(?:number|document|id|visa)\s*[:#-]?\s*([A-Z0-9-]{6,24})/i);
    const shareCode = this.findShareCodeInText(rawText);
    const visaType = this.findTokenInText(rawText, ['visa type', 'type'], /visa\s*type\s*[:#-]?\s*([A-Za-z][A-Za-z\s-]{2,})/i);
    const countryOfIssue = this.findTokenInText(rawText, ['country', 'issuing'], /(?:country|issuing\s*country)\s*[:#-]?\s*([A-Za-z][A-Za-z\s]{2,})/i);
    const dateOfBirth = this.findDateInText(rawText, ['date of birth', 'birth']);
    const expiryDate = this.findDateInText(rawText, ['expiry', 'expiration', 'expire', 'expires', 'will expire', 'valid until']);

    return {
      documentNumber,
      expiryDate,
      countryOfIssue,
      name,
      dateOfBirth,
      visaType,
      shareCode,
      rawText,
    };
  }
}
