// Improved parser.js
import fs from "fs";
import path from "path";

// TODO: add a restart button to each card, give a different color than blue or grey
export function parseMermaid(mermaidText) {
  const nodes = {};
  const edges = [];
  const styles = {};

  const lines = mermaidText
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith("%%"));

  // --- Regex patterns ---

  // Node definition line (standalone)
  const nodeRegex = /^([A-Za-z0-9_]+)\s*[\[\(]"?([^"]+)"?[\]\)]$/;
                    

  // Edge with label and inline node definitions
  //const edgeRegex = /^([A-Za-z0-9_]+)(?:\s*[\[\(]"([^"]+)"?[\]\)])?\s*--\s*(.*?)\s*-->\s*([A-Za-z0-9_]+)(?:\s*[\[\(]"([^"]+)"?[\]\)])?$/;

  // Style directive
  const styleRegex = /^style\s+([A-Za-z0-9_]+)\s+(.+)$/;

  // --- Helper function to parse a node part ---
  function parseNodePart(part) {
    // Matches ID("Text") or ID["Text"] or just ID
    const nodeMatch = part.trim().match(/^([A-Za-z0-9_]+)(?:[\[\(]"([\s\S]*?)"[\]\)])?$/);
    if (!nodeMatch) return { id: part.trim(), text: "pattern of node not matched" }; // fallback
    const id = nodeMatch[1];
    let text = nodeMatch[2] !== undefined ? nodeMatch[2] : id;
    text = text.replace(/\\n/g, "<br>"); // preserve line breaks if user used \n
    return { id, text };
  }

  // --- Parsing pass ---

  for (const line of lines) {

    // Ignore header lines
    if (line.startsWith("graph ") || line.startsWith("flowchart ") || line.startsWith("config") || line.startsWith("layout")) {
      continue;
    }

    // Ignore comments or other syntax
    if (line.startsWith("//") || line.startsWith("---")){
      continue;
    }

    // Style directive
    let match = line.match(styleRegex);
    if (match) {
      const [, nodeId, styleText] = match;
      styles[nodeId] = parseStyleText(styleText);
      continue;
    }

    //console.log(line)
    // Standalone node definition
    match = line.match(nodeRegex);
    if (match) {
      //console.log("second if reached", match)
      const [, id, text] = match;
      nodes[id] = text || id;
      continue;
    }

    // all other definitions
    if (line.includes("-->")) {
      let label = "Next";
      let leftPart, rightPart;

      const arrowLabelMatch = line.match(/--\s*(.*?)\s*-->/);
      if (arrowLabelMatch) {
        label = arrowLabelMatch[1].trim() || "Next";
        [leftPart, rightPart] = line.split(/--\s*.*?\s*-->/);
      } else {
        [leftPart, rightPart] = line.split(/-->/);
      }

      //console.log("leftPart: ", leftPart, "rightPart: ", rightPart)

      const fromNode = parseNodePart(leftPart);
      const toNode = parseNodePart(rightPart);

      //console.log("fromNode: ", fromNode, "toNode: ", toNode)

      // Ensure implicit nodes are correctly added with their ID as text
      if (!(fromNode.id in nodes)) nodes[fromNode.id] = fromNode.text; // Implicit node
      if (!(toNode.id in nodes)) nodes[toNode.id] = toNode.text; // || toNode.id; // Ensure explicit node is handled too

      //console.log(nodes)

      // Save edge
      edges.push({ from: fromNode.id, to: toNode.id, label });

      continue;
    }

  }

  // --- Determine start node ---
  let start = null;

  if ("START" in nodes) {
    const startEdge = edges.find(e => e.from === "START");
    if (startEdge) {
      start = startEdge.to;
    }
  }

  // Fallback: first node encountered
  if (!start) {
    start = Object.keys(nodes)[0] || null;
  }

  return {
    nodes,
    edges,
    styles,
    start
  };
}

/**
 * Parse Mermaid style text into a key/value object.
 */
function parseStyleText(styleText) {
  const result = {};
  styleText.split(",").forEach(part => {
    const [key, value] = part.split(":").map(s => s.trim());
    if (key && value) result[key] = value;
  });
  return result;
}

// --- Write graph.js for offline use ---
export function writeGraphJS(graph, outputPath) {
  const jsContent = `const graphData = ${JSON.stringify(graph, null, 2)};`;
  fs.writeFileSync(path.resolve(outputPath), jsContent, "utf-8");
  console.log(`graph.js written to ${outputPath}`);
}