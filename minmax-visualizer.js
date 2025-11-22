/**

 * Min-Max Tree Visualizer for Tigers and Goats Game

 * This script handles the interactive visualization of the min-max algorithm tree

 */

// Global variables for canvas and visualization

let canvas, ctx

let treeData = null

let currentBoardState = null

let cameraX = 0,
  cameraY = 0

let zoom = 1

let isDragging = false

let isMouseDown = false

let lastMouseX = 0,
  lastMouseY = 0

let mouseDownTime = 0

let mouseDownX = 0,
  mouseDownY = 0

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

// Board styling constants
const BOARD_STROKE_COLOR = "#444444ff"
const BOARD_STROKE_WIDTH = 5
const BOARD_STROKE_WIDTH_THICK = 2

// Board cell coordinates (from logic.ts)
const BOARD_A_CELLS = [
  { x: 400, y: 0 },
  { x: 100, y: 200 },
  { x: 290, y: 200 },
  { x: 360, y: 200 },
  { x: 440, y: 200 },
  { x: 510, y: 200 },
  { x: 700, y: 200 },
  { x: 100, y: 300 },
  { x: 235, y: 300 },
  { x: 340, y: 300 },
  { x: 460, y: 300 },
  { x: 565, y: 300 },
  { x: 700, y: 300 },
  { x: 100, y: 400 },
  { x: 180, y: 400 },
  { x: 320, y: 400 },
  { x: 480, y: 400 },
  { x: 620, y: 400 },
  { x: 700, y: 400 },
  { x: 125, y: 500 },
  { x: 300, y: 500 },
  { x: 500, y: 500 },
  { x: 675, y: 500 },
]

const BOARD_B_CELLS = [
  { x: 0, y: 0 },
  { x: 60, y: 0 },
  { x: 120, y: 0 },
  { x: 180, y: 0 },
  { x: 240, y: 0 },
  { x: 0, y: 60 },
  { x: 60, y: 60 },
  { x: 120, y: 60 },
  { x: 180, y: 60 },
  { x: 240, y: 60 },
  { x: 0, y: 120 },
  { x: 60, y: 120 },
  { x: 120, y: 120 },
  { x: 180, y: 120 },
  { x: 240, y: 120 },
  { x: 0, y: 180 },
  { x: 60, y: 180 },
  { x: 120, y: 180 },
  { x: 180, y: 180 },
  { x: 240, y: 180 },
  { x: 0, y: 240 },
  { x: 60, y: 240 },
  { x: 120, y: 240 },
  { x: 180, y: 240 },
  { x: 240, y: 240 },
]

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
  const isBoardA = gameBoardSVG.getAttribute("type") === "boardA"
  const cells = isBoardA ? BOARD_A_CELLS : BOARD_B_CELLS
  const parent = gameBoardSVG.querySelector("g") || gameBoardSVG

  // Determine board type and sizing
  const ellipseSize = isBoardA ? "8" : "5"
  const cellSize = isBoardA ? "30" : "15"

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
        <svg width="${cellSize * 2}" height="${cellSize * 2}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${cellSize}" cy="${cellSize}" r="${cellSize * 0.8}" fill="#48bb78" stroke="#2d3748" stroke-width="2"/>
          <text x="${cellSize}" y="${cellSize + 4}" text-anchor="middle" font-family="Arial" font-size="${cellSize * 0.4}" fill="white">G</text>
        </svg>
      `)
      )
    } else if (type === 2) {
      // Tiger
      return (
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="${cellSize * 2}" height="${cellSize * 2}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${cellSize}" cy="${cellSize}" r="${cellSize * 0.8}" fill="#f56565" stroke="#2d3748" stroke-width="2"/>
          <text x="${cellSize}" y="${cellSize + 4}" text-anchor="middle" font-family="Arial" font-size="${cellSize * 0.4}" fill="white">T</text>
        </svg>
      `)
      )
    }
    return ""
  }
  console.log("cells:", cells)

  // Create ellipses and images for each cell
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    const piece = boardState[i]

    // Create ellipse (clickable area)
    const ellipse = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "ellipse"
    )
    ellipse.setAttribute("cx", cell.x.toString())
    ellipse.setAttribute("cy", cell.y.toString())
    ellipse.setAttribute("rx", ellipseSize)
    ellipse.setAttribute("ry", ellipseSize)
    ellipse.setAttribute("class", "cell-ellipse")
    ellipse.style.fill = "#ff6b35" // Orange color for clickable indication
    ellipse.style.opacity = "0.3"
    ellipse.style.cursor = "pointer"

    // Create image for piece
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    )
    image.setAttribute("x", (cell.x - +cellSize).toString())
    image.setAttribute("y", (cell.y - +cellSize).toString())
    image.setAttribute("width", (+cellSize * 2).toString())
    image.setAttribute("height", (+cellSize * 2).toString())
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
      currentBoardState[i] = newState // Update global state

      // Update the image
      image.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        createPieceImage(newState)
      )
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
  boardTypeSelect.addEventListener("change", function () {
    updateBoardPreview()
  })

  // Initialize board preview for default board type
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
  isMouseDown = true
  isDragging = false // Don't start dragging immediately

  const rect = canvas.getBoundingClientRect()

  lastMouseX = e.clientX - rect.left

  lastMouseY = e.clientY - rect.top

  mouseDownX = lastMouseX

  mouseDownY = lastMouseY

  mouseDownTime = Date.now()

  canvas.style.cursor = "grabbing"
}

/**

 * Handle mouse move for dragging and hover

 */

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect()

  const mouseX = e.clientX - rect.left

  const mouseY = e.clientY - rect.top

  // Check if this should start dragging (mouse down and moved enough)
  if (
    !isDragging &&
    isMouseDown &&
    (Math.abs(mouseX - mouseDownX) > 5 || Math.abs(mouseY - mouseDownY) > 5)
  ) {
    isDragging = true
  }

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

function handleMouseUp(e) {
  const rect = canvas.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // Check if this was a click (not a drag and quick enough)
  const clickDuration = Date.now() - mouseDownTime
  const isClick = !isDragging && clickDuration < 300

  if (isClick) {
    // Find clicked node
    const worldX = (mouseX - cameraX) / zoom
    const worldY = (mouseY - cameraY) / zoom
    const clickedNode = findNodeAtPosition(worldX, worldY)

    if (
      clickedNode &&
      clickedNode.children &&
      clickedNode.children.length > 0
    ) {
      // Toggle expansion
      clickedNode.expanded = !clickedNode.expanded
      renderCanvas()
    }
  }

  isMouseDown = false
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

  // Group nodes by depth (only visible nodes)

  function groupNodesByDepth(node, depth = 0) {
    if (!nodesByDepth.has(depth)) {
      nodesByDepth.set(depth, [])
    }

    nodesByDepth.get(depth).push(node)

    // Only include children if this node is expanded
    if (node.expanded) {
      for (const child of node.children) {
        groupNodesByDepth(child, depth + 1)
      }
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

  renderNodes(treeData.rootNode, positions, bestPathSet, treeData.aiPlayer)

  // Render hover preview on top of everything

  if (hoveredNode) {
    const nodePos = positions.get(hoveredNode)
    if (nodePos) {
      const boardType = parseInt(document.getElementById("boardType").value)
      renderNodeBoardPreview(
        nodePos.x + NODE_CONFIG.radius + 10,
        nodePos.y - 70,
        hoveredNode.boardState,
        boardType,
        hoveredNode.action
      )
    }
  }
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

function renderNodes(node, positions, bestPathSet, aiPlayer) {
  const nodePos = positions.get(node)

  if (!nodePos) return

  // Determine node color

  let fillColor = node.isMaximizing
    ? aiPlayer === 2
      ? NODE_CONFIG.colors.tiger
      : NODE_CONFIG.colors.goat
    : aiPlayer === 2
      ? NODE_CONFIG.colors.goat
      : NODE_CONFIG.colors.tiger

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
    // Draw expansion indicator for nodes with children
    const hasChildren = node.children && node.children.length > 0
    const expansionSymbol = hasChildren ? (node.expanded ? "−" : "+") : ""

    ctx.fillText(`${node.value}`, nodePos.x, nodePos.y - 5)
    ctx.fillText(`${expansionSymbol}A:${node.action}`, nodePos.x, nodePos.y + 5)
  }

  // Recursively render child nodes

  for (const child of node.children) {
    renderNodes(child, positions, bestPathSet, aiPlayer)
  }
}

/**

 * Render a small board preview for a node

 */

function renderNodeBoardPreview(x, y, boardState, boardType, focusingCell) {
  const previewSize = 120

  // Draw background
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
  ctx.fillRect(x, y, previewSize, previewSize)
  ctx.strokeStyle = "#2d3748"
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, previewSize, previewSize)

  // Save context for scaling
  ctx.save()

  // Translate to preview position
  ctx.translate(x, y)

  // Calculate scale to fit preview
  const scale = previewSize / (boardType === 0 ? 800 : 300)
  const boardHeight = boardType === 0 ? 500 : 300
  const offsetY = (previewSize - boardHeight * scale) / 2
  ctx.translate(0, offsetY)

  // Draw board lines with scaled coordinates
  ctx.strokeStyle = BOARD_STROKE_COLOR
  ctx.lineWidth =
    (boardType === 0 ? BOARD_STROKE_WIDTH : BOARD_STROKE_WIDTH_THICK) * scale
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  if (boardType === 0) {
    // Board A lines
    // Horizontal line
    ctx.beginPath()
    ctx.moveTo(100 * scale, 300 * scale)
    ctx.lineTo(700 * scale, 300 * scale)
    ctx.stroke()

    // Rectangle
    ctx.strokeRect(100 * scale, 200 * scale, 600 * scale, 200 * scale)

    // Diamond shape
    ctx.beginPath()
    ctx.moveTo(400 * scale, 0 * scale)
    ctx.lineTo(125 * scale, 500 * scale)
    ctx.lineTo(675 * scale, 500 * scale)
    ctx.closePath()
    ctx.stroke()

    // Diagonal lines
    ctx.beginPath()
    ctx.moveTo(400 * scale, 0 * scale)
    ctx.lineTo(300 * scale, 500 * scale)
    ctx.moveTo(400 * scale, 0 * scale)
    ctx.lineTo(500 * scale, 500 * scale)
    ctx.stroke()
  } else {
    // Board B lines
    // Rectangle
    ctx.strokeRect(30 * scale, 30 * scale, 240 * scale, 240 * scale)

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const pos = 30 + i * 60
      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(pos * scale, 30 * scale)
      ctx.lineTo(pos * scale, 270 * scale)
      ctx.stroke()

      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(30 * scale, pos * scale)
      ctx.lineTo(270 * scale, pos * scale)
      ctx.stroke()
    }

    // Diagonal lines
    ctx.beginPath()
    ctx.moveTo(30 * scale, 30 * scale)
    ctx.lineTo(270 * scale, 270 * scale)
    ctx.moveTo(30 * scale, 270 * scale)
    ctx.lineTo(270 * scale, 30 * scale)
    ctx.stroke()

    // Diamond polygon
    ctx.beginPath()
    ctx.moveTo(30 * scale, 150 * scale)
    ctx.lineTo(150 * scale, 30 * scale)
    ctx.lineTo(270 * scale, 150 * scale)
    ctx.lineTo(150 * scale, 270 * scale)
    ctx.closePath()
    ctx.stroke()
  }

  // Restore context
  ctx.restore()

  // Now draw the pieces on top
  const cells = boardType === 0 ? BOARD_A_CELLS : BOARD_B_CELLS

  for (let i = 0; i < boardState.length; i++) {
    const pos = cells[i]
    if (!pos) continue

    const cellX = x + (boardType === 1 ? 12 : 0) + pos.x * scale
    // const cellY = y - 8 + (pos.y + (boardType === 0 ? 50 : 0)) * scale // Board A y-offset
    const cellY = y + (boardType === 0 ? offsetY : 12) + pos.y * scale // Board A y-offset

    // Draw clickable area background
    const ellipseRadiusX = boardType === 0 ? 3 : 2.5
    const ellipseRadiusY = boardType === 0 ? 3 : 2.5

    ctx.beginPath()
    ctx.ellipse(cellX, cellY, ellipseRadiusX, ellipseRadiusY, 0, 0, 2 * Math.PI)
    ctx.fillStyle = "rgba(255, 107, 53, 0.3)"
    ctx.fill()

    // Draw piece if present
    if (boardState[i] === 1) {
      // Goat
      ctx.beginPath()
      ctx.ellipse(
        cellX,
        cellY,
        ellipseRadiusX,
        ellipseRadiusY,
        0,
        0,
        2 * Math.PI
      )
      ctx.fillStyle = "#48bb78"
      ctx.fill()
      //   ctx.strokeStyle = "#48bb78"
      //   ctx.lineWidth = 0.5 / scale
      //   ctx.stroke()

      ctx.fillStyle = "white"
      ctx.font = `${ellipseRadiusX * 0.8}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("G", cellX, cellY + 1)
    } else if (boardState[i] === 2) {
      // Tiger
      ctx.beginPath()
      ctx.ellipse(
        cellX,
        cellY,
        ellipseRadiusX,
        ellipseRadiusY,
        0,
        0,
        2 * Math.PI
      )
      ctx.fillStyle = "#f56565"
      ctx.fill()
      //   ctx.strokeStyle = "#2d3748"
      //   ctx.lineWidth = 0.5 / scale
      //   ctx.stroke()

      ctx.fillStyle = "white"
      ctx.font = `${ellipseRadiusX * 0.8}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("T", cellX, cellY + 1)
    } else {
      // Empty - just outline
      ctx.strokeStyle = "#2d3748"
      ctx.lineWidth = 0.1
      ctx.stroke()
    }

    // If it's focusing Cell then we should highlight it
    if (focusingCell !== undefined && i === focusingCell) {
      ctx.beginPath()
      ctx.ellipse(
        cellX,
        cellY,
        ellipseRadiusX,
        ellipseRadiusY,
        0,
        0,
        2 * Math.PI
      )
      ctx.strokeStyle = "#0000ff"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
}

/**

 * Render board state in the sidebar preview

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

 * Update board input placeholder and default value based on board type

 */

/**

 * Update board preview when input changes

 */

function updateBoardPreview() {
  const previewElement = document.getElementById("boardPreview")
  const boardTypeSelect = document.getElementById("boardType")
  const boardType = parseInt(boardTypeSelect.value)

  try {
    // Use default board state based on board type if not initialized
    if (
      !currentBoardState ||
      currentBoardState.length !== (boardType === 0 ? 23 : 25)
    ) {
      const defaultState =
        boardType === 0
          ? "2,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"
          : "2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2"
      currentBoardState = defaultState.split(",").map((s) => parseInt(s.trim()))
    }

    const boardState = [...currentBoardState] // Use current state

    // Validate board state length based on board type
    const expectedLength = boardType === 0 ? 23 : 25
    if (boardState.length !== expectedLength) {
      throw new Error(
        `Board ${boardType === 0 ? "A" : "B"} must have exactly ${expectedLength} positions`
      )
    }

    // Create SVG board using the same approach as client.ts
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

 * Initialize expanded state for all nodes in the tree
 * Only root node starts expanded
 */
function initializeNodeExpansionStates(rootNode) {
  function setExpansionState(node, isRoot = false) {
    node.expanded = isRoot // Only root starts expanded
    for (const child of node.children) {
      setExpansionState(child, false)
    }
  }
  setExpansionState(rootNode, true)
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
    const boardTypeSelect = document.getElementById("boardType")
    const boardType = parseInt(boardTypeSelect.value)

    const maxDepth = parseInt(document.getElementById("maxDepth").value)

    const aiPlayer = parseInt(document.getElementById("aiPlayer").value)

    const goatsPlaced = parseInt(document.getElementById("goatsPlaced").value)

    const goatsCaptured = parseInt(
      document.getElementById("goatsCaptured").value
    )

    // Use current board state
    if (!currentBoardState) {
      // Initialize with default if not set
      const defaultState =
        boardType === 0
          ? "2,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"
          : "2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2"
      currentBoardState = defaultState.split(",").map((s) => parseInt(s.trim()))
    }

    const boardState = [...currentBoardState] // Copy current state

    // Validate board state
    const expectedLength = boardType === 0 ? 23 : 25
    if (boardState.length !== expectedLength) {
      throw new Error(
        `Board ${boardType === 0 ? "A" : "B"} must have exactly ${expectedLength} positions`
      )
    }

    // Additional validation for each value
    for (const val of boardState) {
      if (isNaN(val) || val < 0 || val > 2) {
        throw new Error(
          "Board values must be 0 (empty), 1 (goat), or 2 (tiger)"
        )
      }
    }

    updateStatus("Creating game board...", "info")

    // Define Board B connectivity arrays if needed
    let boardBReachableCellIndexes = null
    let boardBTigerJumpableIndexes = null
    let boardBGoatRemovalAfterTigerJumpIndexes = null

    if (boardType === 1) {
      boardBReachableCellIndexes = [
        [1, 5, 6], // 0
        [0, 2, 6], // 1
        [1, 3, 7], // 2
        [2, 4, 8], // 3
        [3, 9], // 4
        [0, 6, 10], // 5
        [0, 1, 2, 5, 7, 10, 11, 12], // 6
        [2, 6, 8, 12], // 7
        [2, 3, 4, 7, 9, 12, 13, 14], // 8
        [4, 8, 14], // 9
        [5, 6, 11, 15, 16], // 10
        [6, 10, 12, 16], // 11
        [6, 7, 8, 11, 13, 16, 17, 18], // 12
        [8, 12, 14, 18], // 13
        [8, 9, 13, 18, 19], // 14
        [10, 16, 20], // 15
        [10, 11, 12, 15, 17, 20, 21, 22], // 16
        [12, 16, 18, 22], // 17
        [12, 13, 14, 17, 19, 22, 23, 24], // 18
        [14, 18, 24], // 19
        [15, 16, 21], // 20
        [16, 20, 22], // 21
        [16, 17, 18, 21, 23], // 22
        [18, 22, 24], // 23
        [18, 19, 23], // 24
      ]
      boardBTigerJumpableIndexes = [
        [2, 10, 12], // 0
        [3, 11], // 1
        [0, 4, 12], // 2
        [1, 13], // 3
        [2, 14], // 4
        [7, 15], // 5
        [8, 16, 18], // 6
        [5, 9, 17], // 7
        [6, 18], // 8
        [7, 19], // 9
        [0, 2, 12, 20, 22], // 10
        [1, 13, 21], // 11
        [0, 2, 4, 10, 14, 20, 22, 24], // 12
        [3, 11, 23], // 13
        [2, 4, 12, 22, 24], // 14
        [5, 17], // 15
        [6, 8, 18], // 16
        [7, 15, 19], // 17
        [6, 8, 16], // 18
        [9, 17], // 19
        [10, 12, 22], // 20
        [11, 23], // 21
        [10, 12, 14], // 22
        [13, 21], // 23
        [12, 14, 22], // 24
      ]
      boardBGoatRemovalAfterTigerJumpIndexes = [
        [1, 5, 6], // 0
        [2, 6], // 1
        [1, 3, 7], // 2
        [2, 8], // 3
        [3, 9], // 4
        [6, 10], // 5
        [7, 11, 12], // 6
        [6, 8, 12], // 7
        [7, 13], // 8
        [8, 14], // 9
        [5, 6, 11, 15, 16], // 10
        [6, 12, 16], // 11
        [6, 7, 8, 11, 13, 16, 17, 18], // 12
        [8, 12, 18], // 13
        [8, 9, 13, 18, 19], // 14
        [10, 16], // 15
        [11, 12, 17], // 16
        [12, 16, 18], // 17
        [12, 13, 17], // 18
        [14, 18], // 19
        [15, 16, 21], // 20
        [16, 22], // 21
        [16, 17, 18], // 22
        [18, 22], // 23
        [18, 19, 23], // 24
      ]
    }

    // Import the Board class and tree generation function

    const { Board, generateTreeVisualization } = await import("./min_max.js")

    // Create board instance

    const board = new Board(
      boardBReachableCellIndexes,
      boardBTigerJumpableIndexes,
      boardBGoatRemovalAfterTigerJumpIndexes
    )

    board.board = [...boardState]

    board.currentPlayer = aiPlayer

    board.goatsPlacedCount = goatsPlaced

    board.goatsCapturedCount = goatsCaptured

    // Update possible moves for the current state

    board.updatePossibleMovablePieces()

    updateStatus("Generating min-max tree...", "info")

    // Generate the tree visualization data

    const startTime = performance.now()

    const visualizationData = generateTreeVisualization(
      board,
      aiPlayer,
      maxDepth
    )

    const endTime = performance.now()

    treeData = visualizationData

    // Initialize expanded state for all nodes (only root expanded initially)
    initializeNodeExpansionStates(treeData.rootNode)

    // Find best move from root node
    const bestMove =
      treeData.rootNode.children.length > 0
        ? treeData.rootNode.children.reduce((best, child) => {
            return child.value > best.value ? child : best
          }).action
        : "-"

    const bestValue =
      treeData.rootNode.children.length > 0
        ? treeData.rootNode.children.reduce((best, child) => {
            return child.value > best.value ? child : best
          }).value
        : "-"

    console.log("bestMove", bestMove)
    console.log("bestValue", bestValue)
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

window.resetVisualization = resetVisualization

window.centerTree = centerTree

window.zoomIn = zoomIn

window.zoomOut = zoomOut

window.resetZoom = resetZoom
