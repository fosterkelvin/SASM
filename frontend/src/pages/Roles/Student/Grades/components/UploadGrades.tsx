import React, { useRef, useState, useEffect } from "react";
import ImagePreview from "./ImagePreview";
import InstructionsCard from "./InstructionsCard";
import { createWorker } from "tesseract.js";

type ParsedRow = {
  subject: string;
  faculty: string;
  one: string;
  two: string;
  final: string;
  units: string;
  status: string;
  raw: string;
};

const UploadGrades: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const workerRef = useRef<any | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    meta: any;
    rows: ParsedRow[];
    averages?: any;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch {}
        workerRef.current = null;
      }
    };
  }, []);

  const onSelectFile = (f?: File) => {
    setError(null);
    setParsedResult(null);
    setOcrText(null);
    if (!f) return setFile(null);
    if (!f.type.startsWith("image/")) {
      setError("Only image files are allowed (png, jpg, jpeg).");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB allowed.");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      onSelectFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onSelectFile(f);
  };

  const clear = () => {
    setFile(null);
    setError(null);
    setOcrText(null);
    setParsedResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const runOcr = async (f: File) => {
    setError(null);
    setParsedResult(null);
    setOcrText(null);
    setOcrProgress(0);
    setIsOcrRunning(true);

    const worker = await createWorker({
      logger: (m: any) => {
        if (m.status === "recognizing text" && typeof m.progress === "number") {
          setOcrProgress(Math.round(m.progress * 100));
        }
      },
    });
    workerRef.current = worker;

    try {
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const url = URL.createObjectURL(f);
      const { data } = await worker.recognize(url);
      setOcrText(data.text);
    } catch (err: any) {
      setError("OCR failed: " + (err?.message || String(err)));
    } finally {
      setIsOcrRunning(false);
      setOcrProgress(100);
      try {
        await worker.terminate();
      } catch {}
      workerRef.current = null;
    }
  };

  // Normalize and fix common OCR artifacts
  const normalizeOcrText = (raw: string) => {
    let t = raw;

    // Fix headers
    t = t.replace(/suasEct/gi, "Subject");
    t = t.replace(/FANAL/gi, "Final");
    t = t.replace(/unis/gi, "Units");
    t = t.replace(/staTUs/gi, "Status");

    // Fix common OCR misreads for subject codes
    t = t.replace(/\boatscit\b/gi, "DATSCI11");
    t = t.replace(/\bPrLANGT\b/gi, "PPLANG1");
    t = t.replace(/\baassurt\b/gi, "QASSUR1");
    t = t.replace(/\bTHESCS1\b/gi, "THESC1");

    // Status corrections
    t = t.replace(/\bPasseD\b/gi, "PASSED");
    t = t.replace(/\bINCOMPLETE\b/gi, "INCOMPLETE");

    // Replace weird symbols with spaces
    t = t.replace(/[=“”‘’"«»]/g, " ");

    // Collapse multiple spaces, keep line breaks
    t = t
      .split(/\r?\n/)
      .map((l) => l.replace(/\s{2,}/g, " ").trim())
      .filter(Boolean)
      .join("\n");

    return t.trim();
  };

  const parseGradesFromText = (raw: string) => {
    const cleaned = normalizeOcrText(raw);
    const lines = cleaned
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const meta: any = {};
    for (const line of lines.slice(0, 10)) {
      const mLevel = line.match(/Level[:\s-]+(.+)/i);
      if (mLevel && !meta.level) meta.level = mLevel[1].trim();
      const mDate = line.match(/Date\s*Enrolled[:\s]+(.+)/i);
      if (mDate && !meta.date) meta.date = mDate[1].trim();
      const mBy =
        line.match(/Enrolled By[:\s]+(.+)/i) ||
        line.match(/Enrolled By\s*(.+)/i);
      if (mBy && !meta.enrolledBy) meta.enrolledBy = mBy[1].trim();
      const mAvg = line.match(/(General Weighted Avg|Average)[:\s]*([\d\s]+)/i);
      if (mAvg && !meta.generalAvg) {
        // Fix 7575 → 75.75 etc.
        const fixed = mAvg[2].replace(/(\d{2})(\d{2})/g, "$1.$2");
        meta.generalAvg = fixed.trim();
      }
      if (/BSCS|BS|Program/i.test(line) && !meta.program) meta.program = line;
    }

    // collect blocks that begin with a numeric index
    const blocks: string[][] = [];
    let current: string[] | null = null;
    for (const line of lines) {
      if (/^\d+\b/.test(line)) {
        if (current) blocks.push(current);
        current = [line.replace(/^\d+\s*/, "").trim()];
      } else if (current) {
        current.push(line);
      }
    }
    if (current) blocks.push(current);

    const rows: ParsedRow[] = blocks.map((block) => {
      const text = block.join(" ");

      // Faculty
      const facultyMatch = text.match(
        /[A-Z][A-Za-z\-\.]+\s*,\s*[A-Z][A-Za-z\-\.\s]+/
      );
      const faculty = facultyMatch
        ? facultyMatch[0].trim().toUpperCase()
        : "(unknown)";

      // Subject code (fix OCR variants)
      let code = "";
      if (/oatscit/i.test(text)) code = "DATSCI1";
      else if (/PrLANGT/i.test(text)) code = "PPLANG1";
      else if (/aassurt/i.test(text)) code = "QASSUR1";
      else if (/THESCS1/i.test(text)) code = "THESC1";
      else {
        const codeMatch = text.match(/\b[A-Z]{3,}[0-9]{1,2}\b/);
        if (codeMatch) code = codeMatch[0];
      }

      // Subject title
      let title = text;
      if (code) title = title.replace(code, "");
      if (facultyMatch) title = title.replace(facultyMatch[0], "");
      title = title.replace(/\d{1,3}(?:\.\d+)?/g, "").trim();

      // Grades
      const nums = (text.match(/\b\d{2,3}\b/g) || []).filter(
        (n) => parseInt(n) >= 50 && parseInt(n) <= 100
      );
      let one = "",
        two = "",
        final = "";
      if (nums.length >= 3) {
        one = nums[0];
        two = nums[1];
        final = nums[2];
      } else if (nums.length === 2) {
        one = nums[0];
        two = nums[1];
      } else if (nums.length === 1) {
        final = nums[0];
      }

      // Units
      const unitMatch = text.match(/\b\d\.\d{2}\b/);
      const units = unitMatch ? unitMatch[0] : "3.00";

      // Status
      const statusMatch = text.match(
        /\b(PASSED|FAILED|INCOMPLETE|INC|RETAKE)\b/i
      );
      const status = statusMatch ? statusMatch[0].toUpperCase() : "";

      return {
        subject: `${code} ${title}`.trim(),
        faculty,
        one,
        two,
        final,
        units,
        status,
        raw: text,
      };
    });

    // Averages line
    const avgLine = lines.find((l) => /Average\s*[:\-]?/i.test(l));
    const averages: any = {};
    if (avgLine) {
      const nums = avgLine.match(/\d{2,4}/g) || [];
      const fixedNums = nums.map((n) =>
        n.length === 4 ? n.slice(0, 2) + "." + n.slice(2) : n
      );
      if (fixedNums.length >= 1)
        averages.final = fixedNums[fixedNums.length - 1];
      if (fixedNums.length >= 2) averages.two = fixedNums[fixedNums.length - 2];
      if (fixedNums.length >= 3) averages.one = fixedNums[fixedNums.length - 3];
    }

    return { meta, rows, averages };
  };

  const improveScan = () => {
    if (!ocrText) return;
    try {
      const parsed = parseGradesFromText(ocrText);
      setParsedResult(parsed);
    } catch (err: any) {
      setError("Parse failed: " + (err?.message || String(err)));
    }
  };

  const exportCsv = async () => {
    const data = parsedResult?.rows || [];
    if (data.length === 0) return setError("No parsed data to export");
    const header = ["Subject", "Faculty", "1", "2", "Final", "Units", "Status"];
    const rows = data.map((r) => [
      r.subject,
      r.faculty,
      r.one,
      r.two,
      r.final,
      r.units,
      r.status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    try {
      await navigator.clipboard.writeText(csv);
      setError("CSV copied to clipboard");
    } catch {
      // fallback download
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "grades.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center h-64"
        >
          {!file ? (
            <div className="text-center">
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Drag & drop a screenshot here, or
              </p>
              <div className="flex items-center gap-2 justify-center">
                <label
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded shadow"
                  aria-label="Upload screenshot"
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  Upload Image
                </label>
                <button
                  onClick={() => onSelectFile(undefined)}
                  className="px-3 py-2 border rounded text-sm"
                  hidden
                >
                  Clear
                </button>
              </div>
              {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col md:flex-row gap-4 items-center">
              <ImagePreview file={file} />
              <div className="flex flex-col gap-3">
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  <p className="font-semibold">Selected file</p>
                  <p className="text-xs">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clear}
                    className="px-3 py-2 border rounded text-sm"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() =>
                      window.open(URL.createObjectURL(file), "_blank")
                    }
                    className="px-3 py-2 bg-red-600 text-white rounded text-sm"
                  >
                    Preview in new tab
                  </button>
                </div>
                <div className="mt-3">
                  {!isOcrRunning ? (
                    <button
                      onClick={() => file && runOcr(file)}
                      className="px-3 py-2 bg-green-600 text-white rounded text-sm mr-2"
                    >
                      Scan & Parse Grades
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (workerRef.current) {
                          workerRef.current.terminate();
                          workerRef.current = null;
                        }
                        setIsOcrRunning(false);
                      }}
                      className="px-3 py-2 bg-yellow-600 text-white rounded text-sm mr-2"
                    >
                      Cancel OCR
                    </button>
                  )}
                  {ocrProgress > 0 && (
                    <div className="text-xs text-gray-600 mt-2">
                      Progress: {ocrProgress}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <InstructionsCard />
      </div>

      {ocrText && (
        <div className="mt-6 md:mt-0 md:col-span-3">
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold mb-2">Extracted text</h4>
              <div className="flex gap-2">
                <button
                  onClick={improveScan}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Improve scan
                </button>
                <button
                  onClick={exportCsv}
                  className="px-3 py-1 bg-gray-800 text-white rounded text-sm"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <pre className="text-xs whitespace-pre-wrap max-h-48 overflow-auto bg-gray-50 dark:bg-gray-800 p-2 rounded">
              {ocrText}
            </pre>

            <h4 className="font-semibold mt-4 mb-2">
              Parsed table (best-effort)
            </h4>
            {parsedResult ? (
              <div>
                <div className="text-xs text-gray-600 mb-2">
                  <strong>Meta:</strong>{" "}
                  {parsedResult.meta && JSON.stringify(parsedResult.meta)}
                </div>
                <ParsedResultTable data={parsedResult.rows} />
                {parsedResult.averages && (
                  <div className="mt-2 text-xs text-gray-600">
                    Averages: {JSON.stringify(parsedResult.averages)}
                  </div>
                )}
              </div>
            ) : (
              <ParsedTableFromText text={ocrText} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadGrades;

// Fallback: naive rendering of OCR text as table-like rows
const ParsedTableFromText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0)
    return <div className="text-sm text-gray-600">No parsed rows</div>;
  const columns = lines[0].split(/\s{2,}|\t|\|/).map((c) => c.trim());
  const rows = lines.map((line) =>
    line.split(/\s{2,}|\t|\|/).map((c) => c.trim())
  );
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="border px-2 py-1 text-left bg-gray-100 dark:bg-gray-800"
              >
                {col || `Col ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="even:bg-gray-50 dark:even:bg-gray-900">
              {columns.map((_, ci) => (
                <td key={ci} className="border px-2 py-1">
                  {r[ci] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ParsedResultTable: React.FC<{ data: ParsedRow[] }> = ({ data }) => {
  if (!data || data.length === 0)
    return <div className="text-sm text-gray-600">No parsed rows</div>;
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1 text-left bg-gray-100">Subject</th>
            <th className="border px-2 py-1 text-left bg-gray-100">Faculty</th>
            <th className="border px-2 py-1 text-left bg-gray-100">1</th>
            <th className="border px-2 py-1 text-left bg-gray-100">2</th>
            <th className="border px-2 py-1 text-left bg-gray-100">Final</th>
            <th className="border px-2 py-1 text-left bg-gray-100">Units</th>
            <th className="border px-2 py-1 text-left bg-gray-100">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-900">
              <td className="border px-2 py-1">{r.subject}</td>
              <td className="border px-2 py-1">{r.faculty}</td>
              <td className="border px-2 py-1">{r.one}</td>
              <td className="border px-2 py-1">{r.two}</td>
              <td className="border px-2 py-1">{r.final}</td>
              <td className="border px-2 py-1">{r.units}</td>
              <td className="border px-2 py-1">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
