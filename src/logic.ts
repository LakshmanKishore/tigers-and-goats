import type { PlayerId, RuneClient } from "rune-sdk"

export interface Cell {
  x: number
  y: number
  playerId: PlayerId | null
  reachableCellIndexes: number[]
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
  botTurn?: boolean
  botTurnAt?: number
  selectedCellIndex: number
  piecesCount: PiecesCount
}

type GameActions = {
  performCellAction: (cellIndex: number) => void
  updateBoardSelection: (boardType: number | null) => void
  updatePieceSelection: (pieceType: number | null) => void
  startGame: (options: { boardType: number; pieceType: number }) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

// Board A - 23 intersection points (0-22)
const cellsForBoardA: Cell[] = [
  // To get the correct coordinates, use the getIntersection function commented at the bottom of this file and pass the elements from the client file.
  // Top (y=0)
  { x: 400, y: 0, playerId: null, reachableCellIndexes: [18, 20] }, // 19

  // Second row (y=200)
  { x: 100, y: 200, playerId: null, reachableCellIndexes: [4, 6] }, // 7
  { x: 290, y: 200, playerId: null, reachableCellIndexes: [13, 15] }, // 14
  { x: 360, y: 200, playerId: null, reachableCellIndexes: [8, 13, 15] }, // 16
  { x: 440, y: 200, playerId: null, reachableCellIndexes: [9, 18] }, // 17
  { x: 510, y: 200, playerId: null, reachableCellIndexes: [14, 16] }, // 15
  { x: 700, y: 200, playerId: null, reachableCellIndexes: [12, 14, 16] }, // 13

  // Middle row (y=300)
  { x: 100, y: 300, playerId: null, reachableCellIndexes: [1, 9] }, // 0
  { x: 235, y: 300, playerId: null, reachableCellIndexes: [1, 3] }, // 2
  { x: 340, y: 300, playerId: null, reachableCellIndexes: [9, 11] }, // 4
  { x: 460, y: 300, playerId: null, reachableCellIndexes: [2, 4] }, // 5
  { x: 565, y: 300, playerId: null, reachableCellIndexes: [0, 10, 17] }, // 3
  { x: 700, y: 300, playerId: null, reachableCellIndexes: [0, 2, 4] }, // 1

  // Fourth row (y=400)
  { x: 100, y: 400, playerId: null, reachableCellIndexes: [1, 3, 5, 11] }, // 6
  { x: 180, y: 400, playerId: null, reachableCellIndexes: [6, 8] }, // 9
  { x: 320, y: 400, playerId: null, reachableCellIndexes: [4, 10, 12] }, // 11
  { x: 480, y: 400, playerId: null, reachableCellIndexes: [11, 13] }, // 12
  { x: 620, y: 400, playerId: null, reachableCellIndexes: [7, 16] }, // 10
  { x: 700, y: 400, playerId: null, reachableCellIndexes: [5, 7] }, // 8

  // Bottom row (y=500)
  { x: 125, y: 500, playerId: null, reachableCellIndexes: [17, 19] }, // 18
  { x: 300, y: 500, playerId: null, reachableCellIndexes: [20, 22] }, // 21
  { x: 500, y: 500, playerId: null, reachableCellIndexes: [21] }, // 22
  { x: 675, y: 500, playerId: null, reachableCellIndexes: [19, 21] }, // 20
]

// Board B - 25 intersection points (0-24)
const cellsForBoardB: Cell[] = [
  // Top row (5 points)
  { x: 0, y: 0, playerId: null, reachableCellIndexes: [1, 5] },
  { x: 60, y: 0, playerId: null, reachableCellIndexes: [0, 2, 6] },
  { x: 120, y: 0, playerId: null, reachableCellIndexes: [1, 3, 7] },
  { x: 180, y: 0, playerId: null, reachableCellIndexes: [2, 4, 8] },
  { x: 240, y: 0, playerId: null, reachableCellIndexes: [3, 9] },

  // Second row (5 points)
  { x: 0, y: 60, playerId: null, reachableCellIndexes: [0, 6, 10] },
  { x: 60, y: 60, playerId: null, reachableCellIndexes: [1, 5, 7, 11, 12] },
  { x: 120, y: 60, playerId: null, reachableCellIndexes: [2, 6, 8, 12] },
  { x: 180, y: 60, playerId: null, reachableCellIndexes: [3, 7, 9, 13, 14] },
  { x: 240, y: 60, playerId: null, reachableCellIndexes: [4, 8, 14] },

  // Third row (5 points)
  { x: 0, y: 120, playerId: null, reachableCellIndexes: [5, 11, 15] },
  { x: 60, y: 120, playerId: null, reachableCellIndexes: [6, 10, 12, 16] },
  { x: 120, y: 120, playerId: null, reachableCellIndexes: [6, 7, 11, 13, 17] },
  { x: 180, y: 120, playerId: null, reachableCellIndexes: [8, 12, 14, 18] },
  { x: 240, y: 120, playerId: null, reachableCellIndexes: [8, 9, 13, 19] },

  // Fourth row (5 points)
  { x: 0, y: 180, playerId: null, reachableCellIndexes: [10, 16, 20] },
  { x: 60, y: 180, playerId: null, reachableCellIndexes: [11, 15, 17, 21] },
  { x: 120, y: 180, playerId: null, reachableCellIndexes: [12, 16, 18, 22] },
  { x: 180, y: 180, playerId: null, reachableCellIndexes: [13, 17, 19, 23] },
  { x: 240, y: 180, playerId: null, reachableCellIndexes: [14, 18, 24] },

  // Bottom row (5 points)
  { x: 0, y: 240, playerId: null, reachableCellIndexes: [15, 21] },
  { x: 60, y: 240, playerId: null, reachableCellIndexes: [16, 20, 22] },
  { x: 120, y: 240, playerId: null, reachableCellIndexes: [17, 21, 23] },
  { x: 180, y: 240, playerId: null, reachableCellIndexes: [18, 22, 24] },
  { x: 240, y: 240, playerId: null, reachableCellIndexes: [19, 23] },
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
  }),
  actions: {
    performCellAction: (cellIndex, { game, playerId /*, allPlayerIds*/ }) => {
      // if (
      //   game.cells[cellIndex]?.playerId !== null ||
      //   playerId === game.lastMovePlayerId
      // ) {
      //   throw Rune.invalidAction()
      // }

      // Check if the click is coming from the lastMovePlayerId
      if (game.lastMovePlayerId && game.lastMovePlayerId === playerId) {
        // Don't take the click if it's not the player's turn
        console.log("It's not your turn.")
        return
      }

      // Whenever it's tigers turn, then the player should only click on the existing cell and not on the empty cell.
      if (
        game.playerPieceSelections[playerId] === 0 &&
        game.cells[cellIndex].playerId !== playerId &&
        game.selectedCellIndex === -1
      ) {
        // return and don't take that click
        console.log("Tiger clicked on the empty cell")
        return
      }

      // If there are no goats to place then if the player has clicked on the empty cell then just return
      if (game.playerPieceSelections[playerId] === 1) {
        if (
          game.piecesCount.goatsRemainingCount === 0 &&
          game.cells[cellIndex].playerId === null
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

      if (game.selectedCellIndex !== -1) {
        // During this time the current cell should be moved to another cell
        const selectedCell = game.cells[game.selectedCellIndex]
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
          game.lastMovePlayerId = playerId
        }
      } else if (game.playerPieceSelections[playerId] === 1) {
        if (
          game.piecesCount.goatsRemainingCount === 0 &&
          game.selectedCellIndex === -1
        ) {
          // If the goats are placed and it's the goat's turn then update the last move player id
          game.lastMovePlayerId = playerId
        } else if (game.piecesCount.goatsRemainingCount > 0) {
          // If the goats are not placed then update the last move player id
          game.lastMovePlayerId = playerId
        }
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
          const otherPlayerSelection =
            game.playerPieceSelections[playerId] || null
          game.playerPieceSelections["bot"] = otherPlayerSelection === 0 ? 1 : 0
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
      // Add the new player to the players list
      game.playerIds.push(playerId)
      // Reset the playing with bot flag
      game.playingWithBot = false
      // Remove any bot player from the list
      game.playerIds = game.playerIds.filter((id) => id !== "bot")

      // If the game has started, update any cells that had bot as player
      if (game.gameStarted) {
        for (let i = 0; i < game.cells.length; i++) {
          if (game.cells[i].playerId === "bot") {
            game.cells[i].playerId = playerId
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
            if (game.cells[i].playerId === playerId) {
              game.cells[i].playerId = "bot"
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
