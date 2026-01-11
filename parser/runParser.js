import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseMermaid, writeGraphJS } from "./parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Mermaid file
const mermaidPath = path.resolve("./input/general/graph.mmd")
const mermaidText = fs.readFileSync(mermaidPath, "utf-8");

// Parse
const graph = parseMermaid(mermaidText);

//console.log(graph)

// Write graph.js
writeGraphJS(graph, "./input/general/graph.js");