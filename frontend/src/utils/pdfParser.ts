import * as pdfjsLib from "pdfjs-dist";

// Set worker path with fallback
try {
  // Try to use the ES module version from node_modules (Vite will handle this)
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
} catch (e) {
  // Fallback to CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface ScheduleClass {
  section: string;
  subjectCode: string;
  subjectName: string;
  instructor: string;
  schedule: string;
  units: number;
}

export async function parseSchedulePDF(file: File): Promise<ScheduleClass[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let allItems: any[] = [];

    // Extract text items with positioning from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Collect all text items with their positions
      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          allItems.push({
            text: item.str.trim(),
            x: item.transform[4],
            y: item.transform[5],
          });
        }
      });
    }

    // Sort items by Y position (top to bottom), then X position (left to right)
    allItems.sort((a, b) => {
      const yDiff = b.y - a.y; // Reverse Y because PDF coordinates start at bottom
      if (Math.abs(yDiff) > 5) return yDiff; // Different lines
      return a.x - b.x; // Same line, sort by X
    });

    // Group items by rows (items with similar Y coordinates)
    const rows: string[] = [];
    let currentRow: any[] = [];
    let currentY = allItems[0]?.y;

    allItems.forEach((item) => {
      if (Math.abs(item.y - currentY) > 5) {
        // New row
        if (currentRow.length > 0) {
          rows.push(currentRow.map((i) => i.text).join(" "));
        }
        currentRow = [item];
        currentY = item.y;
      } else {
        currentRow.push(item);
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow.map((i) => i.text).join(" "));
    }

    // Parse the schedule data from rows
    const scheduleClasses = parseScheduleRows(rows);

    if (scheduleClasses.length === 0) {
      console.warn("No classes were parsed. Raw rows:", rows);
      // Try a more aggressive parsing approach
      return parseAggressively(rows);
    }

    return scheduleClasses;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(
      "Failed to parse PDF. The file might be corrupted or in an unsupported format."
    );
  }
}

/**
 * Aggressive parsing as last resort - extracts any recognizable patterns
 */
function parseAggressively(rows: string[]): ScheduleClass[] {
  const classes: ScheduleClass[] = [];

  console.log("🔥 AGGRESSIVE PARSING ACTIVATED");

  // Look for rows that contain schedule patterns
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Skip header rows
    if (
      row.includes("SECTION") ||
      row.includes("SUBJECT CODE") ||
      row.includes("ACADEMIC") ||
      row.includes("SCHEDULE(S)") ||
      row.includes("UNIT(S)") ||
      row.length < 5
    ) {
      continue;
    }

    // Pattern 1: Single-line format (original)
    // Example: 1. IAD1 [THESCS2] CS THESIS WRITING 2 T/Th 8:00 AM-9:30 AM | F215 3.00
    const singleLinePattern =
      /(\d+\.\s+)?([A-Z0-9]+)\s*\[([A-Z0-9]+)\]\s+(.*?)\s+((?:[MTWFS]|Th|Su)(?:\/(?:[MTWFS]|Th|Su))*)\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)(?:\s*[|\/]\s*([A-Z0-9]+))?\s*(\d+\.?\d*)?/i;

    const singleMatch = row.match(singleLinePattern);
    if (singleMatch) {
      const schedules = [
        `${singleMatch[5]} ${singleMatch[6]}-${singleMatch[7]}${
          singleMatch[8] ? " / " + singleMatch[8] : ""
        }`,
      ];

      // Check next rows for additional schedules (same subject, different times)
      let j = i + 1;
      while (j < rows.length) {
        const nextRow = rows[j];

        // Check if it starts with a number (new class)
        if (nextRow.match(/^\d+\.\s+/)) {
          break;
        }

        // Check if this is an instructor line WITH a schedule on the same line
        const instructorWithSchedulePattern =
          /(MS|MR|MRS|DR|PROF)\.?\s+[A-Z\s,\.\-]+?\s+((?:[MTWFS]|Th|Su)(?:\/(?:[MTWFS]|Th|Su))*)\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)(?:\s*[|\/]\s*([A-Z0-9]+))?/i;
        const instructorScheduleMatch = nextRow.match(
          instructorWithSchedulePattern
        );

        if (instructorScheduleMatch) {
          const additionalSched = `${instructorScheduleMatch[2]} ${
            instructorScheduleMatch[3]
          }-${instructorScheduleMatch[4]}${
            instructorScheduleMatch[5] ? " / " + instructorScheduleMatch[5] : ""
          }`;
          schedules.push(additionalSched);
          j++;
          continue;
        }

        // Skip pure instructor lines (no schedule)
        if (nextRow.match(/^(MS|MR|MRS|DR|PROF)\.?\s+[A-Z\s,\.\-]+$/i)) {
          j++;
          continue;
        }

        // Pattern for standalone additional schedule lines
        const additionalSchedulePattern =
          /^\s*((?:[MTWFS]|Th|Su)(?:\/(?:[MTWFS]|Th|Su))*)\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)(?:\s*[|\/]\s*([A-Z0-9]+))?/i;
        const additionalMatch = nextRow.match(additionalSchedulePattern);

        if (additionalMatch) {
          const additionalSched = `${additionalMatch[1]} ${
            additionalMatch[2]
          }-${additionalMatch[3]}${
            additionalMatch[4] ? " / " + additionalMatch[4] : ""
          }`;
          schedules.push(additionalSched);
          j++;
        } else {
          break;
        }
      }

      const result = {
        section: singleMatch[2],
        subjectCode: singleMatch[3],
        subjectName: singleMatch[4].trim(),
        instructor: "TBA",
        schedule: schedules.join(", "),
        units: singleMatch[9] ? parseFloat(singleMatch[9]) : 3.0,
      };
      classes.push(result);
      i = j - 1; // Skip processed rows
      continue;
    }

    // Pattern 2: Multi-line format (new format)
    // Line 1: # SECTION (e.g., "1. IAC")
    // Line 2: [CODE] NAME (e.g., "[AUTHPL1] AUTOMATA THEORY...")
    // Line 3: INSTRUCTOR
    // Line 4: SCHEDULE (e.g., "M/W/F 11:00 AM-12:00 PM / F217")
    const sectionPattern = /^(\d+)\.\s+([A-Z0-9]+)$/;
    const sectionMatch = row.match(sectionPattern);

    if (sectionMatch && i + 3 < rows.length) {
      const section = sectionMatch[2];
      const nextRow = rows[i + 1];
      const scheduleRow = rows[i + 3]; // Schedule is 3 rows down

      // Extract subject code and name from next row
      const codeNamePattern = /\[([A-Z0-9]+)\]\s+(.+)/;
      const codeNameMatch = nextRow.match(codeNamePattern);

      // Extract schedule (days, time, room)
      const schedulePattern =
        /((?:[MTWFS]|Th|Su)(?:\/(?:[MTWFS]|Th|Su))*)\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)(?:\s*[|\/]\s*([A-Z0-9]+))?/;
      const scheduleMatch = scheduleRow.match(schedulePattern);

      if (codeNameMatch && scheduleMatch) {
        const result = {
          section: section,
          subjectCode: codeNameMatch[1],
          subjectName: codeNameMatch[2].trim(),
          instructor: "TBA",
          schedule: `${scheduleMatch[1]} ${scheduleMatch[2]}-${
            scheduleMatch[3]
          }${scheduleMatch[4] ? " / " + scheduleMatch[4] : ""}`,
          units: 3.0, // Default units
        };
        classes.push(result);
        i += 3; // Skip the next 3 rows since we processed them
      }
    }
  }

  return classes;
}

function parseScheduleRows(rows: string[]): ScheduleClass[] {
  const classes: ScheduleClass[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].trim();

    // Skip headers and empty rows
    if (
      !row ||
      row.includes("UNIVERSITY") ||
      row.includes("ACADEMIC") ||
      row.includes("STUDENT ENROLLED") ||
      row.includes("Student ID") ||
      row.includes("SECTION") ||
      row.includes("SUBJECT CODE") ||
      row.includes("SCHEDULE")
    ) {
      continue;
    }

    // Try multiple parsing strategies
    let parsed = tryParseCompactFormat(row);
    if (!parsed) {
      parsed = tryParseSpacedFormat(row);
    }
    if (!parsed && i + 1 < rows.length) {
      // Try combining with next row
      parsed = tryParseMultiLineFormat(row, rows[i + 1]);
      if (parsed) i++; // Skip next row since we used it
    }

    if (parsed) {
      // Check next rows for additional schedules (same subject, different times)
      let j = i + 1;
      const schedules = [parsed.schedule];

      while (j < rows.length) {
        const nextRow = rows[j].trim();

        // Check if it starts with a number (new class)
        if (nextRow.match(/^\d+\.\s+/)) {
          break;
        }

        // Check if this is an instructor line WITH a schedule on the same line
        const instructorWithSchedulePattern =
          /(MS|MR|MRS|DR|PROF)\.?\s+[A-Z\s,\.\-]+?\s+((?:[MTWFS]|Th|Su)(?:\/(?:[MTWFS]|Th|Su))*)\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)(?:\s*[|\/]\s*([A-Z0-9]+))?/i;
        const instructorScheduleMatch = nextRow.match(
          instructorWithSchedulePattern
        );

        if (instructorScheduleMatch) {
          const additionalSched = `${instructorScheduleMatch[2]} ${
            instructorScheduleMatch[3]
          }-${instructorScheduleMatch[4]}${
            instructorScheduleMatch[5] ? " / " + instructorScheduleMatch[5] : ""
          }`;
          schedules.push(additionalSched);
          j++;
          continue;
        }

        // Skip pure instructor lines (no schedule)
        if (nextRow.match(/^(MS|MR|MRS|DR|PROF)\.?\s+[A-Z\s,\.\-]+$/i)) {
          j++;
          continue;
        }

        // Pattern for standalone additional schedule lines
        const additionalSchedulePattern =
          /^\s*((?:[MTWFS]|Th|Su)(?:\/(?:[MTWFS]|Th|Su))*)\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)(?:\s*[|\/]\s*([A-Z0-9]+))?/i;
        const additionalMatch = nextRow.match(additionalSchedulePattern);

        if (additionalMatch) {
          const additionalSched = `${additionalMatch[1]} ${
            additionalMatch[2]
          }-${additionalMatch[3]}${
            additionalMatch[4] ? " / " + additionalMatch[4] : ""
          }`;
          schedules.push(additionalSched);
          j++;
        } else {
          break;
        }
      }

      // Combine all schedules found
      parsed.schedule = schedules.join(", ");

      // Skip the rows we already processed
      i = j - 1;

      classes.push(parsed);
    }
  }

  return classes;
}

// Strategy 1: Compact format - everything in one line
function tryParseCompactFormat(row: string): ScheduleClass | null {
  // Pattern for University of Baguio format:
  // # SECTION [CODE] NAME INSTRUCTOR DAY TIME / ROOM UNITS
  // Example: 1 IAD1 [THESC5] CS THESIS WRITING 2 MS ALMAZAN, CHERRIE LAGPEY T/Th 8:00 AM-9:30 AM / F215 3.00
  // Or: 1. IAD1 [THESCS2] CS THESIS WRITING 2 T/Th 8:00 AM-9:30 AM | F215 3.00

  // Updated pattern to properly capture day combinations like T/Th, M/W/F, etc.
  // Also handles both | and / for room separator
  const pattern =
    /(\d+\.?\s+)?([A-Z0-9]+)\s*\[([A-Z0-9]+)\]\s+(.*?)\s+((?:MS|MR|MRS|DR|PROF)\.?\s+[A-Z\s,]+?)\s+((?:[MTWFS]|Th|Su)(?:\/(?:[MTWFS]|Th|Su))*)\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)(?:\s*[|\/]\s*([A-Z0-9]+))?\s*(\d+\.?\d*)?/i;

  const match = row.match(pattern);
  if (match) {
    return {
      section: match[2],
      subjectCode: match[3],
      subjectName: match[4].trim(),
      instructor: match[5].trim(),
      schedule: `${match[6]} ${match[7]}-${match[8]}${
        match[9] ? " / " + match[9] : ""
      }`,
      units: match[10] ? parseFloat(match[10]) : 3.0,
    };
  }

  return null;
}

// Strategy 2: Spaced format - fields separated by multiple spaces
function tryParseSpacedFormat(row: string): ScheduleClass | null {
  // Look for subject code in brackets
  const codeMatch = row.match(/\[([A-Z0-9]+)\]/);
  if (!codeMatch) return null;

  const subjectCode = codeMatch[1];

  // Look for schedule pattern - updated to properly capture day combinations
  const scheduleMatch = row.match(
    /((?:[MTWFS]|Th|Su)(?:\/(?:[MTWFS]|Th|Su))*)\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)(?:\s*\/\s*([A-Z0-9]+))?/i
  );
  if (!scheduleMatch) return null;

  const schedule = `${scheduleMatch[1]} ${scheduleMatch[2]}-${
    scheduleMatch[3]
  }${scheduleMatch[4] ? " / " + scheduleMatch[4] : ""}`;

  // Look for units at the end
  const unitsMatch = row.match(/(\d+\.?\d*)\s*$/);
  const units = unitsMatch ? parseFloat(unitsMatch[1]) : 3.0;

  // Extract section (usually at the beginning)
  const sectionMatch = row.match(/^(\d+\s+)?([A-Z0-9]+)\s+\[/);
  const section = sectionMatch ? sectionMatch[2] : "N/A";

  // Extract instructor
  const instructorMatch = row.match(
    /((?:MS|MR|MRS|DR|PROF)\.?\s+[A-Z\s,]+?)(?=\s+(?:[MTWFS]|Th|Su))/i
  );
  const instructor = instructorMatch ? instructorMatch[1].trim() : "TBA";

  // Extract subject name (between code and instructor)
  const beforeInstructor = row.substring(
    0,
    instructorMatch ? row.indexOf(instructorMatch[0]) : row.length
  );
  const afterCode = beforeInstructor.substring(
    beforeInstructor.indexOf("]") + 1
  );
  const subjectName = afterCode.trim() || subjectCode;

  return {
    section,
    subjectCode,
    subjectName,
    instructor,
    schedule,
    units,
  };
}

// Strategy 3: Multi-line format
function tryParseMultiLineFormat(
  row1: string,
  row2: string
): ScheduleClass | null {
  const combined = `${row1} ${row2}`;
  return tryParseCompactFormat(combined) || tryParseSpacedFormat(combined);
}
