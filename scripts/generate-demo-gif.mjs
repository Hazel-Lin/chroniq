import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "assets");
const outputPath = path.join(outputDir, "chroniq-demo.gif");

const width = 1200;
const height = 720;
const fps = 12;

const fontCandidates = [
  "/System/Library/Fonts/SFNSMono.ttf",
  "/System/Library/Fonts/Supplemental/Menlo.ttc",
  "/System/Library/Fonts/Supplemental/Courier New.ttf",
  "/System/Library/Fonts/Monaco.ttf",
];

function pickFont() {
  const match = fontCandidates.find((candidate) => fs.existsSync(candidate));
  if (!match) {
    throw new Error(`No supported monospace font found. Checked: ${fontCandidates.join(", ")}`);
  }
  return match;
}

function escapeFilterValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/,/g, "\\,").replace(/'/g, "\\'");
}

const fontFile = pickFont();

const states = [
  {
    name: "install",
    duration: 1.8,
    text: [
      "hazel@macbook ~ % npm install -g @hazellin/chroniq",
      "",
      "added 1 package in 2s",
      "",
      "hazel@macbook ~ % chroniq --help",
      "Usage: chroniq [options] [command] [content...]",
    ].join("\n"),
  },
  {
    name: "capture",
    duration: 2.0,
    text: [
      "hazel@macbook ~ % cq add \"Ship Chroniq to npm today #launch\"",
      "",
      "capture lightweight notes in append-only JSONL",
      "keep output stable for scripts and agents",
    ].join("\n"),
  },
  {
    name: "export",
    duration: 2.3,
    text: [
      "hazel@macbook ~ % cq today --json",
      "",
      "[",
      "  {",
      "    \"content\": \"Ship Chroniq to npm today\",",
      "    \"tags\": [\"launch\"],",
      "    \"source\": \"cli\",",
      "    \"type\": \"note\"",
      "  }",
      "]",
    ].join("\n"),
  },
];

fs.mkdirSync(outputDir, { recursive: true });
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "chroniq-demo-"));

try {
  const concatLines = [];

  for (const [index, state] of states.entries()) {
    const frameNumber = String(index + 1).padStart(2, "0");
    const textPath = path.join(tmpDir, `${frameNumber}-${state.name}.txt`);
    const framePath = path.join(tmpDir, `${frameNumber}-${state.name}.png`);

    fs.writeFileSync(textPath, state.text, "utf8");

    const filters = [
      `drawbox=x=36:y=36:w=${width - 72}:h=${height - 72}:color=0x111827:t=fill`,
      `drawbox=x=36:y=36:w=${width - 72}:h=46:color=0x1f2937:t=fill`,
      `drawtext=fontfile='${escapeFilterValue(fontFile)}':text='Chroniq terminal demo':fontcolor=0xf9fafb:fontsize=24:x=64:y=48`,
      `drawtext=fontfile='${escapeFilterValue(fontFile)}':text='install -> capture -> export':fontcolor=0x93c5fd:fontsize=18:x=890:y=50`,
      `drawtext=fontfile='${escapeFilterValue(fontFile)}':textfile='${escapeFilterValue(textPath)}':expansion=none:fontcolor=0xe5e7eb:fontsize=28:line_spacing=14:x=72:y=120`,
      `drawtext=fontfile='${escapeFilterValue(fontFile)}':text='npm i -g @hazellin/chroniq':fontcolor=0x86efac:fontsize=20:x=72:y=658`,
    ];

    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-loglevel",
        "error",
        "-f",
        "lavfi",
        "-i",
        `color=c=0b1020:s=${width}x${height}:d=1`,
        "-frames:v",
        "1",
        "-update",
        "1",
        "-vf",
        filters.join(","),
        framePath,
      ],
      { stdio: "inherit" },
    );

    concatLines.push(`file '${framePath}'`);
    concatLines.push(`duration ${state.duration}`);
  }

  const lastFrame = path.join(tmpDir, `${String(states.length).padStart(2, "0")}-${states.at(-1)?.name}.png`);
  concatLines.push(`file '${lastFrame}'`);

  const concatPath = path.join(tmpDir, "frames.txt");
  fs.writeFileSync(concatPath, `${concatLines.join("\n")}\n`, "utf8");

  execFileSync(
    "ffmpeg",
      [
        "-y",
        "-loglevel",
        "error",
        "-f",
        "concat",
        "-safe",
      "0",
      "-i",
      concatPath,
      "-vf",
      `fps=${fps},scale=1000:-1:flags=lanczos,split[s0][s1];[s0]palettegen=reserve_transparent=0[p];[s1][p]paletteuse`,
      outputPath,
    ],
    { stdio: "inherit" },
  );

  console.log(`Generated ${outputPath}`);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
