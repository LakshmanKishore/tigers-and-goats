import "./styles.css"

import { PlayerId } from "rune-sdk"

import selectSoundAudio from "./assets/select.wav"
import tigerImage from "./assets/tiger.png"
import goatImage from "./assets/goat.png"
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
let playerElements: HTMLElement[] = []
let isYourTurn = false
let yourPlayerId: PlayerId | undefined

// Board and piece images
const boardImages = [
  "src/assets/board-type-1.png",
  "src/assets/board-type-2.png",
]
const pieceImages = ["src/assets/tiger.png", "src/assets/goat.png"]

/**
 * Updates the start button state
 */
function updateStartButton() {
  startButton.disabled =
    selectedBoardType === null || selectedPieceType === null || !isYourTurn
}

/**
 * Update game selection based on other player's choice
 */
function updateSelectionUI(boardType: number | null, pieceType: number | null) {
  // Update board selection UI
  if (boardType !== null) {
    const boardOptions = boardTypes.querySelectorAll(".board-option")
    boardOptions.forEach((option, index) => {
      if (index === boardType) {
        option.classList.add("selected")
      } else {
        option.classList.remove("selected")
      }

      // If it's not your turn, disable all options
      if (!isYourTurn) {
        option.classList.add("disabled")
      } else {
        option.classList.remove("disabled")
      }
    })
  }

  // Update piece selection UI
  if (pieceType !== null) {
    const pieceOptions = pieceTypes.querySelectorAll(".piece-option")
    pieceOptions.forEach((option, index) => {
      if (index === pieceType) {
        option.classList.add("selected")
      } else {
        option.classList.remove("selected")
      }

      // If it's not your turn, disable all options
      if (!isYourTurn) {
        option.classList.add("disabled")
      } else {
        option.classList.remove("disabled")
      }
    })
  }

  updateStartButton()
}

/**
 * Switch to game page
 */
function switchToGamePage() {
  configPage.classList.add("hidden")
  gamePage.classList.add("active")

  // Update game info section with selected configuration
  if (selectedBoardType !== null) {
    boardTypeInfo.innerHTML = `
      <img src="${boardImages[selectedBoardType]}" alt="Board Type" />
      <span>Board ${selectedBoardType + 1}</span>
    `
  }

  if (selectedPieceType !== null) {
    pieceTypeInfo.innerHTML = `
      <img src="${pieceImages[selectedPieceType]}" alt="Piece Type" />
      <span>${selectedPieceType === 0 ? "Tiger" : "Goat"}</span>
    `
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
  pieceType: number | null = null
) {
  // Save your player ID
  yourPlayerId = myPlayerId

  // Check if it's your turn (first player gets to choose)
  isYourTurn = playerIds.length > 0 && playerIds[0] === myPlayerId

  // Update saved selections
  selectedBoardType = boardType
  selectedPieceType = pieceType

  // If game started, switch to game page
  if (gameStarted) {
    switchToGamePage()
    return
  }

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

  // Setup board type selection
  const boardOptions = boardTypes.querySelectorAll(".board-option")
  boardOptions.forEach((option, index) => {
    // Remove old event listeners by cloning and replacing
    const newOption = option.cloneNode(true) as HTMLElement
    option.parentNode?.replaceChild(newOption, option)

    if (selectedBoardType === index) {
      newOption.classList.add("selected")
    }

    if (!isYourTurn) {
      newOption.classList.add("disabled")
    } else {
      newOption.addEventListener("click", () => {
        if (selectedBoardType === index) {
          // Deselect if already selected
          selectedBoardType = null
          newOption.classList.remove("selected")
        } else {
          // Select new option
          boardOptions.forEach((opt) => opt.classList.remove("selected"))
          newOption.classList.add("selected")
          selectedBoardType = index
        }

        // Send selection to server
        Rune.actions.updateBoardSelection(selectedBoardType)
        updateStartButton()
        selectSound.play()
      })
    }
  })

  // Setup piece type selection
  const pieceOptions = pieceTypes.querySelectorAll(".piece-option")
  pieceOptions.forEach((option, index) => {
    // Remove old event listeners by cloning and replacing
    const newOption = option.cloneNode(true) as HTMLElement
    option.parentNode?.replaceChild(newOption, option)

    if (selectedPieceType === index) {
      newOption.classList.add("selected")
    }

    if (!isYourTurn) {
      newOption.classList.add("disabled")
    } else {
      newOption.addEventListener("click", () => {
        if (selectedPieceType === index) {
          // Deselect if already selected
          selectedPieceType = null
          newOption.classList.remove("selected")
        } else {
          // Select new option
          pieceOptions.forEach((opt) => opt.classList.remove("selected"))
          newOption.classList.add("selected")
          selectedPieceType = index
        }

        // Send selection to server
        Rune.actions.updatePieceSelection(selectedPieceType)
        updateStartButton()
        selectSound.play()
      })
    }
  })

  // Setup start button
  startButton.removeEventListener("click", startButtonHandler)
  startButton.addEventListener("click", startButtonHandler)

  updateStartButton()
}

/**
 * Start button click handler
 */
function startButtonHandler() {
  if (selectedBoardType !== null && selectedPieceType !== null) {
    // Send start game action
    Rune.actions.startGame({
      boardType: selectedBoardType,
      pieceType: selectedPieceType,
    })
    selectSound.play()
  }
}

// Initialize the Rune client
Rune.initClient({
  onChange: ({ game, yourPlayerId, action }) => {
    // Handle game state changes
    const { playerIds, boardType, pieceType, gameStarted } = game

    // Initialize or update UI
    initUI(playerIds, yourPlayerId, gameStarted, boardType, pieceType)

    // If not your turn but there are selections, update the UI to reflect other player's choices
    if (!isYourTurn && (boardType !== null || pieceType !== null)) {
      updateSelectionUI(boardType, pieceType)
    }

    // If game started, switch to game page
    if (gameStarted) {
      switchToGamePage()
    }
  },
})
