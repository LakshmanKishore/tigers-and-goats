import "./styles.css"

import { Player, PlayerId } from "rune-sdk"

import selectSoundAudio from "./assets/select.wav"
import robotImage from "./assets/robot.png"

// Types
interface GameCell {
  x: number
  y: number
  playerId: string | null
  reachableCellIndexes: number[]
}

// DOM Elements
const playersSection = document.getElementById("playersSection")!
const startButton = document.getElementById("startButton")! as HTMLButtonElement
const boardTypes = document.getElementById("boardTypes")!
const pieceTypes = document.getElementById("pieceTypes")!
const configPage = document.getElementById("configPage")!
const gamePage = document.getElementById("gamePage")!
const boardTypeInfo = document.getElementById("boardTypeInfo")!
const pieceTypeInfo = document.getElementById("pieceTypeInfo")!

// Audio
const selectSound = new Audio(selectSoundAudio)

// Game state
let selectedBoardType: number | null = null
let selectedPieceType: number | null = null
let playerPieceSelections: Record<string, number | null> = {}
let playerElements: HTMLElement[] = []
let yourPlayerId: PlayerId | undefined
let isPlayingWithBot: boolean = false
let cellImages: SVGImageElement[] = []

// Piece images
const pieceImages = ["src/assets/tiger.png", "src/assets/goat.png"]

// Board styling constants
const BOARD_STROKE_COLOR = "#e6e6e6"
const BOARD_STROKE_WIDTH = 5
const BOARD_STROKE_WIDTH_THICK = 2

// Cell/Ellipse styling constants
const FILL_COLOR = "#ff6b35" // Orange color for clickable indication

// Board-specific sizing constants
const BOARD_A_ELLIPSE_SIZE = "8" // Smaller for Board A's larger coordinate system
const BOARD_A_CELL_SIZE = "35"
const BOARD_B_ELLIPSE_SIZE = "5" // Larger for Board B's smaller coordinate system
const BOARD_B_CELL_SIZE = "20"

/**
 * Creates BoardA SVG (Triangle/Diamond pattern) dynamically
 * Based on boardA.svg structure
 */
function createBoardASVG(): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("viewBox", "0 -30 800 550")
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  svg.style.width = "110vw"
  // svg.style.height = "100%"

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
function createBoardBSVG(): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("viewBox", "0 0 300 300")
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  svg.style.width = "105vw"
  // svg.style.height = "100%"

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
function getBoardSVG(boardType: number): SVGElement {
  return boardType === 0 ? createBoardASVG() : createBoardBSVG()
}

/**
 * Creates ellipses and clickable areas for game cells
 */
function createCellElements(
  gameBoardSVG: SVGElement,
  cells: GameCell[],
  playerIds: string[]
) {
  // Clear existing cell images
  cellImages.forEach((img) => img.remove())
  cellImages = []

  // Determine board type based on viewBox to choose appropriate sizing
  const viewBox = gameBoardSVG.getAttribute("viewBox")
  const isBoardA = viewBox?.includes("800 550") // Board A has viewBox "0 -30 800 550"

  // Use board-specific sizing
  const ellipseSize = isBoardA ? BOARD_A_ELLIPSE_SIZE : BOARD_B_ELLIPSE_SIZE
  const cellSize = isBoardA ? BOARD_A_CELL_SIZE : BOARD_B_CELL_SIZE

  // Create ellipses and images for each cell
  cellImages = cells.map((_, index) => {
    const ellipse = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "ellipse"
    )
    ellipse.setAttribute("cx", cells[index].x.toString())
    ellipse.setAttribute("cy", cells[index].y.toString())
    ellipse.setAttribute("rx", ellipseSize)
    ellipse.setAttribute("ry", ellipseSize)
    ellipse.setAttribute("style", `fill: ${FILL_COLOR} `)

    // Create a svg image element which will then be used to set the image of avatar
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    )

    image.setAttribute("x", (cells[index].x - +cellSize).toString())
    image.setAttribute("y", (cells[index].y - +cellSize).toString())
    image.setAttribute("width", (+cellSize * 2).toString())
    image.setAttribute("height", (+cellSize * 2).toString())

    // Add click event listener for valid players
    if (yourPlayerId && playerIds.includes(yourPlayerId)) {
      image.addEventListener("click", () => {
        Rune.actions.performCellAction(index)
      })
      image.style.cursor = "pointer"
    }

    // Check if board has a group element (Board B) or not (Board A)
    const group = gameBoardSVG.querySelector("g")
    if (group) {
      // Board B has a group element
      group.appendChild(ellipse)
      group.appendChild(image)
    } else {
      // Board A has no group element
      gameBoardSVG.appendChild(ellipse)
      gameBoardSVG.appendChild(image)
    }
    return image
  })

  return cellImages
}

function updateCellImages({
  game,
}: {
  game: {
    cells: GameCell[]
    playerIds: string[]
    selectedCellIndex: number
  }
}) {
  const { cells, playerIds, selectedCellIndex } = game

  // Skip if cellImages not initialized yet
  if (cellImages.length === 0) {
    return
  }

  // Get all the player ids information
  const playersInfo = playerIds.reduce(
    (acc: { [playerId: string]: Player }, playerId: string) => {
      if (playerId === "bot") return acc
      const info: Player | null = Rune.getPlayerInfo(playerId)
      if (info) {
        acc[playerId] = info
      }
      return acc
    },
    {} as { [playerId: string]: Player }
  )

  const botPlayerInfo: Player = {
    displayName: "Bot",
    avatarUrl: robotImage,
    playerId: "bot",
  }

  playersInfo["bot"] = botPlayerInfo

  cellImages.forEach((cellImage, index) => {
    if (!cells[index]) return // Safety check

    const cellValue: string | null = cells[index].playerId

    cellImage.setAttribute(
      "player",
      (cellValue !== null ? playerIds.indexOf(cellValue) : -1).toString()
    )

    // If cell has a player id then have to show player id's avatar
    if (cellValue && playersInfo[cellValue]) {
      cellImage.setAttribute("href", playersInfo[cellValue].avatarUrl)
    } else {
      cellImage.setAttribute("href", "")
    }

    // If the cell is a selected cell then we should dim it
    if (selectedCellIndex === index) {
      // cellImage.setAttribute("class", "dimmed")
      cellImage.style.opacity = "0.5"
    }
  })
}

/**
 * Initialize board selection with SVG boards
 */
function initializeBoardSelection() {
  const boardOptions = boardTypes.querySelectorAll(".board-option")

  boardOptions.forEach((option, index) => {
    // Clear existing content
    option.innerHTML = ""

    // Create SVG board
    const svgBoard = getBoardSVG(index)
    svgBoard.classList.add("board-image")

    // Add SVG to option
    option.appendChild(svgBoard)
  })
}

/**
 * Updates the start button state
 */
function updateStartButton() {
  const boardSelected = selectedBoardType !== null
  const playerHasSelectedPiece = Object.keys(playerPieceSelections).length >= 1
  const bothPlayersSelectedPieces =
    Object.keys(playerPieceSelections).length >= 2

  // For single player mode, only need board + single piece selection
  // For multiplayer mode, need board + both players have pieces
  const canStart =
    boardSelected &&
    (isPlayingWithBot ? playerHasSelectedPiece : bothPlayersSelectedPieces)

  startButton.disabled = !canStart
}

/**
 * Update board selection UI to show single board selection
 */
function updateBoardSelectionUI() {
  const boardOptions = boardTypes.querySelectorAll(".board-option")

  boardOptions.forEach((option, index) => {
    // Remove all selection classes
    option.classList.remove(
      "selected",
      "selected-player-0",
      "selected-player-1",
      "disabled-by-other",
      "selected-multiple"
    )

    // Check if this board is the globally selected board
    if (selectedBoardType === index) {
      option.classList.add("selected")
    }
  })
}

/**
 * Update piece selection UI to show player-specific selections
 */
function updatePieceSelectionUI() {
  const pieceOptions = pieceTypes.querySelectorAll(".piece-option")

  pieceOptions.forEach((option, index) => {
    // Remove all selection classes
    option.classList.remove(
      "selected",
      "selected-player-0",
      "selected-player-1",
      "disabled-by-other"
    )

    // Find which player has selected this piece
    const playerWithThisPiece = Object.entries(playerPieceSelections).find(
      ([, selection]) => selection === index
    )

    if (playerWithThisPiece) {
      const [playerId] = playerWithThisPiece
      const playerIndex = Object.keys(playerPieceSelections).indexOf(playerId)
      option.classList.add(`selected-player-${playerIndex}`)
    }
  })
}

/**
 * Switch to game page
 */
function switchToGamePage(cells?: GameCell[], playerIds: string[] = []) {
  configPage.classList.add("hidden")
  gamePage.classList.add("active")

  // Update game info section with selected configuration
  if (selectedBoardType !== null) {
    const boardSVG = getBoardSVG(selectedBoardType)
    boardSVG.style.width = "50px"
    boardSVG.style.height = "50px"

    boardTypeInfo.innerHTML = `<span>Board ${selectedBoardType + 1}</span>`
    boardTypeInfo.insertBefore(boardSVG, boardTypeInfo.firstChild)
  }

  if (selectedPieceType !== null) {
    pieceTypeInfo.innerHTML = `
      <img src="${pieceImages[selectedPieceType]}" alt="Piece Type" />
      <span>${selectedPieceType === 0 ? "Tiger" : "Goat"}</span>
    `
  }

  // Update the main game board with the selected board type
  const gameBoard = document.getElementById("gameBoard")!
  if (selectedBoardType !== null) {
    const mainBoardSVG = getBoardSVG(selectedBoardType)
    mainBoardSVG.classList.add("main-game-board")

    // Clear any existing content and add the board
    gameBoard.innerHTML = ""
    gameBoard.appendChild(mainBoardSVG)

    // Add cell ellipses and click handlers if cells data is available
    if (cells && cells.length > 0) {
      createCellElements(mainBoardSVG, cells, playerIds)
    }
  }
}

/**
 * Initialize the UI for the landing page
 */
function initUI(
  playerIds: PlayerId[],
  myPlayerId: PlayerId | undefined,
  gameStarted: boolean = false,
  boardType: number | null = null,
  pieceType: number | null = null,
  playerPieceSelectionsFromServer: Record<string, number | null> = {}
) {
  // Save your player ID
  yourPlayerId = myPlayerId

  // Update saved selections
  selectedBoardType = boardType
  selectedPieceType = pieceType
  playerPieceSelections = playerPieceSelectionsFromServer

  // If game started, switch to game page
  if (gameStarted) {
    switchToGamePage()
    return
  }

  // Initialize board selection with SVG boards
  initializeBoardSelection()

  // Setup player display
  playersSection.innerHTML = "" // Clear existing content
  playerElements = []

  // Create player display section based on number of players and bot status
  if (playerIds.length === 0) {
    // No players yet
    const playerElement = document.createElement("div")
    playerElement.classList.add("player-waiting")
    playerElement.textContent = "Waiting for players..."
    playersSection.appendChild(playerElement)
    playerElements.push(playerElement)
  } else if (isPlayingWithBot) {
    // Playing with bot - show the real player first, then bot
    const realPlayerIds = playerIds.filter((id) => id !== "bot")
    if (realPlayerIds.length > 0) {
      const playerInfo = Rune.getPlayerInfo(realPlayerIds[0])
      if (playerInfo) {
        const playerElement = document.createElement("div")
        playerElement.classList.add("player")
        playerElement.innerHTML = `
          <img src="${playerInfo.avatarUrl}" alt="Player Avatar" />
          <span>${playerInfo.displayName}${playerInfo.playerId === yourPlayerId ? " (You)" : ""}</span>
        `
        playersSection.appendChild(playerElement)
        playerElements.push(playerElement)
      }
    }

    // Robot opponent
    const robotElement = document.createElement("div")
    robotElement.classList.add("player")
    robotElement.innerHTML = `
      <img src="${robotImage}" alt="Robot Avatar" />
      <span>AI Bot</span>
    `
    playersSection.appendChild(robotElement)
    playerElements.push(robotElement)
  } else {
    // Two or more real players (we'll show only the first two)
    const player1Info = Rune.getPlayerInfo(playerIds[0])
    if (player1Info) {
      const player1Element = document.createElement("div")
      player1Element.classList.add("player")
      player1Element.innerHTML = `
        <img src="${player1Info.avatarUrl}" alt="${player1Info.displayName}" />
        <span>${player1Info.displayName}${player1Info.playerId === yourPlayerId ? " (You)" : ""}</span>
      `
      playersSection.appendChild(player1Element)
      playerElements.push(player1Element)
    }

    if (playerIds.length > 1) {
      const player2Info = Rune.getPlayerInfo(playerIds[1])
      if (player2Info) {
        const player2Element = document.createElement("div")
        player2Element.classList.add("player")
        player2Element.innerHTML = `
          <img src="${player2Info.avatarUrl}" alt="${player2Info.displayName}" />
          <span>${player2Info.displayName}${player2Info.playerId === yourPlayerId ? " (You)" : ""}</span>
        `
        playersSection.appendChild(player2Element)
        playerElements.push(player2Element)
      }
    }
  }

  // Setup board type selection (both players can select any board)
  const boardOptions = boardTypes.querySelectorAll(".board-option")
  boardOptions.forEach((option, index) => {
    // Remove old event listeners by cloning and replacing
    const newOption = option.cloneNode(true) as HTMLElement
    option.parentNode?.replaceChild(newOption, option)

    newOption.addEventListener("click", () => {
      if (selectedBoardType === index) {
        // Deselect if this board is already selected globally
        Rune.actions.updateBoardSelection(null)
        selectSound.play()
      } else {
        // Select new board type (replaces any previous selection)
        Rune.actions.updateBoardSelection(index)
        selectSound.play()
      }
    })
  })

  // Setup piece type selection (both players can select)
  const pieceOptions = pieceTypes.querySelectorAll(".piece-option")
  pieceOptions.forEach((option, index) => {
    // Remove old event listeners by cloning and replacing
    const newOption = option.cloneNode(true) as HTMLElement
    option.parentNode?.replaceChild(newOption, option)

    newOption.addEventListener("click", () => {
      const currentPlayerSelection = playerPieceSelections[myPlayerId || ""]

      if (currentPlayerSelection === index) {
        // Deselect if already selected by current player
        Rune.actions.updatePieceSelection(null)
        selectSound.play()
      } else {
        // Check if this piece is already selected by another player
        const otherPlayerHasThisPiece = Object.entries(
          playerPieceSelections
        ).some(
          ([playerId, selection]) =>
            playerId !== myPlayerId && selection === index
        )

        if (!otherPlayerHasThisPiece) {
          // Select new option
          Rune.actions.updatePieceSelection(index)
          selectSound.play()
        }
      }
    })
  })

  // Update piece selection UI
  updatePieceSelectionUI()

  // Update board selection UI
  updateBoardSelectionUI()

  // Setup start button
  startButton.removeEventListener("click", startButtonHandler)
  startButton.addEventListener("click", startButtonHandler)

  updateStartButton()
}

/**
 * Start button click handler
 */
function startButtonHandler() {
  const boardSelected = selectedBoardType !== null
  const playerHasSelectedPiece = Object.keys(playerPieceSelections).length >= 1
  const bothPlayersSelectedPieces =
    Object.keys(playerPieceSelections).length >= 2

  // Check conditions for starting the game
  const canStart =
    boardSelected &&
    (isPlayingWithBot ? playerHasSelectedPiece : bothPlayersSelectedPieces)

  if (canStart) {
    // Send start game action
    Rune.actions.startGame({
      boardType: selectedBoardType || 0, // fallback value
      pieceType: selectedPieceType || 0, // fallback value
    })
    selectSound.play()
  }
}

// Initialize the Rune client
Rune.initClient({
  onChange: ({ game, yourPlayerId }) => {
    // Handle game state changes
    const {
      playerIds,
      boardType,
      pieceType,
      gameStarted,
      playingWithBot,
      playerPieceSelections: serverPlayerPieceSelections,
      cells,
    } = game

    // Update game mode
    isPlayingWithBot = playingWithBot || false

    // Initialize or update UI
    initUI(
      playerIds,
      yourPlayerId,
      gameStarted,
      boardType,
      pieceType,
      serverPlayerPieceSelections
    )

    // Update selection UIs
    updatePieceSelectionUI()
    updateBoardSelectionUI()
    updateStartButton()

    // If game started, switch to game page with cells data
    if (gameStarted && cells) {
      switchToGamePage(cells, playerIds)
    }

    updateCellImages({ game })
  },
})
