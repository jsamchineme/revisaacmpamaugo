"use client";

import { useState, useCallback } from "react";

interface CsvRow {
  name: string;
  phone: string;
  email: string;
}

interface ImportResult {
  imported: number;
  updated: number;
  errors: string[];
}

interface CsvImportProps {
  onImport: () => void;
}

function parseCSVPreview(text: string): { headers: string[]; rows: CsvRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return { headers: [], rows: [], errors: ["Empty file"] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
  const nameIdx = headers.indexOf("name");
  const phoneIdx = headers.indexOf("phone");
  const emailIdx = headers.indexOf("email");

  if (nameIdx === -1 || phoneIdx === -1) {
    return { headers, rows: [], errors: ["Missing required headers: name, phone"] };
  }

  const rows: CsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseLine(lines[i]);
    if (row.length < 2) continue;

    const name = row[nameIdx]?.trim();
    const phone = row[phoneIdx]?.trim();
    const email = emailIdx !== -1 ? row[emailIdx]?.trim() : "";

    if (!name) {
      errors.push(`Row ${i + 1}: missing name`);
      continue;
    }
    if (!phone) {
      errors.push(`Row ${i + 1}: missing phone`);
      continue;
    }

    rows.push({ name, phone, email });
  }

  return { headers, rows, errors };
}

export default function CsvImport({ onImport }: CsvImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [previewErrors, setPreviewErrors] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { rows, errors } = parseCSVPreview(text);
      setPreview(rows);
      setPreviewErrors(errors);
    };
    reader.readAsText(selected);
  }, []);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/contacts/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data as ImportResult);
        onImport();
      } else {
        setResult({ imported: 0, updated: 0, errors: [data.error || "Import failed"] });
      }
    } catch (error) {
      setResult({ imported: 0, updated: 0, errors: ["Network error"] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Upload CSV (headers: name, phone, email)
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold file:text-white hover:file:bg-gold-dark"
        />
      </div>

      {previewErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-700 mb-2">Preview Issues</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {previewErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {preview.length > 0 && (
        <div>
          <p className="text-sm text-muted mb-2">
            Preview ({preview.length} valid rows)
          </p>
          <div className="bg-white rounded-lg border border-line overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-muted">Phone</th>
                  <th className="px-3 py-2 text-left font-medium text-muted">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {preview.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.phone}</td>
                    <td className="px-3 py-2">{row.email || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {file && preview.length > 0 && (
        <button
          onClick={handleImport}
          disabled={loading}
          className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Importing..." : `Import ${preview.length} Contacts`}
        </button>
      )}

      {result && (
        <div
          className={`rounded-lg p-4 ${
            result.errors.length === 0
              ? "bg-green-50 border border-green-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <h4 className="text-sm font-medium mb-2">
            {result.errors.length === 0 ? "Import Successful" : "Import Complete with Issues"}
          </h4>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Imported:</span> {result.imported}
            </p>
            <p>
              <span className="font-medium">Updated:</span> {result.updated}
            </p>
            {result.errors.length > 0 && (
              <div>
                <span className="font-medium">Errors:</span>
                <ul className="mt-1 space-y-1 text-red-600">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
