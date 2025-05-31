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
      // Only the first player can select the board type
      if (game.playerIds[0] !== playerId) {
        throw Rune.invalidAction()
      }

      game.boardType = boardType
    },
    updatePieceSelection: (pieceType, { game, playerId }) => {
      // Only the first player can select the piece type
      if (game.playerIds[0] !== playerId) {
        throw Rune.invalidAction()
      }

      game.pieceType = pieceType
    },
    startGame: (options, { game, playerId }) => {
      // Only the first player can start the game
      if (game.playerIds[0] !== playerId) {
        throw Rune.invalidAction()
      }

      // Validate that both board and piece types are selected
      if (options.boardType === null || options.pieceType === null) {
        throw Rune.invalidAction()
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
