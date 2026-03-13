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

  constructor() {
    const endpoint = process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT;
    const key = process.env.AZURE_DOC_INTELLIGENCE_KEY;

    if (!endpoint || !key) {
      throw new Error('Azure Document Intelligence is not configured. Set AZURE_DOC_INTELLIGENCE_ENDPOINT and AZURE_DOC_INTELLIGENCE_KEY.');
    }

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
    const poller = await this.client.beginAnalyzeDocument('prebuilt-idDocument', buffer);
    const result = await poller.pollUntilDone();

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
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (!labels.some((label) => lower.includes(label))) continue;

      const dateMatch = line.match(/(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/);
      if (dateMatch?.[1]) return dateMatch[1];
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

  async analyzeGeneric(buffer: Buffer): Promise<GenericExtractedFields> {
    const poller = await this.client.beginAnalyzeDocument('prebuilt-read', buffer);
    const result = await poller.pollUntilDone();

    const rawText = result.content || '';

    const name = this.findTokenInText(rawText, ['name'], /name\s*[:#-]?\s*([A-Za-z][A-Za-z\s'-]{2,})/i);
    const documentNumber = this.findTokenInText(rawText, ['number', 'document', 'id', 'visa'], /(?:number|document|id|visa)\s*[:#-]?\s*([A-Z0-9-]{6,24})/i);
    const shareCode = this.findTokenInText(rawText, ['share code'], /share\s*code\s*[:#-]?\s*([A-Z0-9-]{6,24})/i);
    const visaType = this.findTokenInText(rawText, ['visa type', 'type'], /visa\s*type\s*[:#-]?\s*([A-Za-z][A-Za-z\s-]{2,})/i);
    const countryOfIssue = this.findTokenInText(rawText, ['country', 'issuing'], /(?:country|issuing\s*country)\s*[:#-]?\s*([A-Za-z][A-Za-z\s]{2,})/i);
    const dateOfBirth = this.findDateInText(rawText, ['date of birth', 'birth']);
    const expiryDate = this.findDateInText(rawText, ['expiry', 'expiration', 'valid until']);

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
