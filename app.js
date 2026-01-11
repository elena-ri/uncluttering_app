// app.js
// Main application logic

//TODO:
// - add a restart with instructions button, like if you open the app the start node will be a set of instructions, then the first question, 
// if you restart then, you will be taken to the first question with the option to go back to instructions

// ----- Configuration -----
const START_NODE = "START";           // Name of the starting node
const USE_MERMAID_STYLES = false;     // Set true to apply parsed Mermaid styles

// DOM elements
const nodeTextDiv = document.getElementById("node-text");
const edgeButtonsDiv = document.getElementById("edge-buttons");
const endMessageDiv = document.getElementById("end-message");

// Navigation stack for Back button
let navStack = [];

// ----- Utility Functions -----

/**
 * Clear all buttons from the edgeButtonsDiv
 */
function clearButtons() {
  edgeButtonsDiv.innerHTML = "";
}

/**
 * Apply Mermaid style to a node if available and USE_MERMAID_STYLES is true
 * @param {string} nodeId 
 */
function applyNodeStyle(nodeId) {
  if (!USE_MERMAID_STYLES || !graphData.styles || !graphData.styles[nodeId]) {
    nodeTextDiv.style.backgroundColor = "#ffffff"; // default
    nodeTextDiv.style.color = "#000000";
    return;
  }
  const style = graphData.styles[nodeId]; // e.g., {fill:"#FFD600", color:"#000"}
  if (style.fill) nodeTextDiv.style.backgroundColor = style.fill;
  if (style.color) nodeTextDiv.style.color = style.color;
}

/**
 * Render a node: text + outgoing edge buttons
 * @param {string} nodeId 
 */
function renderNode(nodeId) {
  clearButtons();
  endMessageDiv.style.display = "none";

  const nodeText = graphData.nodes[nodeId];
  if (!nodeText) {
    nodeTextDiv.textContent = `[Missing text for node ${nodeId}]`;
  } else {
    nodeTextDiv.innerHTML = nodeText;
  }



  // Apply optional Mermaid styles
  applyNodeStyle(nodeId);

  const edges = graphData.edges.filter(e => e.from === nodeId);

  console.log(edges) 

  if (edges.length === 0) {
    // Node with no outgoing edges → show Back and Restart buttons
    createBackButton();
    createRestartButton();
    endMessageDiv.style.display = "block";
    endMessageDiv.textContent = "End of path.";
  } else {
    // Node with outgoing edges → create buttons for each
    edges.forEach(edge => {
      const btn = document.createElement("button");
      btn.className = "edge-button";
      btn.textContent = edge.label || "Next";  // default label if missing
      btn.addEventListener("click", () => {
        navStack.push(nodeId); // push current node to stack
        renderNode(edge.to);
      });
      edgeButtonsDiv.appendChild(btn);
    });

    // Always include Back and Restart button if not at START
    if (nodeId !== START_NODE) {
      createBackButton();
      createRestartButton();
    }
  }
}

/**
 * Create Back button
 */
function createBackButton() {
  if (navStack.length === 0) return;
  const btn = document.createElement("button");
  btn.className = "back-button";
  btn.textContent = "Back";
  btn.addEventListener("click", () => {
    const prevNode = navStack.pop();
    renderNode(prevNode);
  });
  edgeButtonsDiv.appendChild(btn);
}

/**
 * Create Restart button
 */
function createRestartButton() {
  const btn = document.createElement("button");
  btn.className = "restart-button";
  btn.textContent = "Restart";
  btn.addEventListener("click", () => {
    navStack = [];
    renderNode(START_NODE);
  });
  edgeButtonsDiv.appendChild(btn);
}

// ----- Initialize app -----

/**
 * Load the pre-generated graph JSON and start the app
 */
async function initApp() {
  try {
    // If offline JS exists, graphData already defined
    if (typeof graphData === "undefined") {
      const response = await fetch("./graph.json");
      graphData = await response.json();
    }

    if (!graphData.nodes[START_NODE]) throw new Error("START node missing");
    renderNode(START_NODE);
  } catch (err) {
    nodeTextDiv.textContent = `Error initializing app: ${err.message}`;
  }
}

initApp();



// Run the app
initApp();
