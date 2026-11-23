// One-Star Review of Something Essential — make.fun bounty entry.
//
// What this does, in one sentence: it takes the single deadpan
// one-star review stored in entry.txt, checks it against the sealed
// gate (UTF-8, one line, 1–160 characters, not blank), prints it, and
// copies it to $MAKEFUN_OUTPUT_DIR/entry.txt (default /output).
//
// Everything the program needs ships in this repository. There is no
// network access, no environment secret, and no file read outside
// this directory. The review text is data in entry.txt; this file is
// only the loader, the gate, and the writer.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The sealed gate allows at most 160 characters in /output/entry.txt.
const CHAR_LIMIT = 160;

// Where the graded copy goes when the caller does not say otherwise.
const DEFAULT_OUTPUT_DIR = "/output";

function die(reason: string): never {
  console.error(`error: ${reason}`);
  process.exit(1);
}

// Read entry.txt from beside this file. Resolving it from
// import.meta.url (never from process.cwd()) means the grader can run
// this from any working directory and still find the review.
function readReviewText(): string {
  const folder = dirname(fileURLToPath(import.meta.url));
  const bytes = readFileSync(join(folder, "entry.txt"));
  let decoded: string;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    die("entry.txt is not valid UTF-8 text");
  }
  // A trailing newline is file formatting, not part of the review.
  return decoded!.replace(/\n$/, "");
}

// Enforce every rule the sealed gate enforces, and fail loudly with
// a plain message instead of writing an entry that would score 0.
function enforceGate(review: string): void {
  const chars = [...review].length;
  if (chars < 1 || review.trim() === "") {
    die("the review must not be empty or only whitespace");
  }
  if (/[\r\n]/.test(review)) {
    die("the review must be exactly one line");
  }
  if (chars > CHAR_LIMIT) {
    die(`the review is ${chars} characters, over the ${CHAR_LIMIT} limit`);
  }
}

function writeOutput(review: string): void {
  const dir = process.env.MAKEFUN_OUTPUT_DIR || DEFAULT_OUTPUT_DIR;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "entry.txt"), `${review}\n`, "utf-8");
}

const review = readReviewText();
enforceGate(review);
writeOutput(review);
console.log(review);
