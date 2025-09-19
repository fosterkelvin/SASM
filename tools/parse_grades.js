#!/usr/bin/env node
// Simple heuristic parser to convert extracted OCR text of grades into CSV
// Usage: node parse_grades.js <input-file>
const fs = require("fs");
const path = require("path");

function readInput(filePath) {
  if (!filePath) {
    console.error("Usage: node parse_grades.js <input-file>");
    process.exit(2);
  }
  return fs.readFileSync(filePath, "utf8");
}

function normalize(s) {
  // replace problematic unicode, normalize spaces but keep line breaks
  let out = s
    .replace(/\u2019|\u2018/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\t|\u00A0/g, " ");
  // normalize multiple spaces but preserve newlines
  out = out
    .split(/\r?\n/)
    .map((line) => line.replace(/ {2,}/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  return out;
}

function parseTabLine(line) {
  // line expected to be tab-separated columns as in the 'Parsed table' block
  const parts = line.split("\t").map((p) => p.trim());
  if (parts.length < 2) return null;
  const subjPart = parts[0] || "";
  const facultyPart = parts[1] || "";
  // find status (PASSED/INCOMPLETE/INC/FAILED) from last columns
  let status = "";
  for (let j = parts.length - 1; j >= 0; j--) {
    if (/\b(PASSED|INCOMPLETE|FAILED|INC|DEFERRED)\b/i.test(parts[j])) {
      status = parts[j]
        .match(/\b(PASSED|INCOMPLETE|FAILED|INC|DEFERRED)\b/i)[1]
        .toUpperCase();
      break;
    }
  }
  // find units as the first column that looks like a decimal (e.g., 3.00)
  let units = "";
  for (let j = parts.length - 1; j >= 0; j--) {
    const m = parts[j].match(/(\d{1,2}\.\d{2})/);
    if (m) {
      units = m[1];
      break;
    }
    // also accept integer like 3 or OCR '300' -> 3.00
    const m2 = parts[j].match(/\b(\d{1,3})\b/);
    if (m2 && Number(m2[1]) <= 300) {
      const asNum = Number(m2[1]);
      if (asNum >= 100) units = (asNum / 100).toFixed(2);
      else units = asNum.toFixed(2);
      break;
    }
  }
  // extract grades from middle columns (between faculty and units)
  const middle = parts.slice(2, parts.length - 2);
  const joinedMid = middle.join(" ");
  const grades = extractGrades(joinedMid + " " + parts.join(" "));

  // subject code: first token of subjPart
  const codeMatch = subjPart.match(/^([A-Za-z0-9\-]{2,})\b/);
  const code = codeMatch ? codeMatch[1] : "";
  // subject name: remove code and stray tokens like PASSED or 'PASSED &' or 'INCOMPLETE'
  let name = subjPart
    .replace(code, "")
    .replace(/\b(PASSED|INCOMPLETE|FAILED|INC)\b/gi, "")
    .replace(/&/g, "")
    .trim();
  // section: often a short code at end like 'ct' or 'IAC1'
  let section = "";
  const secMatch = subjPart.match(/\b([A-Za-z0-9]{2,6})$/);
  if (secMatch && secMatch[1].toUpperCase() !== code.toUpperCase())
    section = secMatch[1];

  return {
    SubjectCode: code,
    Subject: (name + (section ? " " + section : "")).trim(),
    Faculty: facultyPart,
    One: grades[0] || "",
    Two: grades[1] || "",
    Final: grades[2] || "",
    Units: units || "",
    Status: status || "",
  };
}

function splitBlocks(lines) {
  // Group lines into blocks. Start a new block when a line begins with an index (e.g. "1 ")
  // or when it looks like a subject code (letters+digits). Otherwise treat as continuation.
  const blocks = [];
  let acc = [];
  const subjStart = /^(?:\d+\s+|[A-Za-z]{3,}[0-9])/;
  for (const line of lines) {
    if (!line) continue;
    if (subjStart.test(line)) {
      if (acc.length) {
        blocks.push(acc);
      }
      acc = [line];
    } else {
      acc.push(line);
    }
  }
  if (acc.length) blocks.push(acc);
  return blocks;
}

function extractFaculty(joined) {
  // More permissive: find first comma and take a nearby window as faculty name
  const commaIdx = joined.indexOf(",");
  if (commaIdx >= 0) {
    // start from a few words before the comma to include last name token
    const startWindow = Math.max(0, joined.lastIndexOf(" ", commaIdx - 15));
    // end at the next status/units/grade token
    const endMatch = joined
      .slice(commaIdx)
      .search(/\b(PASSED|INCOMPLETE|FAILED|INC|DEFERRED|\d{1,3}(?:\.\d+)?)\b/i);
    const end =
      endMatch >= 0
        ? commaIdx + endMatch
        : Math.min(joined.length, commaIdx + 60);
    return joined
      .slice(startWindow, end)
      .trim()
      .replace(/^[,\s]+|[,\s]+$/g, "");
  }
  // fallback: look for typical 'LASTNAME FIRSTNAME' uppercase sequences
  const alt = joined.match(/([A-Z]{2,}[\sA-Z\.-]{3,})/);
  return alt ? alt[1].trim() : "";
}

function extractUnits(joined) {
  const m = joined.match(/\b(\d{1,3}(?:\.\d+)?)\b/);
  if (!m) return "";
  let num = m[1];
  // handle OCR like '300' meaning '3.00'
  const asNum = Number(num.replace(/[^0-9.]/g, ""));
  if (!isNaN(asNum)) {
    if (asNum >= 100 && asNum % 1 === 0) {
      // heuristic: 300 -> 3.00
      return (asNum / 100).toFixed(2);
    }
    // normalize to 2 decimals
    return asNum % 1 === 0 ? asNum.toFixed(2) : String(asNum);
  }
  return num;
}

function extractStatus(joined) {
  const m = joined.match(/\b(PASSED|INCOMPLETE|FAILED|INC|DEFERRED)\b/i);
  return m ? m[1].toUpperCase() : "";
}

function extractGrades(joined) {
  // find occurrences of three numeric grades or INC tokens
  const matches = [];
  const re = /\b(INC|\d{1,3})\b/gi;
  let mm;
  while ((mm = re.exec(joined)) !== null) {
    matches.push(mm[1]);
  }
  // return first three numeric-like tokens that are likely grades
  const nums = matches.filter((x) => /^(?:INC|\d{1,3})$/i.test(x));
  return [nums[0] || "", nums[1] || "", nums[2] || ""];
}

function extractSubjectAndCode(joined, faculty) {
  // Remove faculty part first to avoid confusion
  let base = joined;
  if (faculty) base = base.replace(faculty, "");
  // Trim status/units/grades tail
  base = base.replace(/\b(PASSED|INCOMPLETE|FAILED|INC|DEFERRED)\b.*/i, "");
  base = base.replace(/\d+\.\d+.*/, "");

  base = base.trim();
  // If starts with an index like '1 DATSCI1 ...', drop leading index
  base = base.replace(/^\d+\s+/, "");
  // If OCR used '&' to prefix subject names on the next line, extract after &
  const amp = base.indexOf("&");
  if (amp >= 0) {
    const after = base.slice(amp + 1).trim();
    // drop trailing short tokens like 'ct' or 'ct\b'
    return { code: "", name: after.replace(/\bct\b/i, "").trim() };
  }
  // Subject code is usually first token (letters+digits)
  const codeMatch = base.match(/^([A-Za-z0-9\-]{2,})\b/);
  const code = codeMatch ? codeMatch[1] : "";
  // Subject name is the rest after the code
  const name = base.replace(code, "").trim();
  return { code: code || "", name: name || "" };
}

function parseText(text) {
  const cleaned = normalize(text);
  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // If this looks like the table/list format (lines starting with an index), use table-aware parser
  const hasIndexLines = lines.some(
    (l) => /^\d+\s+/.test(l) || /^\d+\s*$/.test(l)
  );
  if (hasIndexLines) {
    return parseTableBlocks(lines);
  }

  // If the OCR produced a 'Parsed table' block (tab-separated), parse it first
  const parsedTableIdx = lines.findIndex(
    (l) => /Parsed table/i.test(l) || /^Subject\s+Faculty\s+/i.test(l)
  );
  if (parsedTableIdx >= 0) {
    const tabLines = lines
      .slice(parsedTableIdx + 1)
      .filter((l) => l.includes("\t"));
    const parsedRows = [];
    for (const tl of tabLines) {
      const p = parseTabLine(tl);
      if (p) parsedRows.push(p);
    }
    if (parsedRows.length) return parsedRows;
  }

  // fallback to previous block-based heuristic
  const blocks = splitBlocks(lines);
  const rows = [];
  for (const b of blocks) {
    const joined = b.join(" ");
    // skip Average lines
    if (/Average\b/i.test(joined)) continue;
    const faculty = extractFaculty(joined);
    const units = extractUnits(joined);
    const status = extractStatus(joined);
    const grades = extractGrades(joined);
    const subj = extractSubjectAndCode(joined, faculty);
    rows.push({
      SubjectCode: subj.code,
      Subject: subj.name,
      Faculty: faculty,
      One: grades[0] || "",
      Two: grades[1] || "",
      Final: grades[2] || "",
      Units: units || "",
      Status: status || "",
    });
  }
  return rows;
}

function parseTableBlocks(lines) {
  const rows = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // stop at averages
    if (/^Average\b/i.test(line)) break;
    // find start of a record
    const start = line.match(/^(\d+)\s*(.*)$/);
    if (!start) {
      i++;
      continue;
    }
    // collect block lines until next index or Average
    const block = [];
    // if the start has trailing content, include it, otherwise subject code may be on next line
    if (start[2]) block.push(start[2].trim());
    i++;
    while (
      i < lines.length &&
      !/^(\d+)\s+/.test(lines[i]) &&
      !/^(\d+)\s*$/.test(lines[i]) &&
      !/^Average\b/i.test(lines[i])
    ) {
      block.push(lines[i]);
      i++;
    }

    // Now `block` should contain the subject lines then faculty+grades
    // Heuristic: subject block is the first up to 3 lines before the faculty (which contains a comma)
    let facultyIdx = block.findIndex((l) => /,/.test(l));
    if (facultyIdx === -1) {
      // try to find a line that looks like a person name (two words, capitalized)
      facultyIdx = block.findIndex((l) => /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(l));
    }
    if (facultyIdx === -1) {
      // fallback: assume last 2 lines are faculty+grades
      facultyIdx = Math.max(1, block.length - 2);
    }

    const subjLines = block.slice(0, facultyIdx);
    const facultyLine = block[facultyIdx] || "";
    const tail = block.slice(facultyIdx + 1).join(" ");

    // Subject code: first token of subjLines[0]
    const subj0 = subjLines[0] || "";
    const codeMatch = subj0.match(/^([A-Za-z0-9\-]{2,})\b/);
    const subjectCode = codeMatch ? codeMatch[1] : "";
    // Subject name: remaining subjLines (excluding code and section)
    let subjectName = "";
    if (subjLines.length >= 2) {
      subjectName = subjLines.slice(1).join(" ");
    } else if (subjLines.length === 1) {
      subjectName = subj0.replace(subjectCode, "").trim();
    }
    // Section: last subjLine if short token like 'IAC1' or similar
    let section = "";
    if (subjLines.length) {
      const potential = subjLines[subjLines.length - 1].trim();
      if (/^[A-Za-z0-9]{2,6}$/.test(potential) && potential !== subjectCode) {
        section = potential;
        // remove from subjectName if it was included
        if (subjectName.endsWith(potential)) {
          subjectName = subjectName.slice(0, -potential.length).trim();
        }
      }
    }

    const faculty = extractFaculty(facultyLine + " " + tail) || facultyLine;
    const grades = extractGrades(facultyLine + " " + tail);
    const units = extractUnits(facultyLine + " " + tail) || extractUnits(tail);
    const status =
      extractStatus(facultyLine + " " + tail) || extractStatus(tail);

    rows.push({
      SubjectCode: subjectCode,
      Subject: (subjectName + (section ? " " + section : "")).trim(),
      Faculty: faculty,
      One: grades[0] || "",
      Two: grades[1] || "",
      Final: grades[2] || "",
      Units: units || "",
      Status: status || "",
    });
  }
  return rows;
}

function toCSV(rows) {
  const hdr = [
    "SubjectCode",
    "Subject",
    "Faculty",
    "1",
    "2",
    "Final",
    "Units",
    "Status",
  ];
  const esc = (v) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    if (s.includes(",") || s.includes('"') || s.includes("\n"))
      return '"' + s + '"';
    return s;
  };
  const lines = [hdr.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.SubjectCode,
        r.Subject,
        r.Faculty,
        r.One,
        r.Two,
        r.Final,
        r.Units,
        r.Status,
      ]
        .map(esc)
        .join(",")
    );
  }
  return lines.join("\n");
}

if (require.main === module) {
  const inFile = process.argv[2];
  const txt = readInput(inFile);
  const rows = parseText(txt);
  const csv = toCSV(rows);
  console.log(csv);
}
