import "./styles.css"

import { PlayerId } from "rune-sdk"

import selectSoundAudio from "./assets/select.wav"
import robotImage from "./assets/robot.png"

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
let playerBoardSelections: Record<string, number | null> = {}
let playerElements: HTMLElement[] = []
let yourPlayerId: PlayerId | undefined
let isPlayingWithBot: boolean = false

// Piece images
const pieceImages = ["src/assets/tiger.png", "src/assets/goat.png"]

// Board styling constants
const BOARD_STROKE_COLOR = "#e6e6e6"
const BOARD_STROKE_WIDTH = 5
const BOARD_STROKE_WIDTH_THICK = 2

/**
 * Creates BoardA SVG (Triangle/Diamond pattern) dynamically
 * Based on boardA.svg structure
 */
function createBoardASVG(): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("viewBox", "0 0 800 520")
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
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
function createBoardBSVG(): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("viewBox", "0 0 300 300")
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
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
function getBoardSVG(boardType: number): SVGElement {
  return boardType === 0 ? createBoardASVG() : createBoardBSVG()
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
function switchToGamePage() {
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
  playerPieceSelectionsFromServer: Record<string, number | null> = {},
  playerBoardSelectionsFromServer: Record<string, number | null> = {}
) {
  // Save your player ID
  yourPlayerId = myPlayerId

  // Update saved selections
  selectedBoardType = boardType
  selectedPieceType = pieceType
  playerPieceSelections = playerPieceSelectionsFromServer
  playerBoardSelections = playerBoardSelectionsFromServer

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

  // Create player display section based on number of players
  if (playerIds.length === 0) {
    // No players yet
    const playerElement = document.createElement("div")
    playerElement.classList.add("player-waiting")
    playerElement.textContent = "Waiting for players..."
    playersSection.appendChild(playerElement)
    playerElements.push(playerElement)
  } else if (playerIds.length === 1) {
    // Single player with robot opponent
    const playerElement = document.createElement("div")
    const player = Rune.getPlayerInfo(playerIds[0])
    playerElement.classList.add("player")
    playerElement.innerHTML = `
      <img src="${player.avatarUrl}" alt="Player Avatar" />
      <span>${player.displayName}${player.playerId === yourPlayerId ? " (You)" : ""}</span>
    `
    playersSection.appendChild(playerElement)
    playerElements.push(playerElement)

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
    // Two or more players (we'll show only the first two)
    const player1 = Rune.getPlayerInfo(playerIds[0])
    const player1Element = document.createElement("div")
    player1Element.classList.add("player")
    player1Element.innerHTML = `
      <img src="${player1.avatarUrl}" alt="${player1.displayName}" />
      <span>${player1.displayName}${player1.playerId === yourPlayerId ? " (You)" : ""}</span>
    `
    playersSection.appendChild(player1Element)
    playerElements.push(player1Element)

    const player2 = Rune.getPlayerInfo(playerIds[1])
    const player2Element = document.createElement("div")
    player2Element.classList.add("player")
    player2Element.innerHTML = `
      <img src="${player2.avatarUrl}" alt="${player2.displayName}" />
      <span>${player2.displayName}${player2.playerId === yourPlayerId ? " (You)" : ""}</span>
    `
    playersSection.appendChild(player2Element)
    playerElements.push(player2Element)
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
      playerBoardSelections: serverPlayerBoardSelections,
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
      serverPlayerPieceSelections,
      serverPlayerBoardSelections
    )

    // Update selection UIs
    updatePieceSelectionUI()
    updateBoardSelectionUI()
    updateStartButton()

    // If game started, switch to game page
    if (gameStarted) {
      switchToGamePage()
    }
  },
})
