import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { EXPORT_GUEST_LIST } from '../../api/adminQueries';
import './AdminGuestExport.css';

/**
 * Admin Guest Export - Data export functionality for wedding planning.
 * Allows administrators to export guest list and RSVP data in CSV format.
 */
const AdminGuestExport: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [exportGuestList] = useLazyQuery(EXPORT_GUEST_LIST, {
    onCompleted: data => {
      if (data.adminExportGuestList) {
        downloadCSV(data.adminExportGuestList);
      }
      setIsExporting(false);
    },
    onError: error => {
      setExportError(error.message);
      setIsExporting(false);
    },
  });

  const downloadCSV = (csvData: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `wedding-guest-list-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportError(null);
    exportGuestList();
  };

  return (
    <div className="admin-guest-export">
      <div className="export-header">
        <h2>Export Guest Data</h2>
        <p>
          Download complete guest list and RSVP information for wedding planning
          purposes.
        </p>
      </div>

      <div className="export-info">
        <h3>Export Contents</h3>
        <div className="export-contents">
          <div className="content-section">
            <h4>Guest Information</h4>
            <ul>
              <li>Full Name</li>
              <li>Email Address</li>
              <li>RSVP Status</li>
              <li>QR Token</li>
              <li>Invited Date</li>
            </ul>
          </div>

          <div className="content-section">
            <h4>RSVP Details</h4>
            <ul>
              <li>Attendance Status (YES/NO/MAYBE)</li>
              <li>Guest Count</li>
              <li>Meal Preferences (per guest)</li>
              <li>Dietary Restrictions/Allergies</li>
              <li>Additional Notes</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="export-actions">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="export-button"
          aria-label="Export guest list as CSV file"
        >
          {isExporting ? (
            <>
              <div className="export-spinner" aria-hidden />
              Exporting...
            </>
          ) : (
            'Export Guest List (CSV)'
          )}
        </button>

        {exportError && (
          <div className="export-error" role="alert">
            <p>Export failed: {exportError}</p>
            <button onClick={handleExport} className="retry-button">
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="export-notes">
        <h3>Notes</h3>
        <ul>
          <li>
            The export includes all invited guests with their current RSVP
            status
          </li>
          <li>File will be saved as "wedding-guest-list-[date].csv"</li>
          <li>Data is current as of the time of export</li>
          <li>QR tokens are included for reference (keep this file secure)</li>
          <li>
            CSV can be opened in Excel, Google Sheets, or any spreadsheet
            software
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminGuestExport;
