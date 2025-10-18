import type { PlayerId, RuneClient } from "rune-sdk"

export interface Cell {
  x: number
  y: number
  playerId: PlayerId | null
  reachableCellIndexes: number[]
  tigerJumpableIndexes: number[]
  goatRemovalAfterTigerJumpIndexes: number[]
}
export interface PiecesCount {
  goatCount: 15 | 20
  tigerCount: 3 | 4
  tigerBlockedCount: number
  goatsTakenCount: number
  goatsRemainingCount: number
}

export type Cells = Cell[]
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
  botTurn: boolean
  botTurnAt: number
  selectedCellIndex: number
  piecesCount: PiecesCount
  winner: PlayerId | null
}

type GameActions = {
  performCellAction: (params: { cellIndex: number; fromBot: boolean }) => void
  updateBoardSelection: (boardType: number | null) => void
  updatePieceSelection: (pieceType: number | null) => void
  startGame: (options: { boardType: number; pieceType: number }) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

// Board A - 23 intersection points (0-22)
const cellsForBoardA: Cell[] = [
  // Top (y=0)
  {
    x: 400,
    y: 0,
    playerId: null,
    reachableCellIndexes: [2, 3, 4, 5],
    tigerJumpableIndexes: [8, 9, 10, 11],
    goatRemovalAfterTigerJumpIndexes: [2, 3, 4, 5],
  }, // 0

  // Second row (y=200)
  {
    x: 100,
    y: 200,
    playerId: null,
    reachableCellIndexes: [2, 7],
    tigerJumpableIndexes: [3, 13],
    goatRemovalAfterTigerJumpIndexes: [2, 7],
  }, // 1
  {
    x: 290,
    y: 200,
    playerId: null,
    reachableCellIndexes: [0, 1, 3, 8],
    tigerJumpableIndexes: [4, 14],
    goatRemovalAfterTigerJumpIndexes: [3, 8],
  }, // 2
  {
    x: 360,
    y: 200,
    playerId: null,
    reachableCellIndexes: [0, 2, 4, 9],
    tigerJumpableIndexes: [1, 5, 15],
    goatRemovalAfterTigerJumpIndexes: [2, 4, 9],
  }, // 3
  {
    x: 440,
    y: 200,
    playerId: null,
    reachableCellIndexes: [0, 3, 5, 10],
    tigerJumpableIndexes: [2, 6, 16],
    goatRemovalAfterTigerJumpIndexes: [3, 5, 10],
  }, // 4
  {
    x: 510,
    y: 200,
    playerId: null,
    reachableCellIndexes: [0, 4, 6, 11],
    tigerJumpableIndexes: [3, 17],
    goatRemovalAfterTigerJumpIndexes: [4, 11],
  }, // 5
  {
    x: 700,
    y: 200,
    playerId: null,
    reachableCellIndexes: [5, 12],
    tigerJumpableIndexes: [4, 18],
    goatRemovalAfterTigerJumpIndexes: [5, 12],
  }, // 6

  // Middle row (y=300)
  {
    x: 100,
    y: 300,
    playerId: null,
    reachableCellIndexes: [1, 8, 13],
    tigerJumpableIndexes: [9],
    goatRemovalAfterTigerJumpIndexes: [8],
  }, // 7
  {
    x: 235,
    y: 300,
    playerId: null,
    reachableCellIndexes: [2, 7, 9, 14],
    tigerJumpableIndexes: [0, 10, 19],
    goatRemovalAfterTigerJumpIndexes: [2, 9, 14],
  }, // 8
  {
    x: 340,
    y: 300,
    playerId: null,
    reachableCellIndexes: [3, 8, 10, 15],
    tigerJumpableIndexes: [0, 7, 11, 20],
    goatRemovalAfterTigerJumpIndexes: [3, 8, 10, 15],
  }, // 9
  {
    x: 460,
    y: 300,
    playerId: null,
    reachableCellIndexes: [4, 9, 11, 16],
    tigerJumpableIndexes: [0, 8, 12, 21],
    goatRemovalAfterTigerJumpIndexes: [4, 9, 11, 16],
  }, // 10
  {
    x: 565,
    y: 300,
    playerId: null,
    reachableCellIndexes: [5, 10, 12, 17],
    tigerJumpableIndexes: [0, 9, 22],
    goatRemovalAfterTigerJumpIndexes: [5, 10, 17],
  }, // 11
  {
    x: 700,
    y: 300,
    playerId: null,
    reachableCellIndexes: [6, 11, 18],
    tigerJumpableIndexes: [10],
    goatRemovalAfterTigerJumpIndexes: [11],
  }, // 12

  // Fourth row (y=400)
  {
    x: 100,
    y: 400,
    playerId: null,
    reachableCellIndexes: [7, 14],
    tigerJumpableIndexes: [1, 15],
    goatRemovalAfterTigerJumpIndexes: [7, 14],
  }, // 13
  {
    x: 180,
    y: 400,
    playerId: null,
    reachableCellIndexes: [8, 13, 15, 19],
    tigerJumpableIndexes: [2, 16],
    goatRemovalAfterTigerJumpIndexes: [8, 15],
  }, // 14
  {
    x: 320,
    y: 400,
    playerId: null,
    reachableCellIndexes: [9, 14, 16, 20],
    tigerJumpableIndexes: [3, 13, 17],
    goatRemovalAfterTigerJumpIndexes: [9, 14, 16],
  }, // 15
  {
    x: 480,
    y: 400,
    playerId: null,
    reachableCellIndexes: [10, 15, 17, 21],
    tigerJumpableIndexes: [4, 14, 18],
    goatRemovalAfterTigerJumpIndexes: [10, 15, 17],
  }, // 16
  {
    x: 620,
    y: 400,
    playerId: null,
    reachableCellIndexes: [11, 16, 18, 22],
    tigerJumpableIndexes: [5, 15],
    goatRemovalAfterTigerJumpIndexes: [11, 16],
  }, // 17
  {
    x: 700,
    y: 400,
    playerId: null,
    reachableCellIndexes: [12, 17],
    tigerJumpableIndexes: [6, 16],
    goatRemovalAfterTigerJumpIndexes: [12, 17],
  }, // 18

  // Bottom row (y=500)
  {
    x: 125,
    y: 500,
    playerId: null,
    reachableCellIndexes: [14, 20],
    tigerJumpableIndexes: [8, 21],
    goatRemovalAfterTigerJumpIndexes: [14, 20],
  }, // 19
  {
    x: 300,
    y: 500,
    playerId: null,
    reachableCellIndexes: [15, 19, 21],
    tigerJumpableIndexes: [9, 22],
    goatRemovalAfterTigerJumpIndexes: [15, 21],
  }, // 20
  {
    x: 500,
    y: 500,
    playerId: null,
    reachableCellIndexes: [16, 20, 22],
    tigerJumpableIndexes: [10, 19],
    goatRemovalAfterTigerJumpIndexes: [16, 20],
  }, // 21
  {
    x: 675,
    y: 500,
    playerId: null,
    reachableCellIndexes: [17, 21],
    tigerJumpableIndexes: [11, 20],
    goatRemovalAfterTigerJumpIndexes: [17, 21],
  }, // 22
]

// Board B - 25 intersection points (0-24)
const cellsForBoardB: Cell[] = [
  // Top row (5 points)
  {
    x: 0,
    y: 0,
    playerId: null,
    reachableCellIndexes: [1, 5, 6],
    tigerJumpableIndexes: [2, 10, 12],
    goatRemovalAfterTigerJumpIndexes: [1, 5, 6],
  }, // 0
  {
    x: 60,
    y: 0,
    playerId: null,
    reachableCellIndexes: [0, 2, 6],
    tigerJumpableIndexes: [3, 11],
    goatRemovalAfterTigerJumpIndexes: [2, 6],
  }, // 1
  {
    x: 120,
    y: 0,
    playerId: null,
    reachableCellIndexes: [1, 3, 7],
    tigerJumpableIndexes: [0, 4, 12],
    goatRemovalAfterTigerJumpIndexes: [1, 3, 7],
  }, // 2
  {
    x: 180,
    y: 0,
    playerId: null,
    reachableCellIndexes: [2, 4, 8],
    tigerJumpableIndexes: [1, 13],
    goatRemovalAfterTigerJumpIndexes: [2, 8],
  }, // 3
  {
    x: 240,
    y: 0,
    playerId: null,
    reachableCellIndexes: [3, 9],
    tigerJumpableIndexes: [2, 14],
    goatRemovalAfterTigerJumpIndexes: [3, 9],
  }, // 4

  // Second row (5 points)
  {
    x: 0,
    y: 60,
    playerId: null,
    reachableCellIndexes: [0, 6, 10],
    tigerJumpableIndexes: [7, 15],
    goatRemovalAfterTigerJumpIndexes: [6, 10],
  }, // 5
  {
    x: 60,
    y: 60,
    playerId: null,
    reachableCellIndexes: [0, 1, 2, 5, 7, 10, 11, 12],
    tigerJumpableIndexes: [8, 16, 18],
    goatRemovalAfterTigerJumpIndexes: [7, 11, 12],
  }, // 6
  {
    x: 120,
    y: 60,
    playerId: null,
    reachableCellIndexes: [2, 6, 8, 12],
    tigerJumpableIndexes: [5, 9, 17],
    goatRemovalAfterTigerJumpIndexes: [6, 8, 12],
  }, // 7
  {
    x: 180,
    y: 60,
    playerId: null,
    reachableCellIndexes: [2, 3, 4, 7, 9, 12, 13, 14],
    tigerJumpableIndexes: [6, 18],
    goatRemovalAfterTigerJumpIndexes: [7, 13],
  }, // 8
  {
    x: 240,
    y: 60,
    playerId: null,
    reachableCellIndexes: [4, 8, 14],
    tigerJumpableIndexes: [7, 19],
    goatRemovalAfterTigerJumpIndexes: [8, 14],
  }, // 9

  // Third row (5 points)
  {
    x: 0,
    y: 120,
    playerId: null,
    reachableCellIndexes: [5, 6, 11, 15, 16],
    tigerJumpableIndexes: [0, 2, 12, 20, 22],
    goatRemovalAfterTigerJumpIndexes: [5, 6, 11, 15, 16],
  }, // 10
  {
    x: 60,
    y: 120,
    playerId: null,
    reachableCellIndexes: [6, 10, 12, 16],
    tigerJumpableIndexes: [1, 13, 21],
    goatRemovalAfterTigerJumpIndexes: [6, 12, 16],
  }, // 11
  {
    x: 120,
    y: 120,
    playerId: null,
    reachableCellIndexes: [6, 7, 8, 11, 13, 16, 17, 18],
    tigerJumpableIndexes: [0, 2, 4, 10, 14, 20, 22, 24],
    goatRemovalAfterTigerJumpIndexes: [6, 7, 8, 11, 13, 16, 17, 18],
  }, // 12
  {
    x: 180,
    y: 120,
    playerId: null,
    reachableCellIndexes: [8, 12, 14, 18],
    tigerJumpableIndexes: [3, 11, 23],
    goatRemovalAfterTigerJumpIndexes: [8, 12, 18],
  }, // 13
  {
    x: 240,
    y: 120,
    playerId: null,
    reachableCellIndexes: [8, 9, 13, 18, 19],
    tigerJumpableIndexes: [2, 4, 12, 22, 24],
    goatRemovalAfterTigerJumpIndexes: [8, 9, 13, 18, 19],
  }, // 14

  // Fourth row (5 points)
  {
    x: 0,
    y: 180,
    playerId: null,
    reachableCellIndexes: [10, 16, 20],
    tigerJumpableIndexes: [5, 17],
    goatRemovalAfterTigerJumpIndexes: [10, 16],
  }, // 15
  {
    x: 60,
    y: 180,
    playerId: null,
    reachableCellIndexes: [10, 11, 12, 15, 17, 20, 21, 22],
    tigerJumpableIndexes: [6, 8, 18],
    goatRemovalAfterTigerJumpIndexes: [11, 12, 17],
  }, // 16
  {
    x: 120,
    y: 180,
    playerId: null,
    reachableCellIndexes: [12, 16, 18, 22],
    tigerJumpableIndexes: [7, 15, 19],
    goatRemovalAfterTigerJumpIndexes: [12, 16, 18],
  }, // 17
  {
    x: 180,
    y: 180,
    playerId: null,
    reachableCellIndexes: [12, 13, 14, 17, 19, 22, 23, 24],
    tigerJumpableIndexes: [6, 8, 16],
    goatRemovalAfterTigerJumpIndexes: [12, 13, 17],
  }, // 18
  {
    x: 240,
    y: 180,
    playerId: null,
    reachableCellIndexes: [14, 18, 24],
    tigerJumpableIndexes: [9, 17],
    goatRemovalAfterTigerJumpIndexes: [14, 18],
  }, // 19

  // Bottom row (5 points)
  {
    x: 0,
    y: 240,
    playerId: null,
    reachableCellIndexes: [15, 16, 21],
    tigerJumpableIndexes: [10, 12, 22],
    goatRemovalAfterTigerJumpIndexes: [15, 16, 21],
  }, // 20
  {
    x: 60,
    y: 240,
    playerId: null,
    reachableCellIndexes: [16, 20, 22],
    tigerJumpableIndexes: [11, 23],
    goatRemovalAfterTigerJumpIndexes: [16, 22],
  }, // 21
  {
    x: 120,
    y: 240,
    playerId: null,
    reachableCellIndexes: [16, 17, 18, 21, 23],
    tigerJumpableIndexes: [10, 12, 14],
    goatRemovalAfterTigerJumpIndexes: [16, 17, 18],
  }, // 22
  {
    x: 180,
    y: 240,
    playerId: null,
    reachableCellIndexes: [18, 22, 24],
    tigerJumpableIndexes: [13, 21],
    goatRemovalAfterTigerJumpIndexes: [18, 22],
  }, // 23
  {
    x: 240,
    y: 240,
    playerId: null,
    reachableCellIndexes: [18, 19, 23],
    tigerJumpableIndexes: [12, 14, 22],
    goatRemovalAfterTigerJumpIndexes: [18, 19, 23],
  }, // 24
]

// function findWinningCombo(cells: Cells) {
//   return (
//     [
//       [0, 1, 2],
//       [3, 4, 5],
//       [6, 7, 8],
//       [0, 3, 6],
//       [1, 4, 7],
//       [2, 5, 8],
//       [0, 4, 8],
//       [2, 4, 6],
//     ].find((combo) =>
//       combo.every(
//         (i) =>
//           cells[i]?.playerId && cells[i].playerId === cells[combo[0]].playerId
//       )
//     ) || null
//   )
// }

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 2,
  setup: (allPlayerIds) => ({
    cells: [...cellsForBoardA], // Default to board A, will be updated when game starts
    winCombo: null,
    lastMovePlayerId: null,
    playerIds: allPlayerIds,
    boardType: null,
    pieceType: null,
    playerBoardSelections: {},
    // Here 0 -> Tiger and 1 is for Goat
    playerPieceSelections: {},
    gameStarted: false,
    playingWithBot: allPlayerIds.length === 1,
    botTurn: false,
    botTurnAt: 0,
    selectedCellIndex: -1,
    piecesCount: {
      goatCount: 15,
      tigerCount: 3,
      tigerBlockedCount: 0,
      goatsTakenCount: 0,
      goatsRemainingCount: 0,
    },
    winner: null,
  }),
  actions: {
    performCellAction: (
      params: { cellIndex: number; fromBot: boolean },
      { game, playerId /*, allPlayerIds*/ }
    ) => {
      const cellIndex = params.cellIndex
      const fromBot = params.fromBot
      const singlePlayerId = playerId

      // If this action is coming from the bot but the bot has been replaced
      // (for example a human joined and took the bot slot), ignore the
      // stale bot action. This prevents old/queued bot moves from applying
      // after a replacement and creating invalid piece counts.
      if (fromBot && !game.playerIds.includes("bot")) {
        return
      }

      playerId = fromBot ? "bot" : playerId

      // if (
      //   game.lastMovePlayerId === playerId ||
      //   !game.playerIds.includes(playerId)
      // ) {
      //   return
      // }

      // Update the player id to bot if it's bot's turn
      // if (game.playingWithBot && game.botTurn) {
      //   playerId = "bot"
      // }

      // Check if the click is coming from the lastMovePlayerId
      if (game.lastMovePlayerId && game.lastMovePlayerId === playerId) {
        // Allow if it's bots turn
        if (game.playingWithBot && game.botTurn) {
          // Allow the bot to perform the action
        } else {
          // Don't take the click if it's not the player's turn
          console.log("It's not your turn.")
          return
        }
      }

      // Whenever it's tigers turn, then the player should only click on the existing cell and not on the empty cell.
      if (
        game.playerPieceSelections[playerId] === 0 &&
        game.cells[cellIndex].playerId !== playerId &&
        game.selectedCellIndex === -1
      ) {
        // return and don't take that click
        console.log("Tiger clicked on the empty cell while selecting")
        return
      }

      if (
        game.playerPieceSelections[playerId] === 1 &&
        game.cells[cellIndex].playerId !== playerId &&
        game.selectedCellIndex === -1 &&
        game.piecesCount.goatsRemainingCount === 0
      ) {
        // return and don't take that click
        console.log("Goat clicked on the empty cell while selecting")
        return
      }

      // If there are no goats to place then if the player has clicked on the empty cell then just return
      if (game.playerPieceSelections[playerId] === 1) {
        if (
          game.piecesCount.goatsRemainingCount === 0 &&
          game.cells[cellIndex].playerId === null &&
          game.selectedCellIndex === -1
        ) {
          console.log("Goat clicked on the empty cell")
          return
        }
        // If the goat has clicked on the non null cell when the goats are remaining then just return
        if (
          game.cells[cellIndex].playerId !== null &&
          game.piecesCount.goatsRemainingCount > 0
        ) {
          console.log("Goat clicked on the non-null cell")
          return
        }
      }

      // If it's tigers move and there was a selected tiger, but want to select another tiger
      if (
        game.selectedCellIndex !== -1 &&
        game.playerPieceSelections[playerId] === 0 &&
        cellIndex !== game.selectedCellIndex &&
        game.cells[cellIndex].playerId === playerId
      ) {
        // If one tiger is selected and the player is trying to select another tiger then we should update the selectedCellIndex
        game.selectedCellIndex = cellIndex
        console.log(
          "Tiger player selected another tiger, updating the selectedCellIndex"
        )
      } else if (
        game.selectedCellIndex !== -1 &&
        game.playerPieceSelections[playerId] === 1 &&
        cellIndex !== game.selectedCellIndex &&
        game.cells[cellIndex].playerId === playerId
      ) {
        // If all the goats have been placed and its goats turn and there was a selected goat, but want to select another goat
        game.selectedCellIndex = cellIndex
        console.log(
          "Goat player selected another goat, updating the selectedCellIndex"
        )
      } else if (game.selectedCellIndex !== -1) {
        // Before performing the move based on the reachable Cell indexes and tiger jumpable indexes
        const selectedCell = game.cells[game.selectedCellIndex]

        // Check for the tiger's move
        if (game.playerPieceSelections[playerId] === 0) {
          // Check if the tiger is moving in jumpable cell index
          if (selectedCell.tigerJumpableIndexes.includes(cellIndex)) {
            // Verify if the middle cell is occupied by a goat
            const tigerJumpableCellIndex =
              selectedCell.tigerJumpableIndexes.indexOf(cellIndex)
            // Check if the tigerJumpable cell index is empty
            if (game.cells[cellIndex].playerId !== null) {
              console.log("Tiger clicked on the non-empty cell while jumping")
              return
            }
            const goatRemovalIndex =
              selectedCell.goatRemovalAfterTigerJumpIndexes[
                tigerJumpableCellIndex
              ]
            // Check if the goat is present in the middle cell
            if (
              game.cells[goatRemovalIndex].playerId === playerId ||
              game.cells[goatRemovalIndex].playerId === null
            ) {
              console.log("Tiger cannot jump over its own tiger or empty cell")
              return
            }
            game.cells[goatRemovalIndex].playerId = null
            game.piecesCount.goatsTakenCount += 1
          } else if (selectedCell.reachableCellIndexes.includes(cellIndex)) {
            // Check if the cellIndex is empty
            if (game.cells[cellIndex].playerId !== null) {
              console.log("Tiger clicked on the non-empty cell")
              return
            }
          } else {
            // If the tiger is moving in non reachable cell index
            console.log("Tiger clicked on the non-reachable cell")
            return
          }
        } else {
          // Check if the goat is moving in reachable cell index
          if (!selectedCell.reachableCellIndexes.includes(cellIndex)) {
            console.log("Goat clicked on the non-reachable cell")
            return
          }
        }
        // During this time the current cell should be moved to another cell
        game.cells[cellIndex].playerId = selectedCell.playerId
        game.cells[game.selectedCellIndex].playerId = null

        // Reset the selected cell index after moving
        game.selectedCellIndex = -1
      } else {
        // Update selected cell index for tiger moves and only when all the goats are placed
        if (
          (game.playerPieceSelections[playerId] === 1 &&
            game.piecesCount.goatsRemainingCount === 0) ||
          game.playerPieceSelections[playerId] === 0
        ) {
          game.selectedCellIndex = cellIndex
        }
      }

      if (game.piecesCount.goatsRemainingCount > 0) {
        game.cells[cellIndex].playerId = playerId
      }
      // If it's goats turn then reduce the goats remaining count
      if (
        game.playerPieceSelections[playerId] === 1 &&
        game.piecesCount.goatsRemainingCount > 0
      ) {
        game.piecesCount.goatsRemainingCount -= 1
      }

      // game.winCombo = findWinningCombo(game.cells)

      // Update the last move player id only when the opponent turn has completed
      // if (game.selectedCellIndex === -1) {
      //   game.lastMovePlayerId = playerId
      // }
      if (game.playerPieceSelections[playerId] === 0) {
        if (game.selectedCellIndex === -1) {
          game.lastMovePlayerId = fromBot ? playerId : singlePlayerId
        }
      } else if (game.playerPieceSelections[playerId] === 1) {
        if (
          game.piecesCount.goatsRemainingCount === 0 &&
          game.selectedCellIndex === -1
        ) {
          // If the goats are placed and it's the goat's turn then update the last move player id
          game.lastMovePlayerId = fromBot ? playerId : singlePlayerId
        } else if (game.piecesCount.goatsRemainingCount > 0) {
          // If the goats are not placed then update the last move player id
          game.lastMovePlayerId = fromBot ? playerId : singlePlayerId
        }
      }

      // Update tigerBlockedCount
      const tigerPlayerId = Object.keys(game.playerPieceSelections).find(
        (id) => game.playerPieceSelections[id] === 0
      )
      if (tigerPlayerId) {
        let blockedTigers = 0
        game.cells.forEach((cell) => {
          if (cell.playerId === tigerPlayerId) {
            // Check if this tiger can move
            let canMove = false

            // Check reachable cells
            for (const reachableIndex of cell.reachableCellIndexes) {
              if (game.cells[reachableIndex].playerId === null) {
                canMove = true
                break
              }
            }

            // If not, check jumpable cells
            if (!canMove) {
              for (let i = 0; i < cell.tigerJumpableIndexes.length; i++) {
                const jumpIndex = cell.tigerJumpableIndexes[i]
                const removalIndex = cell.goatRemovalAfterTigerJumpIndexes[i]
                if (
                  game.cells[jumpIndex].playerId === null &&
                  game.cells[removalIndex].playerId !== null &&
                  game.cells[removalIndex].playerId !== tigerPlayerId
                ) {
                  canMove = true
                  break
                }
              }
            }

            if (!canMove) {
              blockedTigers++
            }
          }
        })
        game.piecesCount.tigerBlockedCount = blockedTigers
      }

      // Check for game over conditions
      if (game.piecesCount.goatsTakenCount === game.piecesCount.goatCount) {
        // Tigers win
        game.winner = tigerPlayerId!
      } else if (
        game.piecesCount.tigerBlockedCount === game.piecesCount.tigerCount
      ) {
        // Goats win
        const goatPlayerId = Object.keys(game.playerPieceSelections).find(
          (id) => game.playerPieceSelections[id] === 1
        )
        game.winner = goatPlayerId!
      }

      if (game.winner) {
        const finalPlayerStatuses: Record<PlayerId, "WON" | "LOST"> = {}
        const humanPlayers = game.playerIds.filter((id) => id !== "bot")
        humanPlayers.forEach((id) => {
          if (id === game.winner) {
            finalPlayerStatuses[id] = "WON"
          } else {
            finalPlayerStatuses[id] = "LOST"
          }
        })
        Rune.gameOver({
          players: finalPlayerStatuses,
          delayPopUp: false,
        })
      }

      // if (game.winCombo) {
      //   const [player1, player2] = allPlayerIds

      //   Rune.gameOver({
      //     players: {
      //       [player1]: game.lastMovePlayerId === player1 ? "WON" : "LOST",
      //       [player2]: game.lastMovePlayerId === player2 ? "WON" : "LOST",
      //     },
      //   })
      // }

      // game.freeCells =
      //   game.cells.findIndex((cell) => cell.playerId === null) !== -1

      // if (!game.freeCells) {
      //   Rune.gameOver({
      //     players: {
      //       [game.playerIds[0]]: "LOST",
      //       [game.playerIds[1]]: "LOST",
      //     },
      //   })
      // }
      if (game.lastMovePlayerId === "bot" && game.selectedCellIndex !== -1) {
        return
      }

      if (!game.playingWithBot) return

      // Set the bot turn to true
      game.botTurn = true
      game.botTurnAt = Rune.gameTime() + 1000
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
        // Here 0 -> Tiger and 1 is for Goat
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

      // If it's playing with bot then the bot player should have a piece selection
      if (game.playingWithBot) {
        if (
          !game.playerPieceSelections["bot"] ||
          game.playerPieceSelections["bot"] === null
        ) {
          // Set the opposite piece type for the bot
          const otherPlayerSelection = game.playerPieceSelections[playerId]
          game.playerPieceSelections["bot"] = otherPlayerSelection === 0 ? 1 : 0
        }
        // And change the bot turn to true if the player has selected tiger to play
        if (game.playerPieceSelections["bot"] === 1) {
          game.botTurn = true
          game.botTurnAt = Rune.gameTime() + 1500
        }
      }

      // Set game configuration
      game.boardType = options.boardType
      game.pieceType = options.pieceType

      // Set the appropriate board cells based on board type
      if (options.boardType === 0) {
        game.cells = [...cellsForBoardA]
      } else {
        game.cells = [...cellsForBoardB]
      }

      game.gameStarted = true
      // Update the goats count and the tiger count
      game.piecesCount.goatCount = game.boardType === 0 ? 15 : 20
      game.piecesCount.tigerCount = game.boardType === 0 ? 3 : 4
      game.piecesCount.goatsRemainingCount = game.piecesCount.goatCount

      const tigerPlayerId =
        Object.keys(game.playerPieceSelections).find(
          (playerId) => game.playerPieceSelections[playerId] === 0
        ) || null

      game.lastMovePlayerId = tigerPlayerId

      // Once the game is started, the tigers will be placed first
      if (game.boardType == 0) {
        game.cells[0] = { ...game.cells[0], playerId: tigerPlayerId }
        game.cells[3] = { ...game.cells[3], playerId: tigerPlayerId }
        game.cells[4] = { ...game.cells[4], playerId: tigerPlayerId }
      } else if (game.boardType == 1) {
        game.cells[0] = { ...game.cells[0], playerId: tigerPlayerId }
        game.cells[4] = { ...game.cells[4], playerId: tigerPlayerId }
        game.cells[20] = { ...game.cells[20], playerId: tigerPlayerId }
        game.cells[24] = { ...game.cells[24], playerId: tigerPlayerId }
      }
    },
  },
  events: {
    playerJoined: (playerId, { game }) => {
      // If a bot is currently playing, replace it with the new player
      const botIndex = game.playerIds.indexOf("bot")
      if (botIndex !== -1) {
        // Transfer bot's selections to the new player
        if (game.playerPieceSelections["bot"] !== undefined) {
          game.playerPieceSelections[playerId] =
            game.playerPieceSelections["bot"]
          delete game.playerPieceSelections["bot"]
        }
        if (game.playerBoardSelections["bot"] !== undefined) {
          game.playerBoardSelections[playerId] =
            game.playerBoardSelections["bot"]
          delete game.playerBoardSelections["bot"]
        }

        // Replace bot in playerIds
        game.playerIds[botIndex] = playerId

        // Reset game state to prevent inconsistencies
        game.selectedCellIndex = -1
        game.botTurn = false
        game.botTurnAt = 0

        // Transfer cells from bot to new player
        if (game.gameStarted) {
          for (let i = 0; i < game.cells.length; i++) {
            if (game.cells[i].playerId === "bot") {
              game.cells[i].playerId = playerId
            }
          }
        }

        // Handle turn transfer
        if (game.lastMovePlayerId === "bot") {
          // Bot just moved, so next turn should be the player after bot, which is now the new player
          game.lastMovePlayerId = playerId
        } else if (game.botTurn) {
          // Bot was about to move, so set turn to new player
          const botIndex = game.playerIds.indexOf(playerId) // since we replaced
          const prevIndex =
            botIndex === 0 ? game.playerIds.length - 1 : botIndex - 1
          game.lastMovePlayerId = game.playerIds[prevIndex]
          game.botTurn = false // since new player is human
        }
      } else {
        // Add new player to the game
        game.playerIds.push(playerId)
      }

      // Reset playing with bot flag since we now have multiple players
      game.playingWithBot = false
    },

    playerLeft: (playerId, { game }) => {
      const playerIndex = game.playerIds.indexOf(playerId)
      if (playerIndex === -1) return // Player not found

      // If only one human player remains, replace the leaving player with a bot
      const humanPlayers = game.playerIds.filter((id) => id !== "bot")
      if (humanPlayers.length === 2 && humanPlayers.includes(playerId)) {
        // Replace leaving player with bot
        game.playerIds[playerIndex] = "bot"

        // Transfer leaving player's selections to bot
        if (game.playerPieceSelections[playerId] !== undefined) {
          game.playerPieceSelections["bot"] =
            game.playerPieceSelections[playerId]
          delete game.playerPieceSelections[playerId]
        }
        if (game.playerBoardSelections[playerId] !== undefined) {
          game.playerBoardSelections["bot"] =
            game.playerBoardSelections[playerId]
          delete game.playerBoardSelections[playerId]
        }

        // Determine if it's now the bot's turn
        let currentPlayerId = game.playerIds[0]
        if (game.lastMovePlayerId) {
          const lastIndex = game.playerIds.indexOf(game.lastMovePlayerId)
          if (lastIndex !== -1) {
            const nextIndex = (lastIndex + 1) % game.playerIds.length
            currentPlayerId = game.playerIds[nextIndex]
          }
        }
        if (currentPlayerId === "bot") {
          // Set lastMovePlayerId to the previous player so that next is bot
          const botIndex = game.playerIds.indexOf("bot")
          const prevIndex =
            botIndex === 0 ? game.playerIds.length - 1 : botIndex - 1
          game.lastMovePlayerId = game.playerIds[prevIndex]
          game.botTurn = true
          game.botTurnAt = Rune.gameTime() + 1500
        }

        // Clear the cells of the leaving player
        if (game.gameStarted) {
          for (let i = 0; i < game.cells.length; i++) {
            if (game.cells[i].playerId === playerId) {
              game.cells[i].playerId = "bot"
            }
          }
        }

        game.playingWithBot = true
      } else {
        // Remove the leaving player
        game.playerIds = game.playerIds.filter((id) => id !== playerId)
        delete game.playerPieceSelections[playerId]
        delete game.playerBoardSelections[playerId]

        // Remove their pieces from the board
        if (game.gameStarted) {
          for (let i = 0; i < game.cells.length; i++) {
            if (game.cells[i].playerId === playerId) {
              game.cells[i].playerId = null
            }
          }
        }

        // If it was leaving player's turn, advance turn
        if (game.lastMovePlayerId === playerId) {
          if (game.playerIds.length > 0) {
            const currentIndex = game.playerIds.indexOf(game.lastMovePlayerId)
            const nextIndex = (currentIndex + 1) % game.playerIds.length
            game.lastMovePlayerId = game.playerIds[nextIndex]
            game.botTurn = game.lastMovePlayerId === "bot"
            if (game.botTurn) {
              game.botTurnAt = Rune.gameTime() + 1500
            }
          }
        }

        // If now only one player left, set playing with bot
        if (game.playerIds.length === 1 && game.playerIds[0] !== "bot") {
          game.playingWithBot = true
          game.playerIds.push("bot")
          // Assign opposite piece to bot
          const humanPiece = game.playerPieceSelections[game.playerIds[0]]
          game.playerPieceSelections["bot"] = humanPiece === 0 ? 1 : 0
        }
      }
    },
  },
})

// Run this function in the browser by passing the elements to get the coordinates use that in the cellsForBoardA array.

// function findAllIntersectionPoints(elements) {
//   const intersections = new Map(); // Use Map to avoid duplicates

//   // Helper function to add intersection point
//   const addIntersection = (x, y) => {
//     // Round to avoid floating point issues
//     const key = `${Math.round(x)},${Math.round(y)}`;
//     intersections.set(key, { x: Math.round(x), y: Math.round(y) });
//   };

//   // Helper function to find intersection of two line segments
//   const lineIntersection = (x1, y1, x2, y2, x3, y3, x4, y4) => {
//     const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
//     if (Math.abs(denom) < 0.0001) return null; // Parallel lines

//     const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
//     const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

//     if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
//       return {
//         x: x1 + t * (x2 - x1),
//         y: y1 + t * (y2 - y1)
//       };
//     }
//     return null;
//   };

//   // Extract all line segments from elements
//   const lineSegments = [];

//   elements.forEach(element => {
//     if (element.tag === "line") {
//       lineSegments.push({
//         x1: parseFloat(element.attrs.x1),
//         y1: parseFloat(element.attrs.y1),
//         x2: parseFloat(element.attrs.x2),
//         y2: parseFloat(element.attrs.y2)
//       });
//     } else if (element.tag === "polygon") {
//       const points = element.attrs.points.split(' ').map(p => parseFloat(p));
//       for (let i = 0; i < points.length; i += 2) {
//         const nextI = (i + 2) % points.length;
//         lineSegments.push({
//           x1: points[i],
//           y1: points[i + 1],
//           x2: points[nextI],
//           y2: points[nextI + 1]
//         });
//       }
//     } else if (element.tag === "path") {
//       // Parse the path - assuming it's a simple polygon
//       const d = element.attrs.d;
//       const commands = d.match(/[ML]\s*\d+\s+\d+/g);
//       const pathPoints = commands.map(cmd => {
//         const nums = cmd.match(/\d+/g);
//         return { x: parseFloat(nums[0]), y: parseFloat(nums[1]) };
//       });

//       for (let i = 0; i < pathPoints.length; i++) {
//         const next = (i + 1) % pathPoints.length;
//         lineSegments.push({
//           x1: pathPoints[i].x,
//           y1: pathPoints[i].y,
//           x2: pathPoints[next].x,
//           y2: pathPoints[next].y
//         });
//       }
//     }
//   });

//   // For the Tigers and Goats board, we also need the middle horizontal line
//   // This is implicit in the game board structure
//   lineSegments.push({
//     x1: 100,
//     y1: 300,
//     x2: 700,
//     y2: 300
//   });

//   // Find all intersections between line segments
//   for (let i = 0; i < lineSegments.length; i++) {
//     for (let j = i + 1; j < lineSegments.length; j++) {
//       const seg1 = lineSegments[i];
//       const seg2 = lineSegments[j];

//       const intersection = lineIntersection(
//         seg1.x1, seg1.y1, seg1.x2, seg1.y2,
//         seg2.x1, seg2.y1, seg2.x2, seg2.y2
//       );

//       if (intersection) {
//         addIntersection(intersection.x, intersection.y);
//       }
//     }

//     // Also add endpoints as they are valid positions
//     addIntersection(lineSegments[i].x1, lineSegments[i].y1);
//     addIntersection(lineSegments[i].x2, lineSegments[i].y2);
//   }

//   return Array.from(intersections.values());
// }
// const intersectionPoints = findAllIntersectionPoints(elements);
// console.log(`Found ${intersectionPoints.length} intersection points:`, intersectionPoints);
