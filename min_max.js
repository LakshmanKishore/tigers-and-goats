/**
 * TypeScript implementation of min-max algorithm with alpha-beta pruning for Tigers and Goats game
 */
class Board {
    board = new Array(23).fill(0);
    nextAction = "selectToPlace";
    currentPlayer = 1; // 1->goat, 2->tiger
    totalGoatsToPlace = 15; // Total goats to place
    goatsPlacedCount = 0;
    goatsCapturedCount = 0;
    selectedIndexToMove = -1;
    gameOver = false;
    winner = -1;
    possibleMovableDestinations = [];
    possibleMovablePieces = [];
    movesPerformed = [];
    movePairs = []; // Store source-destination pairs
    positionHistory = new Map(); // For stalemate detection
    captureMoves = new Map(); // Maps destination to captured goat position
    reachableCellIndexes = [
        [2, 3, 4, 5], // 0
        [2, 7], // 1
        [0, 1, 3, 8], // 2
        [0, 2, 4, 9], // 3
        [0, 3, 5, 10], // 4
        [0, 4, 6, 11], // 5
        [5, 12], // 6
        [1, 8, 13], // 7
        [2, 7, 9, 14], // 8
        [3, 8, 10, 15], // 9
        [4, 9, 11, 16], // 10
        [5, 10, 12, 17], // 11
        [6, 11, 18], // 12
        [7, 14], // 13
        [8, 13, 15, 19], // 14
        [9, 14, 16, 20], // 15
        [10, 15, 17, 21], // 16
        [11, 16, 18, 22], // 17
        [12, 17], // 18
        [14, 20], // 19
        [15, 19, 21], // 20
        [16, 20, 22], // 21
        [17, 21], // 22
    ];
    // Specific jumpable indexes for tigers
    tigerJumpableIndexes = [
        [8, 9, 10, 11], // 0
        [3, 13], // 1
        [4, 14], // 2
        [1, 5, 15], // 3
        [2, 6, 16], // 4
        [3, 17], // 5
        [4, 18], // 6
        [9], // 7
        [0, 10, 19], // 8
        [0, 7, 11, 20], // 9
        [0, 8, 12, 21], // 10
        [0, 9, 22], // 11
        [10], // 12
        [1, 15], // 13
        [2, 16], // 14
        [3, 13, 17], // 15
        [4, 14, 18], // 16
        [5, 15], // 17
        [6, 16], // 18
        [8, 21], // 19
        [9, 22], // 20
        [10, 19], // 21
        [11, 20], // 22
    ];
    // Which goat positions to check for removal after a tiger jump
    goatRemovalAfterTigerJumpIndexes = [
        [2, 3, 4, 5], // 0
        [2, 7], // 1
        [3, 8], // 2
        [2, 4, 9], // 3
        [3, 5, 10], // 4
        [4, 11], // 5
        [5, 12], // 6
        [8], // 7
        [2, 9, 14], // 8
        [3, 8, 10, 15], // 9
        [4, 9, 11, 16], // 10
        [5, 10, 17], // 11
        [11], // 12
        [7, 14], // 13
        [8, 15], // 14
        [9, 14, 16], // 15
        [10, 15, 17], // 16
        [11, 16], // 17
        [12, 17], // 18
        [14, 20], // 19
        [15, 21], // 20
        [16, 20], // 21
        [17, 21], // 22
    ];
    constructor(reachableCellIndexes, tigerJumpableIndexes, goatRemovalAfterTigerJumpIndexes) {
        // Initialize tigers at positions 0, 3, 4
        this.board[0] = 2;
        this.board[3] = 2;
        this.board[4] = 2;
        if (reachableCellIndexes) {
            this.reachableCellIndexes = reachableCellIndexes;
        }
        if (tigerJumpableIndexes) {
            this.tigerJumpableIndexes = tigerJumpableIndexes;
        }
        if (goatRemovalAfterTigerJumpIndexes) {
            this.goatRemovalAfterTigerJumpIndexes = goatRemovalAfterTigerJumpIndexes;
        }
    }
    getAllEmptyLocations() {
        const emptyList = [];
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === 0) {
                emptyList.push(i);
            }
        }
        return emptyList;
    }
    checkMoveRepetitionDraw() {
        /**
         * Check for draw by detecting repeated move sequences.
         * Draw condition: When both players repeat their exact sequence of moves twice.
         */
        // Need at least 8 moves to check for repetition (4+4)
        if (this.movePairs.length < 8) {
            return false;
        }
        // Get the last 8 moves (4 pairs) to check for repetition
        const lastEightMoves = this.movePairs.slice(-8);
        // Split into two sequences of 4 moves each
        const firstSequence = lastEightMoves.slice(0, 4); // First 4 moves
        const secondSequence = lastEightMoves.slice(4); // Last 4 moves
        // Check if the sequences match
        const sequencesMatch = firstSequence.every((move, index) => move[0] === secondSequence[index][0] &&
            move[1] === secondSequence[index][1]);
        if (sequencesMatch) {
            console.log("\n==== GAME OVER ====");
            console.log("Game ends in a DRAW due to move repetition");
            console.log("Both players have repeated their exact sequence of moves twice:");
            // Format the repeated sequence nicely
            const players = ["Goat", "Tiger", "Goat", "Tiger"];
            firstSequence.forEach(([src, dst], i) => {
                console.log(`  ${i + 1}. ${players[i]}: ${src} → ${dst}`);
            });
            console.log("This sequence was repeated twice in succession.");
            console.log("Final board state:");
            this.display();
            return true;
        }
        return false;
    }
    performAction(actionIndex) {
        /**
         * Validate and perform the action at the given index
         */
        // Record the move
        this.movesPerformed.push(actionIndex);
        // GOAT'S TURN
        if (this.currentPlayer === 1) {
            if (this.goatsPlacedCount < this.totalGoatsToPlace) {
                // First phase - placing goats
                if (this.board[actionIndex] !== 0) {
                    console.log("Invalid move: Cell already occupied");
                    return false;
                }
                // Place the goat
                this.board[actionIndex] = 1;
                this.goatsPlacedCount++;
                // During placement phase, we record the placement as a move from -1 to actionIndex
                this.movePairs.push([-1, actionIndex]);
            }
            else {
                // Second phase - moving goats
                if (this.selectedIndexToMove === -1) {
                    // Selecting a goat to move
                    if (this.board[actionIndex] !== 1) {
                        console.log("Invalid move: Must select a goat to move");
                        return false;
                    }
                    // Check if the goat has any valid moves
                    const validDestinations = [];
                    for (const neighbor of this.reachableCellIndexes[actionIndex]) {
                        if (this.board[neighbor] === 0) {
                            validDestinations.push(neighbor);
                        }
                    }
                    if (validDestinations.length === 0) {
                        console.log("Invalid move: No valid destinations for this goat");
                        return false;
                    }
                    // Set up for destination selection
                    this.selectedIndexToMove = actionIndex;
                    this.possibleMovableDestinations = validDestinations;
                    return true;
                }
                else {
                    // Selecting a destination for the goat
                    if (!this.reachableCellIndexes[this.selectedIndexToMove].includes(actionIndex)) {
                        console.log("Invalid move: Not a reachable destination");
                        return false;
                    }
                    if (this.board[actionIndex] !== 0) {
                        console.log("Invalid move: Destination cell is occupied");
                        return false;
                    }
                    // Move the goat
                    this.board[this.selectedIndexToMove] = 0;
                    this.board[actionIndex] = 1;
                    // Record the move pair (source, destination)
                    this.movePairs.push([this.selectedIndexToMove, actionIndex]);
                    this.selectedIndexToMove = -1;
                    this.possibleMovableDestinations = [];
                }
            }
        }
        else {
            // TIGER'S TURN
            if (this.selectedIndexToMove === -1) {
                // Selecting a tiger to move
                if (this.board[actionIndex] !== 2) {
                    console.log("Invalid move: Must select a tiger to move");
                    return false;
                }
                // Find valid moves for the tiger (including captures)
                const validMoves = [];
                const captureMoves = new Map(); // Maps destination to captured goat position
                // Check adjacent empty cells (normal moves)
                for (const neighbor of this.reachableCellIndexes[actionIndex]) {
                    if (this.board[neighbor] === 0) {
                        // Empty cell
                        validMoves.push(neighbor);
                    }
                }
                // Check jumpable positions for captures
                for (let i = 0; i < this.tigerJumpableIndexes[actionIndex].length; i++) {
                    const jumpIndex = this.tigerJumpableIndexes[actionIndex][i];
                    if (i < this.goatRemovalAfterTigerJumpIndexes[actionIndex].length &&
                        this.board[jumpIndex] === 0) {
                        // Empty destination
                        // Get the goat removal index for this jump
                        const goatRemovalIndex = this.goatRemovalAfterTigerJumpIndexes[actionIndex][i];
                        // Check if there's a goat at the removal position
                        if (this.board[goatRemovalIndex] === 1) {
                            // Found a goat
                            captureMoves.set(jumpIndex, goatRemovalIndex);
                        }
                    }
                }
                const allDestinations = [
                    ...validMoves,
                    ...Array.from(captureMoves.keys()),
                ];
                if (allDestinations.length === 0) {
                    console.log("Invalid move: No valid destinations for this tiger");
                    return false;
                }
                // Set up for destination selection
                this.selectedIndexToMove = actionIndex;
                this.possibleMovableDestinations = allDestinations;
                // Store capture information for later use
                this.captureMoves = captureMoves;
                return true;
            }
            else {
                // Selecting a destination for the tiger
                if (this.tigerJumpableIndexes[this.selectedIndexToMove].includes(actionIndex)) {
                    // This is a jump/capture move
                    if (this.board[actionIndex] !== 0) {
                        console.log("Invalid move: Destination cell is occupied");
                        return false;
                    }
                    // Find the index of this destination in the jumpable indexes
                    const jumpableIndex = this.tigerJumpableIndexes[this.selectedIndexToMove].indexOf(actionIndex);
                    if (jumpableIndex >=
                        this.goatRemovalAfterTigerJumpIndexes[this.selectedIndexToMove]
                            .length) {
                        console.log("Invalid move: No valid goat to capture");
                        return false;
                    }
                    // Get the corresponding goat removal index
                    const goatRemovalIndex = this.goatRemovalAfterTigerJumpIndexes[this.selectedIndexToMove][jumpableIndex];
                    // Check if there's a goat at the removal position
                    if (this.board[goatRemovalIndex] !== 1) {
                        console.log("Invalid move: No goat to capture");
                        return false;
                    }
                    // Move the tiger and capture the goat
                    this.board[this.selectedIndexToMove] = 0;
                    this.board[actionIndex] = 2;
                    this.board[goatRemovalIndex] = 0;
                    this.goatsCapturedCount++;
                    // Record the move pair with captured goat info
                    this.movePairs.push([this.selectedIndexToMove, actionIndex]);
                }
                else if (this.reachableCellIndexes[this.selectedIndexToMove].includes(actionIndex)) {
                    // This is a normal move
                    if (this.board[actionIndex] !== 0) {
                        console.log("Invalid move: Destination cell is occupied");
                        return false;
                    }
                    // Move the tiger
                    this.board[this.selectedIndexToMove] = 0;
                    this.board[actionIndex] = 2;
                    // Record the move pair
                    this.movePairs.push([this.selectedIndexToMove, actionIndex]);
                }
                else {
                    console.log("Invalid move: Not a valid destination");
                    return false;
                }
                this.selectedIndexToMove = -1;
                this.possibleMovableDestinations = [];
                this.captureMoves.clear();
            }
        }
        // Check for draw by move repetition after completing a move
        // Only check when we have enough moves recorded
        if (this.movePairs.length >= 8) {
            if (this.checkMoveRepetitionDraw()) {
                this.gameOver = true;
                this.winner = 0; // Draw
                return true;
            }
        }
        // Switch player and determine next action
        this.currentPlayer = 3 - this.currentPlayer; // Switch between 1 and 2
        // Check win conditions
        this.checkWinConditions();
        // Update movable pieces for the current player
        this.updatePossibleMovablePieces();
        return true;
    }
    performNextMove(index) {
        /**
         * Wrapper for performAction to maintain compatibility with existing code
         */
        return this.performAction(index);
    }
    checkWinConditions() {
        /**
         * Check if the game has ended
         */
        // Tigers win if they capture ALL goats
        // Calculate how many goats are on the board
        // const goatsOnBoard = this.board.filter((cell) => cell === 1).length
        const totalGoats = this.goatsPlacedCount - this.goatsCapturedCount;
        if (totalGoats === 0 && this.goatsPlacedCount === this.totalGoatsToPlace) {
            console.log("\n==== GAME OVER ====");
            console.log("Tigers WIN!");
            console.log(`Tigers have captured all ${this.goatsCapturedCount} goats`);
            console.log("Final board state:");
            this.display();
            this.gameOver = true;
            this.winner = 2; // Tiger wins
            return;
        }
        // Goats win if all tigers are blocked
        if (this.currentPlayer === 2) {
            // Only check when it's tiger's turn
            let tigersBlocked = true;
            const tigerPositions = this.getPlayerIndexes(this.board, 2);
            for (const tigerPos of tigerPositions) {
                // Check normal moves
                for (const neighbor of this.reachableCellIndexes[tigerPos]) {
                    if (this.board[neighbor] === 0) {
                        tigersBlocked = false;
                        break;
                    }
                }
                if (tigersBlocked) {
                    // Check capture moves
                    for (let i = 0; i < this.tigerJumpableIndexes[tigerPos].length; i++) {
                        const jumpIndex = this.tigerJumpableIndexes[tigerPos][i];
                        if (i < this.goatRemovalAfterTigerJumpIndexes[tigerPos].length &&
                            this.board[jumpIndex] === 0) {
                            // Empty destination
                            // Get the goat removal index for this jump
                            const goatRemovalIndex = this.goatRemovalAfterTigerJumpIndexes[tigerPos][i];
                            // Check if there's a goat at the removal position
                            if (this.board[goatRemovalIndex] === 1) {
                                tigersBlocked = false;
                                break;
                            }
                        }
                        if (!tigersBlocked) {
                            break;
                        }
                    }
                }
                if (!tigersBlocked) {
                    break;
                }
            }
            if (tigersBlocked && tigerPositions.length > 0) {
                console.log("\n==== GAME OVER ====");
                console.log("Goats WIN!");
                console.log("All tigers are blocked from moving");
                console.log("Final board state:");
                this.display();
                this.gameOver = true;
                this.winner = 1; // Goat wins
                return;
            }
        }
    }
    updatePossibleMovablePieces() {
        /**
         * Update the list of pieces that can be moved by the current player
         */
        this.possibleMovablePieces = [];
        this.possibleMovableDestinations = [];
        if (this.currentPlayer === 1) {
            if (this.goatsPlacedCount < this.totalGoatsToPlace) {
                // In placement phase, goats don't move
                return;
            }
            // Get all goats
            const goatPositions = this.getPlayerIndexes(this.board, 1);
            for (const goatPos of goatPositions) {
                // Check if the goat can move to any adjacent empty cell
                for (const neighbor of this.reachableCellIndexes[goatPos]) {
                    if (this.board[neighbor] === 0) {
                        this.possibleMovablePieces.push(goatPos);
                        break;
                    }
                }
            }
        }
        else {
            // Get all tigers
            const tigerPositions = this.getPlayerIndexes(this.board, 2);
            for (const tigerPos of tigerPositions) {
                let canMove = false;
                // Check normal moves
                for (const neighbor of this.reachableCellIndexes[tigerPos]) {
                    if (this.board[neighbor] === 0) {
                        canMove = true;
                        break;
                    }
                }
                // Check capture moves
                if (!canMove) {
                    for (let i = 0; i < this.tigerJumpableIndexes[tigerPos].length; i++) {
                        const jumpIndex = this.tigerJumpableIndexes[tigerPos][i];
                        if (i < this.goatRemovalAfterTigerJumpIndexes[tigerPos].length &&
                            this.board[jumpIndex] === 0) {
                            // Empty destination
                            // Get the goat removal index for this jump
                            const goatRemovalIndex = this.goatRemovalAfterTigerJumpIndexes[tigerPos][i];
                            // Check if there's a goat at the removal position
                            if (this.board[goatRemovalIndex] === 1) {
                                canMove = true;
                                break;
                            }
                        }
                        if (canMove) {
                            break;
                        }
                    }
                }
                if (canMove) {
                    this.possibleMovablePieces.push(tigerPos);
                }
            }
        }
        // Update possibleMovableDestinations based on selected piece
        if (this.selectedIndexToMove !== -1) {
            this.possibleMovableDestinations = [];
            if (this.currentPlayer === 1) {
                // For goats, only check adjacent empty cells
                for (const neighbor of this.reachableCellIndexes[this.selectedIndexToMove]) {
                    if (this.board[neighbor] === 0) {
                        this.possibleMovableDestinations.push(neighbor);
                    }
                }
            }
            else {
                // For tigers, check both normal moves and capture moves
                const validMoves = [];
                const captureMoves = new Map();
                // Check adjacent empty cells (normal moves)
                for (const neighbor of this.reachableCellIndexes[this.selectedIndexToMove]) {
                    if (this.board[neighbor] === 0) {
                        validMoves.push(neighbor);
                    }
                }
                // Check jumpable positions for captures
                for (let i = 0; i < this.tigerJumpableIndexes[this.selectedIndexToMove].length; i++) {
                    const jumpIndex = this.tigerJumpableIndexes[this.selectedIndexToMove][i];
                    if (i <
                        this.goatRemovalAfterTigerJumpIndexes[this.selectedIndexToMove]
                            .length &&
                        this.board[jumpIndex] === 0) {
                        // Empty destination
                        const goatRemovalIndex = this.goatRemovalAfterTigerJumpIndexes[this.selectedIndexToMove][i];
                        // Check if there's a goat at the removal position
                        if (this.board[goatRemovalIndex] === 1) {
                            captureMoves.set(jumpIndex, goatRemovalIndex);
                        }
                    }
                }
                this.possibleMovableDestinations = [
                    ...validMoves,
                    ...Array.from(captureMoves.keys()),
                ];
                this.captureMoves = captureMoves;
            }
        }
    }
    getPlayerIndexes(board, player) {
        /**
         * Get positions of all pieces for a given player
         */
        return board
            .map((piece, index) => (piece === player ? index : -1))
            .filter((index) => index !== -1);
    }
    countBlockedTigers() {
        /**
         * Count how many tigers are blocked
         */
        let blockedTigers = 0;
        const tigerPositions = this.getPlayerIndexes(this.board, 2);
        for (const tigerPos of tigerPositions) {
            let isBlocked = true;
            // Check normal moves
            for (const neighbor of this.reachableCellIndexes[tigerPos]) {
                if (this.board[neighbor] === 0) {
                    isBlocked = false;
                    break;
                }
            }
            if (isBlocked) {
                // Check capture moves
                for (let i = 0; i < this.tigerJumpableIndexes[tigerPos].length; i++) {
                    const jumpIndex = this.tigerJumpableIndexes[tigerPos][i];
                    if (i < this.goatRemovalAfterTigerJumpIndexes[tigerPos].length &&
                        this.board[jumpIndex] === 0) {
                        // Empty destination
                        // Get the goat removal index for this jump
                        const goatRemovalIndex = this.goatRemovalAfterTigerJumpIndexes[tigerPos][i];
                        // Check if there's a goat at the removal position
                        if (this.board[goatRemovalIndex] === 1) {
                            isBlocked = false;
                            break;
                        }
                    }
                    if (!isBlocked) {
                        break;
                    }
                }
            }
            if (isBlocked) {
                blockedTigers++;
            }
        }
        return blockedTigers;
    }
    countCapturableGoats() {
        /**
         * Count how many goats can be captured in the next move
         */
        let capturableGoats = 0;
        const tigerPositions = this.getPlayerIndexes(this.board, 2);
        for (const tigerPos of tigerPositions) {
            // Check jumpable positions for captures
            for (let i = 0; i < this.tigerJumpableIndexes[tigerPos].length; i++) {
                const jumpIndex = this.tigerJumpableIndexes[tigerPos][i];
                if (i < this.goatRemovalAfterTigerJumpIndexes[tigerPos].length &&
                    this.board[jumpIndex] === 0) {
                    // Empty destination
                    // Get the goat removal index for this jump
                    const goatRemovalIndex = this.goatRemovalAfterTigerJumpIndexes[tigerPos][i];
                    // Check if there's a goat at the removal position
                    if (this.board[goatRemovalIndex] === 1) {
                        capturableGoats++;
                    }
                }
            }
        }
        return capturableGoats;
    }
    getValue(player, printHeuristics = false) {
        /**
         * Evaluate the board state from a player's perspective
         */
        // Features:
        // A: blocked tigers (range 0-3)
        // B: goats captured (range 0-15)
        // C: goats that can be captured next move (range 0-15)
        const blockedTigers = this.countBlockedTigers();
        const goatsCaptured = this.goatsCapturedCount;
        const capturableGoats = this.countCapturableGoats();
        // Updated the bonus to reflect the "capture all goats" win condition
        const allGoatsCaptured = this.goatsCapturedCount === this.totalGoatsToPlace;
        let score;
        // Using the heuristic design from option 3 (threshold/non-linear bonuses)
        if (player === 2) {
            // Tiger's perspective
            score =
                -5 * blockedTigers +
                    10 * goatsCaptured +
                    3 * capturableGoats +
                    100 * (allGoatsCaptured ? 1 : 0) -
                    100 * (blockedTigers >= 3 ? 1 : 0);
        }
        else {
            // Goat's perspective
            score =
                3 * blockedTigers -
                    6 * goatsCaptured -
                    4 * capturableGoats -
                    100 * (allGoatsCaptured ? 1 : 0) +
                    100 * (blockedTigers >= 3 ? 1 : 0);
        }
        if (printHeuristics) {
            console.log(`
            blockedTigers: ${blockedTigers}
            goatsCaptured: ${goatsCaptured}/${this.totalGoatsToPlace}
            capturableGoats: ${capturableGoats}
            player perspective: ${player === 2 ? "Tiger" : "Goat"}
            score: ${score}
            `);
        }
        return score;
    }
    declareWinner(player) {
        /**
         * Declare the winner and end the game
         */
        if (player === 0) {
            console.log("\n==== GAME OVER ====");
            console.log("Game ends in a DRAW");
            console.log("Final board state:");
            this.display();
        }
        else {
            console.log("\n==== GAME OVER ====");
            console.log(`Player ${player} (${player === 1 ? "Goat" : "Tiger"}) has WON the game!`);
            if (player === 1) {
                console.log("All tigers are blocked from moving");
            }
            else {
                console.log(`Tigers have captured all ${this.goatsCapturedCount} goats`);
            }
            console.log("Final board state:");
            this.display();
        }
        this.gameOver = true;
        this.winner = player;
    }
    display() {
        /**
         * Display the current board state
         */
        const format = `
                    {0}_00
   {1}_01     {2}_02  {3}_03  {4}_04  {5}_05     {6}_06
   {7}_07    {8}_08  {9}_09    {10}_10  {11}_11    {12}_12
   {13}_13   {14}_14  {15}_15      {16}_16  {17}_17   {18}_18
         {19}_19  {20}_20        {21}_21  {22}_22

   `;
        // Replace each position with the actual board value
        const boardValues = [];
        for (let i = 0; i < 23; i++) {
            const value = this.board[i];
            const displayValue = value === 0 ? "." : value === 1 ? "G" : "T";
            boardValues.push(displayValue);
        }
        let displayString = format;
        for (let i = 0; i < 23; i++) {
            displayString = displayString.replace(`{${i}}`, boardValues[i]);
        }
        console.log(displayString);
        // Show game statistics
        console.log(`Goats placed: ${this.goatsPlacedCount}/${this.totalGoatsToPlace}`);
        console.log(`Goats captured: ${this.goatsCapturedCount}/${this.totalGoatsToPlace}`);
        console.log(`Goats on board: ${this.goatsPlacedCount - this.goatsCapturedCount}`);
        if (this.currentPlayer === 1) {
            console.log("Current turn: Goat");
        }
        else {
            console.log("Current turn: Tiger");
        }
        // Display recent move history
        if (this.movePairs.length > 0) {
            console.log("\nRecent moves (source, destination):");
            const start = Math.max(0, this.movePairs.length - 8); // Show up to 8 recent moves
            for (let i = start; i < this.movePairs.length; i++) {
                const [src, dst] = this.movePairs[i];
                const player = i % 2 === 0 ? "Goat" : "Tiger";
                console.log(`${i + 1}. ${player}: ${src} → ${dst}`);
            }
        }
    }
    // Deep clone method for creating copies of the board
    clone() {
        const cloned = new Board(this.reachableCellIndexes, this.tigerJumpableIndexes, this.goatRemovalAfterTigerJumpIndexes);
        cloned.board = [...this.board];
        cloned.nextAction = this.nextAction;
        cloned.currentPlayer = this.currentPlayer;
        cloned.totalGoatsToPlace = this.totalGoatsToPlace;
        cloned.goatsPlacedCount = this.goatsPlacedCount;
        cloned.goatsCapturedCount = this.goatsCapturedCount;
        cloned.selectedIndexToMove = this.selectedIndexToMove;
        cloned.gameOver = this.gameOver;
        cloned.winner = this.winner;
        cloned.possibleMovableDestinations = [...this.possibleMovableDestinations];
        cloned.possibleMovablePieces = [...this.possibleMovablePieces];
        cloned.movesPerformed = [...this.movesPerformed];
        cloned.movePairs = this.movePairs.map((pair) => [pair[0], pair[1]]);
        cloned.positionHistory = new Map(this.positionHistory);
        cloned.captureMoves = new Map(this.captureMoves);
        return cloned;
    }
}
function showMenu() {
    /**
     * Show the game menu and get player selections
     * Returns: [isGoatHuman, isTigerHuman]
     */
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const currentUser = "Player";
    console.log("╔═════════════════════════════════════════════╗");
    console.log("║         TIGERS AND GOATS - GAME MENU        ║");
    console.log("╠═════════════════════════════════════════════╣");
    console.log(`║ Current Date and Time: ${currentDate}       ║`);
    console.log(`║ User: ${currentUser.padEnd(35)} ║`);
    console.log("╠═════════════════════════════════════════════╣");
    console.log("║ Select Game Mode:                           ║");
    console.log("║                                             ║");
    console.log("║ 1. Human vs Human                           ║");
    console.log("║ 2. Human (Goat) vs AI (Tiger)               ║");
    console.log("║ 3. AI (Goat) vs Human (Tiger)               ║");
    console.log("║ 4. AI vs AI (Demo)                          ║");
    console.log("║                                             ║");
    console.log("║ 0. Exit Game                                ║");
    console.log("╚═════════════════════════════════════════════╝");
    // For TypeScript, we'll return a default configuration
    // In a real implementation, you'd use prompt() or a UI framework
    return [true, false]; // Default: Human vs AI
}
function startGame() {
    /**
     * Start and run the game
     */
    console.log(`Tigers and Goats Game - ${new Date().toISOString().slice(0, 19).replace("T", " ")}`);
    // Show menu and get player selections
    const [isGoatHuman, isTigerHuman] = showMenu();
    // Display game information based on selected mode
    console.log("\n===============================================");
    console.log("           TIGERS AND GOATS GAME               ");
    console.log("===============================================");
    if (isGoatHuman && isTigerHuman) {
        console.log("Game Mode: Human vs Human");
    }
    else if (isGoatHuman) {
        console.log("Game Mode: Human (Goat) vs AI (Tiger)");
    }
    else if (isTigerHuman) {
        console.log("Game Mode: AI (Goat) vs Human (Tiger)");
    }
    else {
        console.log("Game Mode: AI vs AI (Demo)");
    }
    console.log("\nRules:");
    console.log("- Goats: Place goats in empty cells, then move to adjacent empty cells");
    console.log("- Tigers: Move to adjacent empty cells or jump over goats to capture them");
    console.log("- Tigers win by capturing ALL goats");
    console.log("- Goats win by blocking all tigers from moving");
    console.log("- Game ends in a draw if both players repeat their exact sequence of moves twice");
    console.log("\nInitial board: Tigers at positions 0, 3, 4");
    console.log("===============================================\n");
    const gameBoard = new Board();
    while (true) {
        if (gameBoard.gameOver) {
            break;
        }
        gameBoard.display();
        const currentAction = gameBoard.currentPlayer === 1 &&
            gameBoard.goatsPlacedCount < gameBoard.totalGoatsToPlace
            ? "selectToPlace"
            : gameBoard.selectedIndexToMove === -1
                ? "selectToMove"
                : "selectDestination";
        const currentPlayer = gameBoard.currentPlayer === 1 ? "Goat" : "Tiger";
        const isCurrentPlayerHuman = gameBoard.currentPlayer === 1 ? isGoatHuman : isTigerHuman;
        console.log(`Next Action: ${currentAction}`);
        console.log(`Current Player: ${currentPlayer} (${isCurrentPlayerHuman ? "Human" : "AI"})`);
        if (gameBoard.currentPlayer === 1 &&
            gameBoard.goatsPlacedCount < gameBoard.totalGoatsToPlace) {
            console.log(`Remaining Goats to be placed: ${gameBoard.totalGoatsToPlace - gameBoard.goatsPlacedCount}`);
        }
        if (gameBoard.selectedIndexToMove !== -1) {
            console.log(`Possible destinations for index ${gameBoard.selectedIndexToMove} are: ${gameBoard.possibleMovableDestinations}`);
        }
        if (gameBoard.selectedIndexToMove === -1 &&
            (gameBoard.currentPlayer === 2 ||
                (gameBoard.currentPlayer === 1 &&
                    gameBoard.goatsPlacedCount >= gameBoard.totalGoatsToPlace))) {
            console.log(`Possible moves for ${currentPlayer} are: ${gameBoard.possibleMovablePieces}`);
        }
        // Check if current player is AI
        if (!isCurrentPlayerHuman) {
            console.log(`\n${currentPlayer} (AI) is thinking...`);
            const bestMove = getNextBestMove(gameBoard);
            console.log(`${currentPlayer} (AI) chooses position ${bestMove.action}`);
            const success = gameBoard.performNextMove(bestMove.action);
            // If the move failed, try a different approach
            if (!success &&
                gameBoard.currentPlayer === 1 &&
                gameBoard.goatsPlacedCount < gameBoard.totalGoatsToPlace) {
                // For goat placement phase, just pick any empty spot
                console.log(`${currentPlayer} (AI) retrying with a random empty location...`);
                const emptySpots = gameBoard.getAllEmptyLocations();
                if (emptySpots.length > 0) {
                    const randomSpot = emptySpots[0]; // Just pick the first available spot
                    console.log(`${currentPlayer} (AI) chooses position ${randomSpot}`);
                    gameBoard.performNextMove(randomSpot);
                }
                else {
                    console.log("No valid moves available - game may be in an invalid state");
                }
            }
            continue;
        }
        // For demo purposes, we'll just use AI for both players
        console.log(`\n${currentPlayer} (Auto) is thinking...`);
        const bestMove = getNextBestMove(gameBoard);
        console.log(`${currentPlayer} (Auto) chooses position ${bestMove.action}`);
        gameBoard.performNextMove(bestMove.action);
    }
}
function getNextBestMove(gameBoard) {
    /**
     * Use min-max with alpha-beta pruning to find the best move for the AI
     */
    // Determine valid actions based on the current game state
    let nextActionPossiblePositions;
    let depth;
    if (gameBoard.currentPlayer === 1 &&
        gameBoard.goatsPlacedCount < gameBoard.totalGoatsToPlace) {
        // During goat placement phase, place on any empty cell
        nextActionPossiblePositions = gameBoard.getAllEmptyLocations();
        depth = 3; // Use lower depth during placement phase
    }
    else if (gameBoard.selectedIndexToMove === -1) {
        // If no piece is selected, get all movable pieces
        nextActionPossiblePositions = gameBoard.possibleMovablePieces;
        depth = 3; // Default depth
    }
    else {
        // If a piece is selected, get all possible destinations
        nextActionPossiblePositions = gameBoard.possibleMovableDestinations;
        depth = 3; // Default depth
    }
    console.log("Next action possible positions: ", nextActionPossiblePositions);
    console.log(`Current Player: ${gameBoard.currentPlayer}`);
    // Ensure we have valid positions
    if (nextActionPossiblePositions.length === 0) {
        console.log("No valid moves found for AI");
        // Try to find any empty spot as a fallback
        if (gameBoard.currentPlayer === 1 &&
            gameBoard.goatsPlacedCount < gameBoard.totalGoatsToPlace) {
            const emptySpots = gameBoard.getAllEmptyLocations();
            if (emptySpots.length > 0) {
                return { value: 0, action: emptySpots[0], movesPerformed: [] };
            }
        }
        // Return a default value if no valid moves are found
        return { value: -999999, action: 0, movesPerformed: [] };
    }
    // Increase depth for endgame situations
    if (gameBoard.goatsCapturedCount >= 3 ||
        gameBoard.countBlockedTigers() >= 2) {
        depth = 4;
    }
    // For each next action get the min max value and store it and choose the best one.
    const minMaxValues = [];
    const startTime = Date.now();
    // Determine if we should maximize or minimize based on current player
    const isMaximizing = gameBoard.currentPlayer === 2; // Maximize for tiger
    for (const nextAction of nextActionPossiblePositions) {
        const gameboardCopy = gameBoard.clone();
        const result = minMaxWithAlphaBetaPruning(gameboardCopy, depth, nextAction, isMaximizing, -9999999999, 9999999999, true, gameboardCopy.currentPlayer);
        minMaxValues.push(result);
    }
    const endTime = Date.now();
    console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    console.log("Min Max Values: ", minMaxValues);
    if (minMaxValues.length === 0) {
        // No valid moves found
        console.log("No valid moves evaluated for AI");
        // Return any valid position to avoid errors
        return {
            value: 0,
            action: nextActionPossiblePositions[0],
            movesPerformed: [],
        };
    }
    // Choose the best move based on player (max for tiger, min for goat)
    // If multiple moves have the same value, pick randomly among them
    let bestMove;
    if (gameBoard.currentPlayer === 2) {
        // Tiger: maximize
        const maxValue = Math.max(...minMaxValues.map((m) => m.value));
        const bestMoves = minMaxValues.filter((m) => m.value === maxValue);
        bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    else {
        // Goat: minimize
        const minValue = Math.min(...minMaxValues.map((m) => m.value));
        const bestMoves = minMaxValues.filter((m) => m.value === minValue);
        bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    console.log(`Best Move: position ${bestMove.action} with score ${bestMove.value}`);
    return bestMove;
}
// const exploredStates = new Map<string, number>()
let nodeIdCounter = 0;
// let globalTreeRoot: TreeNode | null = null
function generateTreeVisualization(gameBoard, selectedAiPlayer, depth = 3) {
    /**
     * Generate a complete tree visualization for the min-max algorithm
     */
    // Reset global state
    // exploredStates.clear()
    nodeIdCounter = 0;
    // globalTreeRoot = null
    // Create initial node
    const rootNode = {
        id: `node_${nodeIdCounter++}`,
        boardState: [...gameBoard.board],
        currentPlayer: gameBoard.currentPlayer,
        depth: 0,
        value: 0,
        action: -1,
        isMaximizing: gameBoard.currentPlayer === selectedAiPlayer,
        children: [],
        alpha: -9999999,
        beta: 9999999,
        isPruned: false,
        gameOver: gameBoard.gameOver,
        winner: gameBoard.winner,
        goatsPlaced: gameBoard.goatsPlacedCount,
        goatsCaptured: gameBoard.goatsCapturedCount,
        selectedPiece: gameBoard.selectedIndexToMove,
        possibleMoves: [],
    };
    console.log("rootnode", rootNode);
    // globalTreeRoot = rootNode
    // Determine valid actions for root
    let possibleActions;
    if (gameBoard.currentPlayer === 1 &&
        gameBoard.goatsPlacedCount < gameBoard.totalGoatsToPlace) {
        possibleActions = gameBoard.getAllEmptyLocations();
    }
    else if (gameBoard.selectedIndexToMove === -1) {
        possibleActions = gameBoard.possibleMovablePieces;
    }
    else {
        possibleActions = gameBoard.possibleMovableDestinations;
    }
    rootNode.possibleMoves = possibleActions;
    // Build tree for each possible action
    for (const action of possibleActions) {
        const childBoard = gameBoard.clone();
        const success = childBoard.performNextMove(action);
        if (success) {
            const childNode = buildMinMaxTree(childBoard, depth - 1, action, childBoard.currentPlayer === selectedAiPlayer, -9999999, 9999999, rootNode, gameBoard.currentPlayer, gameBoard.currentPlayer === selectedAiPlayer);
            rootNode.children.push(childNode);
        }
    }
    // Find best path
    const bestPath = [];
    let currentNode = rootNode;
    while (currentNode.children.length > 0) {
        // Find the child with the best value for ai player based on min max algorithm.
        let bestChild = currentNode.children[0];
        for (const child of currentNode.children) {
            if (currentNode.isMaximizing && child.value > bestChild.value) {
                bestChild = child;
            }
            else if (!currentNode.isMaximizing && child.value < bestChild.value) {
                bestChild = child;
            }
        }
        bestPath.push(bestChild.id);
        currentNode = bestChild;
    }
    const stats = calculateTreeStats(rootNode);
    return {
        rootNode,
        bestPath,
        totalNodes: stats.totalNodes,
        maxDepthReached: stats.maxDepthReached,
        prunedNodes: stats.prunedNodes,
        aiPlayer: selectedAiPlayer,
    };
}
function calculateTreeStats(node) {
    let totalNodes = 1;
    let maxDepthReached = node.depth;
    let prunedNodes = node.isPruned ? 1 : 0;
    for (const child of node.children) {
        const childStats = calculateTreeStats(child);
        totalNodes += childStats.totalNodes;
        maxDepthReached = Math.max(maxDepthReached, childStats.maxDepthReached);
        prunedNodes += childStats.prunedNodes;
    }
    return { totalNodes, maxDepthReached, prunedNodes };
}
function buildMinMaxTree(gameBoard, depth, initialAction, maximizingPlayer, alpha, beta, parent, aiPlayer, isMaximizing) {
    /**
     * Build the complete min-max tree for visualization
     */
    const nodeId = `node_${nodeIdCounter++}`;
    // Create current node
    const currentNode = {
        id: nodeId,
        boardState: [...gameBoard.board],
        currentPlayer: gameBoard.currentPlayer,
        depth: parent.depth + 1,
        value: 0,
        action: initialAction,
        isMaximizing: isMaximizing,
        children: [],
        parent: parent,
        alpha: alpha,
        beta: beta,
        isPruned: false,
        gameOver: gameBoard.gameOver,
        winner: gameBoard.winner,
        goatsPlaced: gameBoard.goatsPlacedCount,
        goatsCaptured: gameBoard.goatsCapturedCount,
        selectedPiece: gameBoard.selectedIndexToMove,
        possibleMoves: [],
    };
    // Base case - leaf node
    if (depth === 0 || gameBoard.gameOver) {
        const value = gameBoard.getValue(aiPlayer);
        currentNode.value = value;
        return currentNode;
    }
    // Determine valid actions
    let nextActionPossiblePositions;
    if (gameBoard.currentPlayer === 1 &&
        gameBoard.goatsPlacedCount < gameBoard.totalGoatsToPlace) {
        nextActionPossiblePositions = gameBoard.getAllEmptyLocations();
    }
    else if (gameBoard.selectedIndexToMove === -1) {
        nextActionPossiblePositions = gameBoard.possibleMovablePieces;
    }
    else {
        nextActionPossiblePositions = gameBoard.possibleMovableDestinations;
    }
    currentNode.possibleMoves = nextActionPossiblePositions;
    if (maximizingPlayer) {
        let value = -9999999;
        for (const nextAction of nextActionPossiblePositions) {
            const gameboardCopy = gameBoard.clone();
            const success = gameboardCopy.performNextMove(nextAction);
            if (!success)
                continue;
            const nextMaximizing = gameboardCopy.currentPlayer === aiPlayer;
            const childNode = buildMinMaxTree(gameboardCopy, depth - 1, nextAction, nextMaximizing, alpha, beta, currentNode, aiPlayer, maximizingPlayer);
            currentNode.children.push(childNode);
            value = Math.max(value, childNode.value);
            alpha = Math.max(alpha, value);
            if (alpha >= beta) {
                // Mark remaining children as pruned
                for (let i = nextActionPossiblePositions.indexOf(nextAction) + 1; i < nextActionPossiblePositions.length; i++) {
                    const prunedNode = {
                        id: `pruned_${nodeIdCounter++}`,
                        boardState: [...gameBoard.board],
                        currentPlayer: gameBoard.currentPlayer,
                        depth: currentNode.depth + 1,
                        value: 0,
                        action: nextActionPossiblePositions[i],
                        isMaximizing: !maximizingPlayer,
                        children: [],
                        parent: currentNode,
                        alpha: alpha,
                        beta: beta,
                        isPruned: true,
                        gameOver: false,
                        winner: -1,
                        goatsPlaced: gameBoard.goatsPlacedCount,
                        goatsCaptured: gameBoard.goatsCapturedCount,
                        selectedPiece: gameBoard.selectedIndexToMove,
                        possibleMoves: [],
                    };
                    currentNode.children.push(prunedNode);
                    break;
                }
                break;
            }
        }
        currentNode.value = value;
    }
    else {
        let value = 9999999;
        for (const nextAction of nextActionPossiblePositions) {
            const gameboardCopy = gameBoard.clone();
            const success = gameboardCopy.performNextMove(nextAction);
            if (!success)
                continue;
            const nextMaximizing = gameboardCopy.currentPlayer === aiPlayer;
            const childNode = buildMinMaxTree(gameboardCopy, depth - 1, nextAction, nextMaximizing, alpha, beta, currentNode, aiPlayer, maximizingPlayer);
            currentNode.children.push(childNode);
            value = Math.min(value, childNode.value);
            beta = Math.min(beta, value);
            if (alpha >= beta) {
                // Mark remaining children as pruned
                for (let i = nextActionPossiblePositions.indexOf(nextAction) + 1; i < nextActionPossiblePositions.length; i++) {
                    const prunedNode = {
                        id: `pruned_${nodeIdCounter++}`,
                        boardState: [...gameBoard.board],
                        currentPlayer: gameBoard.currentPlayer,
                        depth: currentNode.depth + 1,
                        value: 0,
                        action: nextActionPossiblePositions[i],
                        isMaximizing: !maximizingPlayer,
                        children: [],
                        parent: currentNode,
                        alpha: alpha,
                        beta: beta,
                        isPruned: true,
                        gameOver: false,
                        winner: -1,
                        goatsPlaced: gameBoard.goatsPlacedCount,
                        goatsCaptured: gameBoard.goatsCapturedCount,
                        selectedPiece: gameBoard.selectedIndexToMove,
                        possibleMoves: [],
                    };
                    currentNode.children.push(prunedNode);
                    break;
                }
                break;
            }
        }
        currentNode.value = value;
    }
    return currentNode;
}
function minMaxWithAlphaBetaPruning(gameBoard, depth, initialAction, maximizingPlayer, alpha, beta, applyInitialAction, aiPlayer) {
    /**
     * Implement the min-max algorithm with alpha-beta pruning
     */
    if (depth === 0 || gameBoard.gameOver) {
        // Get the value of the board state from current player's perspective
        const value = gameBoard.getValue(aiPlayer);
        return {
            value,
            action: initialAction,
            movesPerformed: gameBoard.movesPerformed,
        };
    }
    // Perform the initial action
    if (applyInitialAction) {
        const success = gameBoard.performNextMove(initialAction);
        if (!success) {
            // If the move is invalid, return a very poor score
            return {
                value: maximizingPlayer ? -999999 : 999999,
                action: initialAction,
                movesPerformed: gameBoard.movesPerformed,
            };
        }
    }
    // Check if the state has been explored before
    // const boardString = gameBoard.board.join("")
    // const playerMarker = gameBoard.currentPlayer === 2 ? "M" : "m"
    // const stateKey = `${boardString}_${playerMarker}_${gameBoard.selectedIndexToMove}_${gameBoard.goatsPlacedCount}_${gameBoard.goatsCapturedCount}`
    // if (exploredStates.has(stateKey)) {
    //   return {
    //     value: exploredStates.get(stateKey)!,
    //     action: initialAction,
    //     movesPerformed: gameBoard.movesPerformed,
    //   }
    // }
    // Determine valid actions based on the current game state
    let nextActionPossiblePositions;
    if (gameBoard.currentPlayer === 1 &&
        gameBoard.goatsPlacedCount < gameBoard.totalGoatsToPlace) {
        // Goat placement phase
        nextActionPossiblePositions = gameBoard.getAllEmptyLocations();
    }
    else if (gameBoard.selectedIndexToMove === -1) {
        // Selection phase - get all movable pieces
        nextActionPossiblePositions = gameBoard.possibleMovablePieces;
    }
    else {
        // Destination selection phase
        nextActionPossiblePositions = gameBoard.possibleMovableDestinations;
    }
    if (maximizingPlayer) {
        // Tiger's turn
        let value = -9999999;
        let movesPerformed = [];
        for (const nextActionPosition of nextActionPossiblePositions) {
            const gameboardCopy = gameBoard.clone();
            const success = gameboardCopy.performNextMove(nextActionPosition);
            if (!success) {
                continue;
            }
            // Next player's turn - reverse maximizing flag
            const nextMaximizing = gameboardCopy.currentPlayer === aiPlayer;
            const result = minMaxWithAlphaBetaPruning(gameboardCopy, depth - 1, initialAction, nextMaximizing, alpha, beta, false, aiPlayer);
            if (result.value > value) {
                value = result.value;
                movesPerformed = result.movesPerformed;
            }
            alpha = Math.max(alpha, value);
            if (alpha >= beta) {
                break;
            }
        }
        // Cache the value for this state
        // exploredStates.set(stateKey, value)
        return { value, action: initialAction, movesPerformed };
    }
    else {
        // Goat's turn
        let value = 9999999;
        let movesPerformed = [];
        for (const nextActionPosition of nextActionPossiblePositions) {
            const gameboardCopy = gameBoard.clone();
            const success = gameboardCopy.performNextMove(nextActionPosition);
            if (!success) {
                continue;
            }
            // Next player's turn - reverse maximizing flag
            const nextMaximizing = gameboardCopy.currentPlayer === aiPlayer;
            const result = minMaxWithAlphaBetaPruning(gameboardCopy, depth - 1, initialAction, nextMaximizing, alpha, beta, false, aiPlayer);
            if (result.value < value) {
                value = result.value;
                movesPerformed = result.movesPerformed;
            }
            beta = Math.min(beta, value);
            if (alpha >= beta) {
                break;
            }
        }
        // Cache the value for this state
        // exploredStates.set(stateKey, value)
        return { value, action: initialAction, movesPerformed };
    }
}
// Export for use in other modules
export { Board, getNextBestMove, minMaxWithAlphaBetaPruning, startGame, generateTreeVisualization, };
// Run the game if this is the main module
if (typeof window === "undefined") {
    // Node.js environment
    startGame();
}
