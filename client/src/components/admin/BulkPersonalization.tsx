import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADMIN_BULK_UPDATE_PERSONALIZATION } from '../../api/adminQueries';
import { GuestGroup } from '../../models/userTypes';
import './BulkPersonalization.css';

interface CSVRow {
  fullName: string;
  email: string;
  relationshipToBride?: string;
  relationshipToGroom?: string;
  guestGroup?: GuestGroup | '';
  plusOneAllowed?: string;
  customWelcomeMessage?: string;
  specialInstructions?: string;
  dietaryRestrictions?: string;
  personalPhoto?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

/**
 * BulkPersonalization - CSV Upload Component for Bulk Guest Personalization
 *
 * Allows admins to upload a CSV file with guest personalization data and
 * preview before importing. Includes validation, error handling, and rollback.
 */
const BulkPersonalization: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [bulkUpdatePersonalization] = useMutation(
    ADMIN_BULK_UPDATE_PERSONALIZATION
  );

  // Download CSV template
  const downloadTemplate = () => {
    const template = `fullName,email,relationshipToBride,relationshipToGroom,guestGroup,plusOneAllowed,customWelcomeMessage,specialInstructions,dietaryRestrictions,personalPhoto
"John Doe","john@example.com","College Friend","","friends","true","We're so excited to celebrate with you!","Hotel block at Marriott downtown","Vegetarian","https://example.com/photo.jpg"
"Jane Smith","jane@example.com","","Sister","brides_family","false","","Shuttle service available from hotel","Gluten-free",""`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest_personalization_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Parse CSV file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  // Parse CSV text
  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setValidationErrors([
        { row: 0, field: 'file', message: 'CSV file is empty or invalid' },
      ]);
      return;
    }

    const headers = parseCSVLine(lines[0]!);

    const data: CSVRow[] = [];
    const errors: ValidationError[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.trim() === '') continue;

      const values = parseCSVLine(line);
      const row: any = {};

      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || '';
      });

      // Validate required fields
      if (!row.fullName || !row.email) {
        errors.push({
          row: i + 1,
          field: !row.fullName ? 'fullName' : 'email',
          message: `Row ${i + 1}: Missing required field ${!row.fullName ? 'fullName' : 'email'}`,
        });
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push({
          row: i + 1,
          field: 'email',
          message: `Row ${i + 1}: Invalid email format`,
        });
        continue;
      }

      // Validate guestGroup enum
      if (
        row.guestGroup &&
        ![
          'grooms_family',
          'brides_family',
          'friends',
          'extended_family',
          'other',
        ].includes(row.guestGroup)
      ) {
        errors.push({
          row: i + 1,
          field: 'guestGroup',
          message: `Row ${i + 1}: Invalid guestGroup. Must be one of: grooms_family, brides_family, friends, extended_family, other`,
        });
        continue;
      }

      // Validate plusOneAllowed
      if (
        row.plusOneAllowed &&
        !['true', 'false', ''].includes(row.plusOneAllowed.toLowerCase())
      ) {
        errors.push({
          row: i + 1,
          field: 'plusOneAllowed',
          message: `Row ${i + 1}: plusOneAllowed must be 'true' or 'false'`,
        });
        continue;
      }

      // Validate character limits
      if (row.relationshipToBride && row.relationshipToBride.length > 100) {
        errors.push({
          row: i + 1,
          field: 'relationshipToBride',
          message: `Row ${i + 1}: relationshipToBride exceeds 100 characters`,
        });
        continue;
      }

      if (row.customWelcomeMessage && row.customWelcomeMessage.length > 500) {
        errors.push({
          row: i + 1,
          field: 'customWelcomeMessage',
          message: `Row ${i + 1}: customWelcomeMessage exceeds 500 characters`,
        });
        continue;
      }

      data.push({
        fullName: row.fullName,
        email: row.email,
        relationshipToBride: row.relationshipToBride || undefined,
        relationshipToGroom: row.relationshipToGroom || undefined,
        guestGroup: (row.guestGroup as GuestGroup) || undefined,
        plusOneAllowed: row.plusOneAllowed || undefined,
        customWelcomeMessage: row.customWelcomeMessage || undefined,
        specialInstructions: row.specialInstructions || undefined,
        dietaryRestrictions: row.dietaryRestrictions || undefined,
        personalPhoto: row.personalPhoto || undefined,
      });
    }

    setCsvData(data);
    setValidationErrors(errors);
    setShowPreview(data.length > 0);
    setImportResult(null);
  };

  // Simple CSV line parser (handles quoted fields)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  };

  // Import data
  const handleImport = async () => {
    if (csvData.length === 0) return;

    setIsProcessing(true);

    try {
      // Build updates array for GraphQL mutation
      const updates = csvData.map(row => {
        const personalization: any = {};

        if (row.relationshipToBride)
          personalization.relationshipToBride = row.relationshipToBride;
        if (row.relationshipToGroom)
          personalization.relationshipToGroom = row.relationshipToGroom;
        if (row.guestGroup) personalization.guestGroup = row.guestGroup;
        if (row.customWelcomeMessage)
          personalization.customWelcomeMessage = row.customWelcomeMessage;
        if (row.specialInstructions)
          personalization.specialInstructions = row.specialInstructions;
        if (row.dietaryRestrictions)
          personalization.dietaryRestrictions = row.dietaryRestrictions;
        if (row.personalPhoto)
          personalization.personalPhoto = row.personalPhoto;

        personalization.plusOneAllowed =
          row.plusOneAllowed?.toLowerCase() === 'true';

        return {
          email: row.email,
          personalization,
        };
      });

      // Execute bulk update mutation
      const { data } = await bulkUpdatePersonalization({
        variables: { updates },
      });

      // Set results from mutation response
      if (data?.adminBulkUpdatePersonalization) {
        setImportResult({
          success: data.adminBulkUpdatePersonalization.success,
          failed: data.adminBulkUpdatePersonalization.failed,
          errors: data.adminBulkUpdatePersonalization.errors,
        });
      }
    } catch (error: any) {
      // Handle mutation errors
      setImportResult({
        success: 0,
        failed: csvData.length,
        errors: [
          {
            email: 'BATCH',
            error: error.message || 'Failed to execute bulk update',
          },
        ],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bulk-personalization">
      <div className="bulk-header">
        <h2>Bulk Guest Personalization</h2>
        <p>
          Upload a CSV file to update multiple guest personalization settings at
          once
        </p>
      </div>

      <div className="bulk-actions">
        <button onClick={downloadTemplate} className="download-template-btn">
          📥 Download CSV Template
        </button>

        <div className="file-upload-section">
          <label htmlFor="csv-upload" className="upload-label">
            📄 Upload CSV File
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="file-input"
          />
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h3>⚠️ Validation Errors</h3>
          <p>
            {validationErrors.length} error(s) found. Please fix these before
            importing:
          </p>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>
                <strong>Row {error.row}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showPreview && csvData.length > 0 && (
        <div className="preview-section">
          <h3>Preview ({csvData.length} records)</h3>
          <p>
            Review the data before importing. This will update existing guest
            records.
          </p>

          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Bride Relation</th>
                  <th>Groom Relation</th>
                  <th>Group</th>
                  <th>Plus One</th>
                  <th>Message</th>
                  <th>Instructions</th>
                  <th>Dietary</th>
                </tr>
              </thead>
              <tbody>
                {csvData.slice(0, 10).map((row, index) => (
                  <tr key={index}>
                    <td>{row.fullName}</td>
                    <td>{row.email}</td>
                    <td>{row.relationshipToBride || '-'}</td>
                    <td>{row.relationshipToGroom || '-'}</td>
                    <td>{row.guestGroup || '-'}</td>
                    <td>{row.plusOneAllowed === 'true' ? '✅' : '❌'}</td>
                    <td title={row.customWelcomeMessage}>
                      {row.customWelcomeMessage ? '📝' : '-'}
                    </td>
                    <td title={row.specialInstructions}>
                      {row.specialInstructions ? '📋' : '-'}
                    </td>
                    <td title={row.dietaryRestrictions}>
                      {row.dietaryRestrictions ? '🍽️' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {csvData.length > 10 && (
              <p className="preview-note">
                Showing first 10 of {csvData.length} records
              </p>
            )}
          </div>

          <div className="import-actions">
            <button
              onClick={handleImport}
              disabled={isProcessing || validationErrors.length > 0}
              className="import-btn"
            >
              {isProcessing
                ? 'Importing...'
                : `Import ${csvData.length} Records`}
            </button>
            <button
              onClick={() => {
                setCsvData([]);
                setShowPreview(false);
                setImportResult(null);
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {importResult && (
        <div className="import-result">
          <h3>Import Results</h3>
          <div className="result-stats">
            <div className="stat-success">
              <span className="stat-number">{importResult.success}</span>
              <span className="stat-label">Successful</span>
            </div>
            <div className="stat-failed">
              <span className="stat-number">{importResult.failed}</span>
              <span className="stat-label">Failed</span>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="import-errors">
              <h4>Errors:</h4>
              <ul>
                {importResult.errors.map((error, index) => (
                  <li key={index}>
                    <strong>{error.email}:</strong> {error.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="bulk-instructions">
        <h3>Instructions</h3>
        <ol>
          <li>Download the CSV template to see the required format</li>
          <li>Fill in guest information (fullName and email are required)</li>
          <li>Upload your completed CSV file</li>
          <li>Review the preview to ensure data is correct</li>
          <li>Click "Import" to update guest records</li>
        </ol>

        <h4>Field Specifications:</h4>
        <ul>
          <li>
            <strong>fullName</strong>: Required. Guest's full name
          </li>
          <li>
            <strong>email</strong>: Required. Must match existing guest email
          </li>
          <li>
            <strong>relationshipToBride</strong>: Optional. Max 100 characters
          </li>
          <li>
            <strong>relationshipToGroom</strong>: Optional. Max 100 characters
          </li>
          <li>
            <strong>guestGroup</strong>: Optional. One of: grooms_family,
            brides_family, friends, extended_family, other
          </li>
          <li>
            <strong>plusOneAllowed</strong>: Optional. 'true' or 'false'
          </li>
          <li>
            <strong>customWelcomeMessage</strong>: Optional. Max 500 characters
          </li>
          <li>
            <strong>specialInstructions</strong>: Optional. Max 1000 characters
          </li>
          <li>
            <strong>dietaryRestrictions</strong>: Optional. Max 500 characters
          </li>
          <li>
            <strong>personalPhoto</strong>: Optional. URL to photo (max 500
            characters)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BulkPersonalization;
