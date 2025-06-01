import type { PlayerId, RuneClient } from "rune-sdk"

export type Cells = (PlayerId | null)[]
export interface GameState {
  cells: Cells
  winCombo: number[] | null
  lastMovePlayerId: PlayerId | null
  playerIds: PlayerId[]
  freeCells?: boolean
  boardType: number | null
  pieceType: number | null
  playerBoardSelections: Record<PlayerId, number | null>
  playerPieceSelections: Record<PlayerId, number | null>
  gameStarted: boolean
  playingWithBot?: boolean
  botTurn?: boolean
  botTurnAt?: number
}

type GameActions = {
  claimCell: (cellIndex: number) => void
  updateBoardSelection: (boardType: number | null) => void
  updatePieceSelection: (pieceType: number | null) => void
  startGame: (options: { boardType: number; pieceType: number }) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

function findWinningCombo(cells: Cells) {
  return (
    [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ].find((combo) =>
      combo.every((i) => cells[i] && cells[i] === cells[combo[0]])
    ) || null
  )
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 2,
  setup: (allPlayerIds) => ({
    cells: new Array(9).fill(null),
    winCombo: null,
    lastMovePlayerId: null,
    playerIds: allPlayerIds,
    boardType: null,
    pieceType: null,
    playerBoardSelections: {},
    playerPieceSelections: {},
    gameStarted: false,
    playingWithBot: allPlayerIds.length === 1,
    botTurn: false,
    botTurnAt: 0,
  }),
  actions: {
    claimCell: (cellIndex, { game, playerId, allPlayerIds }) => {
      if (
        game.cells[cellIndex] !== null ||
        playerId === game.lastMovePlayerId
      ) {
        throw Rune.invalidAction()
      }

      game.cells[cellIndex] = playerId
      game.lastMovePlayerId = playerId
      game.winCombo = findWinningCombo(game.cells)

      if (game.winCombo) {
        const [player1, player2] = allPlayerIds

        Rune.gameOver({
          players: {
            [player1]: game.lastMovePlayerId === player1 ? "WON" : "LOST",
            [player2]: game.lastMovePlayerId === player2 ? "WON" : "LOST",
          },
        })
      }

      game.freeCells = game.cells.findIndex((cell) => cell === null) !== -1

      if (!game.freeCells) {
        Rune.gameOver({
          players: {
            [game.playerIds[0]]: "LOST",
            [game.playerIds[1]]: "LOST",
          },
        })
      }
    },
    updateBoardSelection: (boardType, { game, playerId }) => {
      // Both players can select board, but only one board type for the entire game
      if (boardType === null) {
        // Player is deselecting - clear the global board type
        game.boardType = null
        game.playerBoardSelections = {}
      } else {
        // If the same board type is already selected, do nothing
        if (game.boardType === boardType) {
          return
        }

        // Set the new board type for the entire game
        game.boardType = boardType
        // Clear all previous selections and set this as the global selection
        game.playerBoardSelections = {}
        // Mark that this player made the selection (for UI feedback)
        game.playerBoardSelections[playerId] = boardType
      }
    },
    updatePieceSelection: (pieceType, { game, playerId }) => {
      // Both players can select pieces, but not the same one
      if (pieceType === null) {
        // Player is deselecting their choice
        delete game.playerPieceSelections[playerId]
      } else {
        // Check if another player has already selected this piece
        const otherPlayerHasThisPiece = Object.entries(
          game.playerPieceSelections
        ).some(
          ([otherPlayerId, selection]) =>
            otherPlayerId !== playerId && selection === pieceType
        )

        if (otherPlayerHasThisPiece) {
          throw Rune.invalidAction()
        }

        // Set the player's selection
        game.playerPieceSelections[playerId] = pieceType
      }

      // Update the global pieceType for backward compatibility
      // Use the first player's selection if available, otherwise the second player's
      const player1Selection = game.playerPieceSelections[game.playerIds[0]]
      const player2Selection = game.playerPieceSelections[game.playerIds[1]]

      if (player1Selection !== undefined) {
        game.pieceType = player1Selection
      } else if (player2Selection !== undefined) {
        game.pieceType = player2Selection
      } else {
        game.pieceType = null
      }
    },
    startGame: (options, { game, playerId }) => {
      // Any player can start the game
      if (!game.playerIds.includes(playerId)) {
        throw Rune.invalidAction()
      }

      // Validate conditions based on game mode
      if (game.playingWithBot) {
        // Single player mode: only need board type and single player piece selection
        if (
          game.boardType === null ||
          Object.keys(game.playerPieceSelections).length < 1
        ) {
          throw Rune.invalidAction()
        }
      } else {
        // Multiplayer mode: need board type and both players have selected pieces
        if (
          game.boardType === null ||
          Object.keys(game.playerPieceSelections).length < 2
        ) {
          throw Rune.invalidAction()
        }
      }

      // Set game configuration
      game.boardType = options.boardType
      game.pieceType = options.pieceType
      game.gameStarted = true
    },
  },
  events: {
    playerJoined: (playerId, { game }) => {
      // Add the new player to the players list
      game.playerIds.push(playerId)
      // Reset the playing with bot flag
      game.playingWithBot = false
      // Remove any bot player from the list
      game.playerIds = game.playerIds.filter((id) => id !== "bot")

      // If the game has started, update any cells that had bot as player
      if (game.gameStarted) {
        for (let i = 0; i < game.cells.length; i++) {
          if (game.cells[i] === "bot") {
            game.cells[i] = playerId
          }
        }
      }

      // Reset bot-related flags
      if (game.lastMovePlayerId !== playerId) {
        game.botTurn = false
        game.botTurnAt = 0
      }

      if (game.lastMovePlayerId === "bot") {
        game.lastMovePlayerId = playerId
      }
    },

    playerLeft: (playerId, { game }) => {
      // Remove the player from the list
      game.playerIds = game.playerIds.filter((id) => id !== playerId)

      // If there's still at least one player, set playing with bot
      if (game.playerIds.length > 0) {
        game.playingWithBot = true

        // Add a bot player
        game.playerIds.push("bot")

        // If the game has started, update any cells that had the leaving player
        if (game.gameStarted) {
          for (let i = 0; i < game.cells.length; i++) {
            if (game.cells[i] === playerId) {
              game.cells[i] = "bot"
            }
          }
        }

        // Set bot turn flags
        if (game.lastMovePlayerId !== playerId) {
          game.botTurnAt = Rune.gameTime() + 1500
          game.botTurn = true
        }

        // If it was the leaving player's turn, make it the bot's turn
        if (game.lastMovePlayerId === playerId) {
          game.lastMovePlayerId = "bot"
        }
      }
    },
  },
})
