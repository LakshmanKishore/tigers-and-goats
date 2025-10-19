/**

 * Min-Max Tree Visualizer for Tigers and Goats Game

 * This script handles the interactive visualization of the min-max algorithm tree

 */

// Global variables for canvas and visualization

let canvas, ctx

let treeData = null

let cameraX = 0,
  cameraY = 0

let zoom = 1

let isDragging = false

let lastMouseX = 0,
  lastMouseY = 0

let hoveredNode = null

// Node rendering configuration

const NODE_CONFIG = {
  radius: 25,

  spacing: {
    horizontal: 150,

    vertical: 80,
  },

  colors: {
    goat: "#48bb78", // Green for goat (minimizing)

    tiger: "#f56565", // Red for tiger (maximizing)

    pruned: "#a0aec0", // Gray for pruned nodes

    bestPath: "#4299e1", // Blue for best path

    hover: "#fbd38d", // Orange for hover
  },

  text: {
    font: "12px Arial",
    color: "#2d3748",
  },
}

// Board rendering configuration

const BOARD_CONFIG = {
  width: 180,

  height: 180,

  positions: [
    // Define the 23 positions based on the board layout

    { x: 90, y: 20 }, // 0 - top

    { x: 30, y: 50 }, // 1

    { x: 60, y: 50 }, // 2

    { x: 90, y: 50 }, // 3

    { x: 120, y: 50 }, // 4

    { x: 150, y: 50 }, // 5

    { x: 170, y: 50 }, // 6

    { x: 30, y: 80 }, // 7

    { x: 60, y: 80 }, // 8

    { x: 90, y: 80 }, // 9

    { x: 120, y: 80 }, // 10

    { x: 150, y: 80 }, // 11

    { x: 170, y: 80 }, // 12

    { x: 30, y: 110 }, // 13

    { x: 60, y: 110 }, // 14

    { x: 90, y: 110 }, // 15

    { x: 120, y: 110 }, // 16

    { x: 150, y: 110 }, // 17

    { x: 170, y: 110 }, // 18

    { x: 60, y: 140 }, // 19

    { x: 90, y: 140 }, // 20

    { x: 120, y: 140 }, // 21

    { x: 150, y: 140 }, // 22
  ],
}

// Board styling constants
const BOARD_STROKE_COLOR = "#444444ff"
const BOARD_STROKE_WIDTH = 5
const BOARD_STROKE_WIDTH_THICK = 2

/**
 * Creates BoardA SVG (Triangle/Diamond pattern) dynamically
 * Based on boardA.svg structure
 */
function createBoardASVG() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("viewBox", "0 -50 800 600")
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
  svg.setAttribute("type", "boardA")
  svg.style.width = "100%"
  svg.style.height = "100%"

  // Create the triangle/diamond structure based on boardA.svg
  const elements = [
    {
      tag: "line",
      attrs: {
        x1: "100",
        y1: "300",
        x2: "700",
        y2: "300",
      },
    },
    {
      tag: "polygon",
      attrs: {
        points: "100 200 100 400 700 400 700 200",
      },
    },
    {
      tag: "path",
      attrs: {
        d: "M 400 0 L 125 500 L 675 500 L 400 0",
      },
    },
    {
      tag: "line",
      attrs: {
        x1: "400",
        y1: "0",
        x2: "300",
        y2: "500",
      },
    },
    {
      tag: "line",
      attrs: {
        x1: "400",
        y1: "0",
        x2: "500",
        y2: "500",
      },
    },
  ]

  elements.forEach(({ tag, attrs }) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag)
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })

    // Apply styling using constants
    element.setAttribute("stroke", BOARD_STROKE_COLOR)
    element.setAttribute("stroke-width", BOARD_STROKE_WIDTH.toString())
    element.setAttribute("fill", "none")

    svg.appendChild(element)
  })

  return svg
}

/**
 * Creates BoardB SVG (Grid/Complex pattern) dynamically
 * Based on boardB.svg structure
 */
function createBoardBSVG() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("viewBox", "0 0 300 300")
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
  svg.setAttribute("type", "boardB")
  svg.style.width = "100%"
  svg.style.height = "100%"

  // Create group with transform
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
  group.setAttribute("transform", "translate(30,30)")

  // Create the grid structure based on boardB.svg
  const elements = [
    {
      tag: "rect",
      attrs: {
        width: "240",
        height: "240",
      },
    },
    {
      tag: "line",
      attrs: {
        x1: "0",
        y1: "60",
        x2: "240",
        y2: "60",
      },
    },
    {
      tag: "line",
      attrs: {
        x1: "0",
        y1: "120",
        x2: "240",
        y2: "120",
      },
    },
    {
      tag: "line",
      attrs: {
        x1: "0",
        y1: "180",
        x2: "240",
        y2: "180",
      },
    },
    {
      tag: "line",
      attrs: {
        x1: "60",
        y1: "0",
        x2: "60",
        y2: "240",
      },
    },
    {
      tag: "line",
      attrs: {
        x1: "120",
        y1: "0",
        x2: "120",
        y2: "240",
      },
    },
    {
      tag: "line",
      attrs: {
        x1: "180",
        y1: "0",
        x2: "180",
        y2: "240",
      },
    },
    {
      tag: "line",
      attrs: {
        x1: "240",
        y1: "240",
        x2: "0",
        y2: "0",
      },
    },
    {
      tag: "line",
      attrs: {
        x1: "240",
        y1: "0",
        x2: "0",
        y2: "240",
      },
    },
    {
      tag: "polygon",
      attrs: {
        points: "0 120 120 0 240 120 120 240",
      },
    },
  ]

  elements.forEach(({ tag, attrs }) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag)
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })

    // Apply styling using constants
    element.setAttribute("stroke", BOARD_STROKE_COLOR)
    element.setAttribute("stroke-width", BOARD_STROKE_WIDTH_THICK.toString())
    element.setAttribute("fill", "none")

    group.appendChild(element)
  })

  svg.appendChild(group)
  return svg
}

/**
 * Gets the appropriate board SVG based on board type
 */
function getBoardSVG(boardType) {
  return boardType === 0 ? createBoardASVG() : createBoardBSVG()
}

/**
 * Creates ellipses and clickable areas for game cells in the visualizer
 */
function createCellElements(gameBoardSVG, boardState) {
  const positions = BOARD_CONFIG.positions
  const parent = gameBoardSVG.querySelector("g") || gameBoardSVG

  // Determine board type and scaling
  const svgViewBox = gameBoardSVG.getAttribute("viewBox").split(" ").map(Number)
  const svgWidth = svgViewBox[2]
  const svgHeight = svgViewBox[3]

  // Scale factors to fit positions into SVG viewBox
  const scaleX = svgWidth / 180 // BOARD_CONFIG is designed for 180 width
  const scaleY = svgHeight / 180 // BOARD_CONFIG is designed for 180 height
  const offsetX = svgViewBox[0] // viewBox x offset
  const offsetY = svgViewBox[1] // viewBox y offset

  // Clear existing cell elements
  const existingEllipses = parent.querySelectorAll("ellipse.cell-ellipse")
  const existingImages = parent.querySelectorAll("image.cell-image")
  existingEllipses.forEach((el) => el.remove())
  existingImages.forEach((el) => el.remove())

  // Helper function to create piece SVG data URL
  const createPieceImage = (type) => {
    if (type === 1) {
      // Goat
      return (
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" fill="#48bb78" stroke="#2d3748" stroke-width="2"/>
          <text x="15" y="19" text-anchor="middle" font-family="Arial" font-size="12" fill="white">G</text>
        </svg>
      `)
      )
    } else if (type === 2) {
      // Tiger
      return (
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" fill="#f56565" stroke="#2d3748" stroke-width="2"/>
          <text x="15" y="19" text-anchor="middle" font-family="Arial" font-size="12" fill="white">T</text>
        </svg>
      `)
      )
    }
    return ""
  }

  // Create ellipses and images for each cell
  for (let i = 0; i < Math.min(23, boardState.length); i++) {
    const pos = positions[i]
    const piece = boardState[i]

    // Scale position to fit SVG viewBox
    const scaledX = offsetX + pos.x * scaleX
    const scaledY = offsetY + pos.y * scaleY

    // Create ellipse (clickable area)
    const ellipse = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "ellipse"
    )
    ellipse.setAttribute("cx", scaledX.toString())
    ellipse.setAttribute("cy", scaledY.toString())
    ellipse.setAttribute("rx", "8")
    ellipse.setAttribute("ry", "8")
    ellipse.setAttribute("class", "cell-ellipse")
    ellipse.style.fill = "#ff6b35" // Orange color for clickable indication
    ellipse.style.opacity = "0.3"
    ellipse.style.cursor = "pointer"

    // Create image for piece
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    )
    image.setAttribute("x", (scaledX - 15).toString())
    image.setAttribute("y", (scaledY - 15).toString())
    image.setAttribute("width", "30")
    image.setAttribute("height", "30")
    image.setAttribute("class", "cell-image")
    image.style.cursor = "pointer"

    // Set image based on piece type
    image.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      createPieceImage(piece)
    )

    // Add click handler to cycle through states
    const clickHandler = () => {
      // Cycle: 0 (empty) -> 1 (goat) -> 2 (tiger) -> 0
      const newState = (boardState[i] + 1) % 3
      boardState[i] = newState

      // Update the image
      image.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        createPieceImage(newState)
      )

      // Update the textarea
      const boardInput = document.getElementById("boardInput")
      boardInput.value = boardState.join(",")
    }

    ellipse.addEventListener("click", clickHandler)
    image.addEventListener("click", clickHandler)

    // Add to SVG
    parent.appendChild(ellipse)
    parent.appendChild(image)
  }
}

// Initialize the visualization when the page loads

document.addEventListener("DOMContentLoaded", function () {
  initializeCanvas()

  setupEventListeners()

  // Add event listener for board type changes
  const boardTypeSelect = document.getElementById("boardType")
  boardTypeSelect.addEventListener("change", updateBoardPreview)

  updateBoardPreview()
})

/**

 * Initialize the canvas and set up rendering context

 */

function initializeCanvas() {
  canvas = document.getElementById("treeCanvas")
  ctx = canvas.getContext("2d")

  // Set canvas size to match container

  resizeCanvas()

  // Handle high DPI displays

  const devicePixelRatio = window.devicePixelRatio || 1

  const rect = canvas.getBoundingClientRect()

  canvas.width = rect.width * devicePixelRatio

  canvas.height = rect.height * devicePixelRatio

  ctx.scale(devicePixelRatio, devicePixelRatio)

  canvas.style.width = rect.width + "px"
  canvas.style.height = rect.height + "px"

  // Initial render

  renderCanvas()
}

/**

 * Handle canvas resize

 */

function resizeCanvas() {
  const container = canvas.parentElement

  canvas.width = container.clientWidth

  canvas.height = container.clientHeight
}

/**

 * Set up event listeners for canvas interaction

 */

function setupEventListeners() {
  // Mouse events for panning

  canvas.addEventListener("mousedown", handleMouseDown)

  canvas.addEventListener("mousemove", handleMouseMove)

  canvas.addEventListener("mouseup", handleMouseUp)

  canvas.addEventListener("mouseleave", handleMouseUp)

  // Wheel event for zooming

  canvas.addEventListener("wheel", handleWheel)

  // Window resize

  window.addEventListener("resize", () => {
    resizeCanvas()

    renderCanvas()
  })
}

/**

 * Handle mouse down for dragging

 */

function handleMouseDown(e) {
  isDragging = true

  const rect = canvas.getBoundingClientRect()

  lastMouseX = e.clientX - rect.left

  lastMouseY = e.clientY - rect.top

  canvas.style.cursor = "grabbing"
}

/**

 * Handle mouse move for dragging and hover

 */

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect()

  const mouseX = e.clientX - rect.left

  const mouseY = e.clientY - rect.top

  if (isDragging) {
    const deltaX = mouseX - lastMouseX

    const deltaY = mouseY - lastMouseY

    cameraX += deltaX

    cameraY += deltaY

    lastMouseX = mouseX

    lastMouseY = mouseY

    renderCanvas()
  } else {
    // Check for node hover

    const worldX = (mouseX - cameraX) / zoom

    const worldY = (mouseY - cameraY) / zoom

    const newHoveredNode = findNodeAtPosition(worldX, worldY)

    if (newHoveredNode !== hoveredNode) {
      hoveredNode = newHoveredNode

      renderCanvas()
    }
  }
}

/**

 * Handle mouse up to stop dragging

 */

function handleMouseUp() {
  isDragging = false

  canvas.style.cursor = "grab"
}

/**

 * Handle mouse wheel for zooming

 */

function handleWheel(e) {
  e.preventDefault()

  const rect = canvas.getBoundingClientRect()

  const mouseX = e.clientX - rect.left

  const mouseY = e.clientY - rect.top

  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1

  const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor))

  // Zoom towards mouse position

  const worldX = (mouseX - cameraX) / zoom

  const worldY = (mouseY - cameraY) / zoom

  zoom = newZoom

  cameraX = mouseX - worldX * zoom

  cameraY = mouseY - worldY * zoom

  renderCanvas()
}

/**

 * Find node at the given world position

 */

function findNodeAtPosition(worldX, worldY) {
  if (!treeData) return null

  const nodePositions = calculateNodePositions(treeData.rootNode)

  for (const [node, pos] of nodePositions) {
    const dx = worldX - pos.x

    const dy = worldY - pos.y

    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance <= NODE_CONFIG.radius) {
      return node
    }
  }

  return null
}

/**

 * Calculate positions for all nodes in the tree

 */

function calculateNodePositions(rootNode) {
  const positions = new Map()

  const nodesByDepth = new Map()

  // Group nodes by depth

  function groupNodesByDepth(node, depth = 0) {
    if (!nodesByDepth.has(depth)) {
      nodesByDepth.set(depth, [])
    }

    nodesByDepth.get(depth).push(node)

    for (const child of node.children) {
      groupNodesByDepth(child, depth + 1)
    }
  }

  groupNodesByDepth(rootNode)

  // Calculate positions level by level

  nodesByDepth.forEach((nodes, depth) => {
    const totalWidth = (nodes.length - 1) * NODE_CONFIG.spacing.horizontal

    const startX = -totalWidth / 2

    const y = depth * NODE_CONFIG.spacing.vertical

    nodes.forEach((node, index) => {
      const x = startX + index * NODE_CONFIG.spacing.horizontal

      positions.set(node, { x, y })
    })
  })

  return positions
}

/**

 * Render the entire canvas

 */

function renderCanvas() {
  // Clear canvas

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Save context for transformations

  ctx.save()

  // Apply camera transformations

  ctx.translate(cameraX, cameraY)

  ctx.scale(zoom, zoom)

  if (treeData) {
    renderTree()
  } else {
    renderEmptyState()
  }

  // Restore context

  ctx.restore()
}

/**

 * Render empty state message

 */

function renderEmptyState() {
  ctx.save()

  ctx.scale(1 / zoom, 1 / zoom)

  ctx.translate(-cameraX / zoom, -cameraY / zoom)

  ctx.fillStyle = "#a0aec0"
  ctx.font = "20px Arial"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const centerX = canvas.width / 2

  const centerY = canvas.height / 2

  ctx.fillText('Click "Expand Min-Max Tree" to visualize', centerX, centerY)

  ctx.fillText("the algorithm exploration", centerX, centerY + 30)

  ctx.restore()
}

/**

 * Render the min-max tree

 */

function renderTree() {
  if (!treeData || !treeData.rootNode) return

  const positions = calculateNodePositions(treeData.rootNode)

  const bestPathSet = new Set(treeData.bestPath)

  // Render edges first (so they appear behind nodes)

  renderEdges(treeData.rootNode, positions, bestPathSet)

  // Render nodes

  renderNodes(treeData.rootNode, positions, bestPathSet)
}

/**

 * Render edges between nodes

 */

function renderEdges(node, positions, bestPathSet) {
  const nodePos = positions.get(node)

  if (!nodePos) return

  for (const child of node.children) {
    const childPos = positions.get(child)

    if (!childPos) continue

    ctx.beginPath()

    ctx.moveTo(nodePos.x, nodePos.y)

    ctx.lineTo(childPos.x, childPos.y)

    // Style based on whether this edge is part of the best path

    if (bestPathSet.has(child.id)) {
      ctx.strokeStyle = NODE_CONFIG.colors.bestPath

      ctx.lineWidth = 3
    } else if (child.isPruned) {
      ctx.strokeStyle = NODE_CONFIG.colors.pruned

      ctx.lineWidth = 1

      ctx.setLineDash([5, 5])
    } else {
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 2

      ctx.setLineDash([])
    }

    ctx.stroke()

    ctx.setLineDash([]) // Reset line dash

    // Recursively render child edges

    renderEdges(child, positions, bestPathSet)
  }
}

/**

 * Render nodes in the tree

 */

function renderNodes(node, positions, bestPathSet) {
  const nodePos = positions.get(node)

  if (!nodePos) return

  // Determine node color

  let fillColor = node.isMaximizing
    ? NODE_CONFIG.colors.tiger
    : NODE_CONFIG.colors.goat

  if (node.isPruned) {
    fillColor = NODE_CONFIG.colors.pruned
  }

  if (bestPathSet.has(node.id)) {
    fillColor = NODE_CONFIG.colors.bestPath
  }

  if (node === hoveredNode) {
    fillColor = NODE_CONFIG.colors.hover
  }

  // Draw node circle

  ctx.beginPath()

  ctx.arc(nodePos.x, nodePos.y, NODE_CONFIG.radius, 0, 2 * Math.PI)

  ctx.fillStyle = fillColor

  ctx.fill()

  // Draw node border

  ctx.strokeStyle = "#2d3748"
  ctx.lineWidth = 2

  ctx.stroke()

  // Draw node text (value and action)

  ctx.fillStyle = "#ffffff"
  ctx.font = "10px Arial"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  if (node.isPruned) {
    ctx.fillText("✂", nodePos.x, nodePos.y - 5)

    ctx.fillText("pruned", nodePos.x, nodePos.y + 5)
  } else {
    ctx.fillText(`${node.value}`, nodePos.x, nodePos.y - 5)

    ctx.fillText(`A:${node.action}`, nodePos.x, nodePos.y + 5)
  }

  // Draw small board preview if hovered

  if (node === hoveredNode) {
    renderNodeBoardPreview(
      nodePos.x + NODE_CONFIG.radius + 10,
      nodePos.y - 90,
      node.boardState
    )
  }

  // Recursively render child nodes

  for (const child of node.children) {
    renderNodes(child, positions, bestPathSet)
  }
}

/**

 * Render a small board preview for a node

 */

function renderNodeBoardPreview(x, y, boardState) {
  const previewSize = 120

  const cellSize = 8

  // Background

  ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
  ctx.fillRect(x, y, previewSize, previewSize)

  ctx.strokeStyle = "#2d3748"
  ctx.lineWidth = 1

  ctx.strokeRect(x, y, previewSize, previewSize)

  // Draw board positions

  for (let i = 0; i < Math.min(23, boardState.length); i++) {
    const pos = BOARD_CONFIG.positions[i]

    const cellX = x + (pos.x / BOARD_CONFIG.width) * previewSize

    const cellY = y + (pos.y / BOARD_CONFIG.height) * previewSize

    ctx.beginPath()

    ctx.arc(cellX, cellY, cellSize / 2, 0, 2 * Math.PI)

    if (boardState[i] === 0) {
      ctx.fillStyle = "#e2e8f0" // Empty
    } else if (boardState[i] === 1) {
      ctx.fillStyle = "#48bb78" // Goat
    } else if (boardState[i] === 2) {
      ctx.fillStyle = "#f56565" // Tiger
    }

    ctx.fill()

    ctx.strokeStyle = "#2d3748"
    ctx.lineWidth = 0.5

    ctx.stroke()
  }
}

/**

 * Render board state in the sidebar preview

 */

function renderBoardPreview() {
  const previewElement = document.getElementById("boardPreview")
  const boardInput = document.getElementById("boardInput").value
  const boardTypeSelect = document.getElementById("boardType")
  const boardType = parseInt(boardTypeSelect.value)

  try {
    const boardState = boardInput.split(",").map((s) => parseInt(s.trim()))

    if (boardState.length !== 23) {
      throw new Error("Board must have exactly 23 positions")
    }

    // Create SVG board using the selected board type
    const boardSVG = getBoardSVG(boardType)

    // Add ellipses and images for each cell position
    createCellElements(boardSVG, boardState)

    // Clear and add the SVG to the preview element
    previewElement.innerHTML = ""
    previewElement.appendChild(boardSVG)

    updateStatus("Board preview updated", "success")
  } catch (error) {
    previewElement.innerHTML = `<span style="color: #e53e3e;">Error: ${error.message}</span>`
    updateStatus(`Board preview error: ${error.message}`, "error")
  }
}

/**

 * Create SVG representation of the board

 */

/**
 * Update status message
 */

function updateStatus(message, type = "info") {
  const statusElement = document.getElementById("status")
  statusElement.textContent = message

  statusElement.className = `status ${type}`
}

/**

 * Update tree statistics display

 */

function updateTreeStats(stats) {
  document.getElementById("nodeCount").textContent = stats.totalNodes || 0

  document.getElementById("maxDepthReached").textContent =
    stats.maxDepthReached || 0

  document.getElementById("bestMove").textContent = stats.bestMove || "-"
  document.getElementById("bestValue").textContent = stats.bestValue || "-"
}

/**

 * Zoom controls

 */

function zoomIn() {
  zoom = Math.min(5, zoom * 1.2)

  renderCanvas()
}

function zoomOut() {
  zoom = Math.max(0.1, zoom / 1.2)

  renderCanvas()
}

function resetZoom() {
  zoom = 1

  renderCanvas()
}

/**

 * Center the tree in the viewport

 */

function centerTree() {
  if (!treeData) return

  cameraX = canvas.width / 2

  cameraY = 50 // Small offset from top

  zoom = 1

  renderCanvas()
}

/**

 * Reset the entire visualization

 */

function resetVisualization() {
  treeData = null

  cameraX = 0

  cameraY = 0

  zoom = 1

  hoveredNode = null

  updateTreeStats({})

  updateStatus("Visualization reset", "info")

  renderCanvas()
}

/**

 * Update board preview when input changes

 */

function updateBoardPreview() {
  renderBoardPreview()
}

/**

 * Main function to expand and visualize the min-max tree

 */

async function expandMinMaxTree() {
  try {
    updateStatus("Initializing min-max tree expansion...", "info")
    document.getElementById("loadingIndicator").style.display = "block"
    document.getElementById("expandTreeBtn").disabled = true

    // Get input parameters

    const boardInput = document.getElementById("boardInput").value

    const maxDepth = parseInt(document.getElementById("maxDepth").value)

    const currentPlayer = parseInt(
      document.getElementById("currentPlayer").value
    )

    const goatsPlaced = parseInt(document.getElementById("goatsPlaced").value)

    const goatsCaptured = parseInt(
      document.getElementById("goatsCaptured").value
    )

    // Parse board state

    const boardState = boardInput.split(",").map((s) => {
      const val = parseInt(s.trim())

      if (isNaN(val) || val < 0 || val > 2) {
        throw new Error(
          "Board values must be 0 (empty), 1 (goat), or 2 (tiger)"
        )
      }

      return val
    })

    if (boardState.length !== 23) {
      throw new Error("Board must have exactly 23 positions")
    }

    updateStatus("Creating game board...", "info")

    // Import the Board class and tree generation function

    const { Board, generateTreeVisualization } = await import(
      "./src/min_max.js"
    )

    // Create board instance

    const board = new Board()

    board.board = [...boardState]

    board.currentPlayer = currentPlayer

    board.goatsPlacedCount = goatsPlaced

    board.goatsCapturedCount = goatsCaptured

    // Update possible moves for the current state

    board.updatePossibleMovablePieces()

    updateStatus("Generating min-max tree...", "info")

    // Generate the tree visualization data

    const startTime = performance.now()

    const visualizationData = generateTreeVisualization(board, maxDepth)

    const endTime = performance.now()

    treeData = visualizationData

    // Find best move from root node

    const bestMove =
      treeData.rootNode.children.length > 0
        ? treeData.rootNode.children.reduce((best, child) => {
            if (currentPlayer === 2) {
              // Tiger maximizes

              return child.value > best.value ? child : best
            } else {
              // Goat minimizes

              return child.value < best.value ? child : best
            }
          }).action
        : "-"

    const bestValue =
      treeData.rootNode.children.length > 0
        ? treeData.rootNode.children.reduce((best, child) => {
            if (currentPlayer === 2) {
              // Tiger maximizes

              return child.value > best.value ? child : best
            } else {
              // Goat minimizes

              return child.value < best.value ? child : best
            }
          }).value
        : "-"

    // Update statistics

    updateTreeStats({
      totalNodes: treeData.totalNodes,

      maxDepthReached: treeData.maxDepthReached,

      bestMove: bestMove,

      bestValue: bestValue,
    })

    // Center and render the tree

    centerTree()

    const timeTaken = ((endTime - startTime) / 1000).toFixed(2)

    updateStatus(
      `Tree generated successfully! ${treeData.totalNodes} nodes in ${timeTaken}s`,

      "success"
    )
  } catch (error) {
    console.error("Error expanding min-max tree:", error)

    updateStatus(`Error: ${error.message}`, "error")
    treeData = null

    renderCanvas()
  } finally {
    document.getElementById("loadingIndicator").style.display = "none"
    document.getElementById("expandTreeBtn").disabled = false
  }
}

// Make functions available globally for HTML event handlers

window.expandMinMaxTree = expandMinMaxTree

window.updateBoardPreview = updateBoardPreview

window.resetVisualization = resetVisualization

window.centerTree = centerTree

window.zoomIn = zoomIn

window.zoomOut = zoomOut

window.resetZoom = resetZoom
