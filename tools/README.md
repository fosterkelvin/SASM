# Grades OCR -> CSV parser

Small Node.js CLI that heuristically parses OCR/extracted text from a grades screenshot and exports CSV.

Usage:

- Run the parser on a plain text file containing the OCR output:

  node parse_grades.js sample_input.txt > out.csv

- The script prints CSV to stdout.

Notes:

- This is a best-effort heuristic parser for messy OCR data. It tries to extract subject code, subject name, faculty, three grade columns, units and status.
- If the OCR structure differs, adjust the regexes in `parse_grades.js`.
