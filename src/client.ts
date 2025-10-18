import "./styles.css"

import { Player, PlayerId } from "rune-sdk"
import { GameState, Cell } from "./logic"

import selectSoundAudio from "./assets/select.wav"
import robotImage from "./assets/robot.png"
import tigerMask from "./assets/tiger_mask.svg"
import goatMask from "./assets/goat_mask.svg"
import { Board, getNextBestMove } from "./min_max"

// DOM Elements
const playersSection = document.getElementById("playersSection")!
const startButton = document.getElementById("startButton")! as HTMLButtonElement
const boardTypes = document.getElementById("boardTypes")!
const pieceTypes = document.getElementById("pieceTypes")!
const configPage = document.getElementById("configPage")!
const gamePage = document.getElementById("gamePage")!
const boardTypeInfo = document.getElementById("boardTypeInfo")!
const pieceTypeInfo = document.getElementById("pieceTypeInfo")!

// Help modal elements
const questionMarkBtn = document.getElementById("question-mark")!
const modal = document.getElementById("myModal")!
const closeBtn = document.getElementsByClassName("close")[0]!

// Setup question mark button to show instructions
questionMarkBtn.addEventListener("click", () => {
  modal.style.display = modal.style.display === "block" ? "none" : "block"
})

// Setup close button
closeBtn.addEventListener("click", () => {
  modal.style.display = "none"
})

// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", (event) => {
  if (event.target == modal) {
    modal.style.display = "none"
  }
})

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
// Masks for tiger/goat overlays per cell
let cellMaskImages: SVGImageElement[] = []

// Bot-related state
let botMoveTimer: number | null = null
let pendingBotMove: number | null = null

// Piece mask SVGs (used as background overlays)
const pieceMasks = [tigerMask, goatMask]

// Board styling constants
// const BOARD_STROKE_COLOR = "#e6e6e6"
const BOARD_STROKE_COLOR = "#444444ff"
const BOARD_STROKE_WIDTH = 5
const BOARD_STROKE_WIDTH_THICK = 2

// Cell/Ellipse styling constants
const FILL_COLOR = "#ff6b35" // Orange color for clickable indication
// SVG xlink namespace
// const XLINK_NS = "http://www.w3.org/1999/xlink"

// Board-specific sizing constants
const BOARD_A_ELLIPSE_SIZE = "8" // Smaller for Board A's larger coordinate system
const BOARD_A_CELL_SIZE = "30"
const BOARD_B_ELLIPSE_SIZE = "5" // Larger for Board B's smaller coordinate system
const BOARD_B_CELL_SIZE = "15"

/**
 * Creates BoardA SVG (Triangle/Diamond pattern) dynamically
 * Based on boardA.svg structure
 */
function createBoardASVG(): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("viewBox", "0 -50 800 600")
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
  svg.setAttribute("type", "boardA")
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
  svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
  svg.setAttribute("type", "boardB")
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
  cells: Cell[],
  playerIds: string[]
) {
  // Clear existing cell images
  cellImages.forEach((img) => img.remove())
  cellImages = []

  // Determine board type based on viewBox to choose appropriate sizing
  const isBoardA = gameBoardSVG.getAttribute("type") === "boardA"

  // Use board-specific sizing
  const ellipseSize = isBoardA ? BOARD_A_ELLIPSE_SIZE : BOARD_B_ELLIPSE_SIZE
  const cellSize = isBoardA ? BOARD_A_CELL_SIZE : BOARD_B_CELL_SIZE

  // Create ellipses, avatar images, and mask overlays for each cell
  cellImages.forEach((img) => img.remove())
  cellMaskImages.forEach((img) => img.remove())
  cellImages = []
  cellMaskImages = []
  cells.forEach((_, index) => {
    const ellipse = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "ellipse"
    )
    ellipse.setAttribute("cx", cells[index].x.toString())
    ellipse.setAttribute("cy", cells[index].y.toString())
    ellipse.setAttribute("rx", ellipseSize)
    ellipse.setAttribute("ry", ellipseSize)
    ellipse.setAttribute("style", `fill: ${FILL_COLOR} `)

    // Create avatar image element
    const avatarImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    )

    // Position and size avatar image
    avatarImage.setAttribute("x", (cells[index].x - +cellSize).toString())
    avatarImage.setAttribute("y", (cells[index].y - +cellSize).toString())
    avatarImage.setAttribute("width", (+cellSize * 2).toString())
    avatarImage.setAttribute("height", (+cellSize * 2).toString())

    // Add click event listener for valid players
    if (yourPlayerId && playerIds.includes(yourPlayerId)) {
      avatarImage.addEventListener("click", () => {
        const fromBot = avatarImage.getAttribute("from-bot")
        Rune.actions.performCellAction({
          cellIndex: index,
          fromBot:
            fromBot === null ? false : fromBot === "false" ? false : true,
        })
      })
      avatarImage.style.cursor = "pointer"
    }

    // Append elements to SVG (mask as background, avatar on top)
    const parent = gameBoardSVG.querySelector("g") || gameBoardSVG
    parent.appendChild(ellipse)

    // Create mask background - larger size to show ears/features around the avatar
    const maskImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    )
    const maskSize = +cellSize * 3 // Make mask bigger than avatar
    maskImage.setAttribute("x", (cells[index].x - maskSize / 2).toString())
    maskImage.setAttribute("y", (cells[index].y - maskSize / 2).toString())
    maskImage.setAttribute("width", maskSize.toString())
    maskImage.setAttribute("height", maskSize.toString())
    maskImage.style.opacity = "0.8" // Make it slightly transparent
    parent.appendChild(maskImage)

    // Avatar goes on top, smaller than mask
    parent.appendChild(avatarImage)

    // Initialize sources to empty; updateCellImages will set them
    avatarImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "")
    maskImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "")
    // Store images for later updates
    cellImages.push(avatarImage)
    cellMaskImages.push(maskImage)
  })

  return cellImages
}

function updateCellImages(params: {
  game: {
    cells: Cell[]
    playerIds: string[]
    selectedCellIndex: number
    playerPieceSelections: Record<string, number | null>
  }
}) {
  const { cells, playerIds, selectedCellIndex, playerPieceSelections } =
    params.game

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

    // Show player avatar in the top layer (smaller, centered)
    if (cellValue !== null && playersInfo[cellValue]) {
      cellImage.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        playersInfo[cellValue].avatarUrl
      )
    } else {
      cellImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "")
    }

    // Show piece mask (tiger/goat) as background - larger to show ears/features
    if (cellMaskImages[index]) {
      if (cellValue !== null) {
        const pieceType = playerPieceSelections[cellValue] ?? 0
        const maskSrc = pieceMasks[pieceType]
        cellMaskImages[index].setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          maskSrc
        )
        // Make mask visible with transparency
        cellMaskImages[index].style.opacity = "0.7"
      } else {
        cellMaskImages[index].setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          ""
        )
        cellMaskImages[index].style.opacity = "0"
      }
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
 * Update game stats in the game info section
 */
function updateGameStats(game: GameState) {
  const { lastMovePlayerId, playerIds, piecesCount } = game

  // Determine whose turn it is
  let currentPlayerName = ""
  let currentPlayerAvatar = ""
  let currentPlayerId = ""

  if (lastMovePlayerId === null) {
    // Game just started, first player's turn
    currentPlayerId = playerIds[0]
  } else {
    // Next player's turn
    const currentIndex = playerIds.indexOf(lastMovePlayerId)
    const nextIndex = (currentIndex + 1) % playerIds.length
    currentPlayerId = playerIds[nextIndex]
  }

  // Get player name and avatar
  if (currentPlayerId === "bot") {
    currentPlayerName = "AI Bot"
    currentPlayerAvatar = robotImage
  } else {
    const playerInfo = Rune.getPlayerInfo(currentPlayerId)
    currentPlayerName = playerInfo?.displayName || "Unknown Player"
    currentPlayerAvatar = playerInfo?.avatarUrl || robotImage
  }

  // Update boardTypeInfo with turn indicator (including avatar)
  boardTypeInfo.innerHTML = `
    <div class="turn-indicator">
      <div>Turn</div>
      <img src="${currentPlayerAvatar}" alt="Player Avatar" class="turn-avatar" />
      <span>${currentPlayerName}</span>
    </div>
  `

  // Update pieceTypeInfo with game stats
  pieceTypeInfo.innerHTML = `
    <div class="game-stats">
      <div class="stats-numbers">
        <span>${piecesCount.goatsTakenCount}/${piecesCount.goatCount - piecesCount.goatsRemainingCount}/${piecesCount.goatCount}</span>
        <span id="divider"></span>
        <span>${piecesCount.tigerBlockedCount}/${piecesCount.tigerCount}</span>
      </div>
      <div class="stats-labels">
        <span>Goats</span>
        <span id="divider"></span>
        <span>Tigers</span>
      </div>
    </div>
  `

  // Dim the screen if it's not the current player's turn
  if (currentPlayerId !== yourPlayerId) {
    gamePage.classList.add("dimmed-turn")
  } else {
    gamePage.classList.remove("dimmed-turn")
  }
}

/**
 * Switch to game page
 */
function switchToGamePage(cells?: Cell[], playerIds: string[] = []) {
  configPage.classList.add("hidden")
  gamePage.classList.add("active")

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

/**
 * Convert game state to Board object for min-max algorithm
 */
function convertGameStateToBoard(gameState: GameState): Board {
  const board = new Board()

  // Determine which player ID is the bot
  const botPlayerId = "bot"
  const humanPlayerId = gameState.playerIds.find((id) => id !== botPlayerId)

  // Get piece assignments (0 = Tiger, 1 = Goat)
  const botPieceType = gameState.playerPieceSelections[botPlayerId] || 0
  const humanPieceType =
    gameState.playerPieceSelections[humanPlayerId || ""] || 1

  // Set board state based on cells
  for (let i = 0; i < gameState.cells.length; i++) {
    const cell = gameState.cells[i]
    if (cell.playerId === botPlayerId) {
      // Bot piece: 1 = Goat, 2 = Tiger in Board class
      board.board[i] = botPieceType === 0 ? 2 : 1
    } else if (cell.playerId && cell.playerId !== botPlayerId) {
      // Human piece: 1 = Goat, 2 = Tiger in Board class
      board.board[i] = humanPieceType === 0 ? 2 : 1
    } else {
      board.board[i] = 0 // Empty
    }
  }

  // Determine current player based on whose turn it is
  // If lastMovePlayerId is bot, then it's human's turn (and vice versa)
  // But we need to map this to the Board class player system (1 = Goat, 2 = Tiger)
  const isBotTurn = gameState.lastMovePlayerId !== botPlayerId

  if (isBotTurn) {
    // It's bot's turn - set current player to bot's piece type
    board.currentPlayer = botPieceType === 0 ? 2 : 1 // 2 = Tiger, 1 = Goat
  } else {
    // It's human's turn - set current player to human's piece type
    board.currentPlayer = humanPieceType === 0 ? 2 : 1 // 2 = Tiger, 1 = Goat
  }

  // Set counts based on game state
  board.goatsPlacedCount =
    gameState.piecesCount.goatCount - gameState.piecesCount.goatsRemainingCount
  board.goatsCapturedCount = gameState.piecesCount.goatsTakenCount
  board.selectedIndexToMove = gameState.selectedCellIndex

  // Determine next action based on game phase
  // selectToPlace is only for goat and during the placement phase
  if (
    board.goatsPlacedCount < board.totalGoatsToPlace &&
    board.currentPlayer === 1
  ) {
    board.nextAction = "selectToPlace"
  } else if (board.selectedIndexToMove === -1) {
    board.nextAction = "selectToMove"
  } else {
    board.nextAction = "selectDestination"
  }

  // Update possible movable pieces
  board.updatePossibleMovablePieces()

  return board
}

/**
 * Make the bot's move using the min-max algorithm
 */
function makeBotMove(game: GameState) {
  // Don't calculate moves from inside onChange - schedule for after current execution
  if (pendingBotMove !== null) return

  // Store the current game state for processing outside of onChange
  const currentGameState = JSON.parse(JSON.stringify(game))

  // Schedule the bot move outside of the current onChange execution
  pendingBotMove = window.setTimeout(() => {
    try {
      console.log("Bot is thinking about its move...")
      // If one tiger is selected and the player is trying to select another tiger then we should update the
      console.log("Game state for bot:", {
        lastMovePlayerId: currentGameState.lastMovePlayerId,
        playerPieceSelections: currentGameState.playerPieceSelections,
        playerIds: currentGameState.playerIds,
        botTurn: currentGameState.botTurn,
      })

      // Convert the game state to a Board object for the min-max algorithm
      const gameBoard = convertGameStateToBoard(currentGameState)
      console.log("Game board state prepared for bot:")
      console.log("Board current player:", gameBoard.currentPlayer)
      console.log("Board next action:", gameBoard.nextAction)

      // Get the best move using the min-max algorithm
      const bestMoveResult = getNextBestMove(gameBoard)
      const bestMove = bestMoveResult.action

      // Make the bot's move
      if (bestMove !== undefined && bestMove >= 0) {
        console.log("Bot is making move to position:", bestMove)

        Rune.actions.performCellAction({ cellIndex: bestMove, fromBot: true })
        console.log(
          "Move performed by bot to cell index:",
          bestMove,
          game.selectedCellIndex
        )
      } else {
        console.error("Bot failed to find a valid move")
      }
    } catch (error) {
      console.error("Error in bot move calculation:", error)
    } finally {
      // Clear pending state
      pendingBotMove = null
    }
  }, 50) // Short delay to ensure we're outside the onChange execution
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
      updateGameStats(game)

      // Dim the screen if not current player's turn
      let currentPlayerId = ""
      if (game.lastMovePlayerId === null) {
        currentPlayerId = game.playerIds[0]
      } else {
        const currentIndex = game.playerIds.indexOf(game.lastMovePlayerId)
        const nextIndex = (currentIndex + 1) % game.playerIds.length
        currentPlayerId = game.playerIds[nextIndex]
      }
      if (currentPlayerId !== yourPlayerId) {
        gamePage.classList.add("dimmed")
      } else {
        gamePage.classList.remove("dimmed")
      }
    }

    updateCellImages({ game })

    // Handle bot's moves on the client side
    if (
      game.gameStarted &&
      game.playingWithBot &&
      game.lastMovePlayerId !== "bot" &&
      game.botTurn
    ) {
      console.log("Bot should move - Game state:", {
        playingWithBot: game.playingWithBot,
        lastMovePlayerId: game.lastMovePlayerId,
        botTurn: game.botTurn,
        selectedCellIndex: game.selectedCellIndex,
        goatsRemaining: game.piecesCount.goatsRemainingCount,
      })

      // Clear any existing bot move timer
      if (botMoveTimer) {
        clearTimeout(botMoveTimer)
        botMoveTimer = null
      }

      // Determine if we're in placement phase or movement phase
      // const isPlacementPhase = game.piecesCount.goatsRemainingCount > 0
      // const isSelectionPhase =
      //   !isPlacementPhase && game.selectedCellIndex === -1
      // const isDestinationPhase =
      //   !isPlacementPhase && game.selectedCellIndex !== -1

      // Two-phase move: select piece then move it
      botMoveTimer = window.setTimeout(() => {
        console.log("Bot making two-phase move: Phase 1 - Select piece")
        makeBotMove(game)
        console.log("game selected cell index:", game.selectedCellIndex)
        // // Schedule phase 2 after a short delay
        // if (game.selectedCellIndex !== -1) {
        //   setTimeout(() => {
        //     console.log("Bot making two-phase move: Phase 2 - Move piece")
        //     makeBotMove(game)
        //     console.log("game selected cell index:", game.selectedCellIndex)
        //   }, 500)
        // }
      }, 1000)
    } else {
      console.log("Bot won't move due to conditions:", {
        gameStarted: game.gameStarted,
        playingWithBot: game.playingWithBot,
        lastMovePlayerId: game.lastMovePlayerId,
        botTurn: game.botTurn,
      })
    }
  },
})
