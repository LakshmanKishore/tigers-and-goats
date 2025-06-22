"""
Python code for min max algorithm with alpha-beta pruning for Tigers and Goats game
"""

import copy
import traceback
import os
import time
import multiprocessing as mp
from typing import List, Literal, Set, Tuple, Dict


class Board:
    def __init__(self):
        self.board: List[int] = [0] * 23
        self.next_action: Literal[
            "selectToPlace", "selectToMove", "selectDestination"
        ] = "selectToPlace"
        self.current_player = 1  # 1->goat, 2->tiger
        self.total_goats_to_place = 15  # Total goats to place
        self.goats_placed_count = 0
        self.goats_captured_count = 0
        self.selected_index_to_move: int = -1
        self.game_over: bool = False
        self.winner: int = -1
        self.possible_movable_destinations: List[int] = []
        self.possible_movable_pieces: List[int] = []
        self.moves_performed: List[int] = []
        self.move_pairs: List[Tuple[int, int]] = []  # Store source-destination pairs
        self.position_history: Dict[str, int] = {}  # For stalemate detection
        self.capture_moves = {}  # Maps destination to captured goat position

        # Initialize tigers at positions 0, 3, 4
        self.board[0] = 2
        self.board[3] = 2
        self.board[4] = 2

        self.reachable_cell_indexes: List[List[int]] = [
            [2, 3, 4, 5],  # 0
            [2, 7],  # 1
            [0, 1, 3, 8],  # 2
            [0, 2, 4, 9],  # 3
            [0, 3, 5, 10],  # 4
            [0, 4, 6, 11],  # 5
            [5, 12],  # 6
            [1, 8, 13],  # 7
            [2, 7, 9, 14],  # 8
            [3, 8, 10, 15],  # 9
            [4, 9, 11, 16],  # 10
            [5, 10, 12, 17],  # 11
            [6, 11, 18],  # 12
            [7, 14],  # 13
            [8, 13, 15, 19],  # 14
            [9, 14, 16, 20],  # 15
            [10, 15, 17, 21],  # 16
            [11, 16, 18, 22],  # 17
            [12, 17],  # 18
            [14, 20],  # 19
            [15, 19, 21],  # 20
            [16, 20, 22],  # 21
            [17, 21],  # 22
        ]

        # Specific jumpable indexes for tigers
        self.tiger_jumpable_indexes: List[List[int]] = [
            [8, 9, 10, 11],  # 0
            [3, 13],  # 1
            [4, 14],  # 2
            [1, 5, 15],  # 3
            [2, 6, 16],  # 4
            [3, 17],  # 5
            [4, 18],  # 6
            [9],  # 7
            [0, 10, 19],  # 8
            [0, 7, 11, 20],  # 9
            [0, 8, 12, 21],  # 10
            [0, 9, 22],  # 11
            [10],  # 12
            [1, 15],  # 13
            [2, 16],  # 14
            [3, 13, 17],  # 15
            [4, 14, 18],  # 16
            [5, 15],  # 17
            [6, 16],  # 18
            [8, 21],  # 19
            [9, 22],  # 20
            [10, 19],  # 21
            [11, 20],  # 22
        ]

        # Which goat positions to check for removal after a tiger jump
        self.goat_removal_after_tiger_jump_indexes: List[List[int]] = [
            [2, 3, 4, 5],  # 0
            [2, 7],  # 1
            [3, 8],  # 2
            [2, 4, 9],  # 3
            [3, 5, 10],  # 4
            [4, 11],  # 5
            [5, 12],  # 6
            [8],  # 7
            [2, 9, 14],  # 8
            [3, 8, 10, 15],  # 9
            [4, 9, 11, 16],  # 10
            [5, 10, 17],  # 11
            [11],  # 12
            [7, 14],  # 13
            [8, 15],  # 14
            [9, 14, 16],  # 15
            [10, 15, 17],  # 16
            [11, 16],  # 17
            [12, 17],  # 18
            [14, 20],  # 19
            [15, 21],  # 20
            [16, 20],  # 21
            [17, 21],  # 22
        ]

    def get_all_empty_locations(self) -> List[int]:
        empty_list: List[int] = []
        for i, ele in enumerate(self.board):
            if ele == 0:
                empty_list.append(i)
        return empty_list

    def check_move_repetition_draw(self) -> bool:
        """
        Check for draw by detecting repeated move sequences.
        Draw condition: When both players repeat their exact sequence of moves twice.
        """
        # Need at least 8 moves to check for repetition (4+4)
        if len(self.move_pairs) < 8:
            return False

        # Get the last 8 moves (4 pairs) to check for repetition
        last_eight_moves = self.move_pairs[-8:]

        # Split into two sequences of 4 moves each
        first_sequence = last_eight_moves[:4]  # First 4 moves
        second_sequence = last_eight_moves[4:]  # Last 4 moves

        # Check if the sequences match
        if first_sequence == second_sequence:
            print("\n==== GAME OVER ====")
            print("Game ends in a DRAW due to move repetition")
            print("Both players have repeated their exact sequence of moves twice:")

            # Format the repeated sequence nicely
            players = ["Goat", "Tiger"] * 2
            for i, ((src, dst), player) in enumerate(zip(first_sequence, players)):
                print(f"  {i + 1}. {player}: {src} → {dst}")
            print("This sequence was repeated twice in succession.")

            print("Final board state:")
            self.display()
            return True

        return False

    def perform_action(self, actionIndex: int):
        """Validate and perform the action at the given index"""
        # Record the move
        self.moves_performed.append(actionIndex)

        # GOAT'S TURN
        if self.current_player == 1:
            if self.goats_placed_count < self.total_goats_to_place:
                # First phase - placing goats
                if self.board[actionIndex] != 0:
                    print("Invalid move: Cell already occupied")
                    return False

                # Place the goat
                self.board[actionIndex] = 1
                self.goats_placed_count += 1

                # During placement phase, we record the placement as a move from -1 to actionIndex
                self.move_pairs.append((-1, actionIndex))
            else:
                # Second phase - moving goats
                if self.selected_index_to_move == -1:
                    # Selecting a goat to move
                    if self.board[actionIndex] != 1:
                        print("Invalid move: Must select a goat to move")
                        return False

                    # Check if the goat has any valid moves
                    valid_destinations = []
                    for neighbor in self.reachable_cell_indexes[actionIndex]:
                        if self.board[neighbor] == 0:
                            valid_destinations.append(neighbor)

                    if not valid_destinations:
                        print("Invalid move: No valid destinations for this goat")
                        return False

                    # Set up for destination selection
                    self.selected_index_to_move = actionIndex
                    self.possible_movable_destinations = valid_destinations
                    return True
                else:
                    # Selecting a destination for the goat
                    if (
                        actionIndex
                        not in self.reachable_cell_indexes[self.selected_index_to_move]
                    ):
                        print("Invalid move: Not a reachable destination")
                        return False

                    if self.board[actionIndex] != 0:
                        print("Invalid move: Destination cell is occupied")
                        return False

                    # Move the goat
                    self.board[self.selected_index_to_move] = 0
                    self.board[actionIndex] = 1

                    # Record the move pair (source, destination)
                    self.move_pairs.append((self.selected_index_to_move, actionIndex))

                    self.selected_index_to_move = -1
                    self.possible_movable_destinations = []

        # TIGER'S TURN
        else:  # self.current_player == 2
            if self.selected_index_to_move == -1:
                # Selecting a tiger to move
                if self.board[actionIndex] != 2:
                    print("Invalid move: Must select a tiger to move")
                    return False

                # Find valid moves for the tiger (including captures)
                valid_moves = []
                capture_moves = {}  # Maps destination to captured goat position

                # Check adjacent empty cells (normal moves)
                for neighbor in self.reachable_cell_indexes[actionIndex]:
                    if self.board[neighbor] == 0:  # Empty cell
                        valid_moves.append(neighbor)

                # Check jumpable positions for captures
                for i, jump_index in enumerate(
                    self.tiger_jumpable_indexes[actionIndex]
                ):
                    if (
                        i < len(self.goat_removal_after_tiger_jump_indexes[actionIndex])
                        and self.board[jump_index] == 0
                    ):  # Empty destination
                        # Get the goat removal index for this jump
                        goat_removal_index = self.goat_removal_after_tiger_jump_indexes[
                            actionIndex
                        ][i]
                        # Check if there's a goat at the removal position
                        if self.board[goat_removal_index] == 1:  # Found a goat
                            capture_moves[jump_index] = goat_removal_index

                all_destinations = valid_moves + list(capture_moves.keys())
                if not all_destinations:
                    print("Invalid move: No valid destinations for this tiger")
                    return False

                # Set up for destination selection
                self.selected_index_to_move = actionIndex
                self.possible_movable_destinations = all_destinations
                # Store capture information for later use
                self.capture_moves = capture_moves
                return True
            else:
                # Selecting a destination for the tiger
                if (
                    actionIndex
                    in self.tiger_jumpable_indexes[self.selected_index_to_move]
                ):
                    # This is a jump/capture move
                    if self.board[actionIndex] != 0:
                        print("Invalid move: Destination cell is occupied")
                        return False

                    # Find the index of this destination in the jumpable indexes
                    jumpable_index = self.tiger_jumpable_indexes[
                        self.selected_index_to_move
                    ].index(actionIndex)

                    if jumpable_index >= len(
                        self.goat_removal_after_tiger_jump_indexes[
                            self.selected_index_to_move
                        ]
                    ):
                        print("Invalid move: No valid goat to capture")
                        return False

                    # Get the corresponding goat removal index
                    goat_removal_index = self.goat_removal_after_tiger_jump_indexes[
                        self.selected_index_to_move
                    ][jumpable_index]

                    # Check if there's a goat at the removal position
                    if self.board[goat_removal_index] != 1:
                        print("Invalid move: No goat to capture")
                        return False

                    # Move the tiger and capture the goat
                    self.board[self.selected_index_to_move] = 0
                    self.board[actionIndex] = 2
                    self.board[goat_removal_index] = 0
                    self.goats_captured_count += 1

                    # Record the move pair with captured goat info
                    self.move_pairs.append((self.selected_index_to_move, actionIndex))

                elif (
                    actionIndex
                    in self.reachable_cell_indexes[self.selected_index_to_move]
                ):
                    # This is a normal move
                    if self.board[actionIndex] != 0:
                        print("Invalid move: Destination cell is occupied")
                        return False

                    # Move the tiger
                    self.board[self.selected_index_to_move] = 0
                    self.board[actionIndex] = 2

                    # Record the move pair
                    self.move_pairs.append((self.selected_index_to_move, actionIndex))
                else:
                    print("Invalid move: Not a valid destination")
                    return False

                self.selected_index_to_move = -1
                self.possible_movable_destinations = []
                self.capture_moves = {}

        # Check for draw by move repetition after completing a move
        # Only check when we have enough moves recorded
        if len(self.move_pairs) >= 8:
            if self.check_move_repetition_draw():
                self.game_over = True
                self.winner = 0  # Draw
                return True

        # Switch player and determine next action
        self.current_player = 3 - self.current_player  # Switch between 1 and 2

        # Check win conditions
        self.check_win_conditions()

        # Update movable pieces for the current player
        self.update_possible_movable_pieces()

        return True

    def perform_next_move(self, index: int):
        """Wrapper for perform_action to maintain compatibility with existing code"""
        return self.perform_action(index)

    def check_win_conditions(self):
        """Check if the game has ended"""
        # Tigers win if they capture ALL goats
        # Calculate how many goats are on the board
        goats_on_board = sum(1 for cell in self.board if cell == 1)
        total_goats = self.goats_placed_count - self.goats_captured_count

        if total_goats == 0 and self.goats_placed_count == self.total_goats_to_place:
            print("\n==== GAME OVER ====")
            print("Tigers WIN!")
            print(f"Tigers have captured all {self.goats_captured_count} goats")
            print("Final board state:")
            self.display()
            self.game_over = True
            self.winner = 2  # Tiger wins
            return

        # Goats win if all tigers are blocked
        if self.current_player == 2:  # Only check when it's tiger's turn
            tigers_blocked = True
            tiger_positions = self.get_player_indexes(self.board, 2)

            for tiger_pos in tiger_positions:
                # Check normal moves
                for neighbor in self.reachable_cell_indexes[tiger_pos]:
                    if self.board[neighbor] == 0:
                        tigers_blocked = False
                        break

                if tigers_blocked:
                    # Check capture moves
                    for i, jump_index in enumerate(
                        self.tiger_jumpable_indexes[tiger_pos]
                    ):
                        if (
                            i
                            < len(self.goat_removal_after_tiger_jump_indexes[tiger_pos])
                            and self.board[jump_index] == 0
                        ):  # Empty destination
                            # Get the goat removal index for this jump
                            goat_removal_index = (
                                self.goat_removal_after_tiger_jump_indexes[tiger_pos][i]
                            )
                            # Check if there's a goat at the removal position
                            if self.board[goat_removal_index] == 1:
                                tigers_blocked = False
                                break

                        if not tigers_blocked:
                            break

                if not tigers_blocked:
                    break

            if tigers_blocked and len(tiger_positions) > 0:
                print("\n==== GAME OVER ====")
                print("Goats WIN!")
                print("All tigers are blocked from moving")
                print("Final board state:")
                self.display()
                self.game_over = True
                self.winner = 1  # Goat wins
                return

    def update_possible_movable_pieces(self):
        """Update the list of pieces that can be moved by the current player"""
        self.possible_movable_pieces = []

        if self.current_player == 1:
            if self.goats_placed_count < self.total_goats_to_place:
                # In placement phase, goats don't move
                return

            # Get all goats
            goat_positions = self.get_player_indexes(self.board, 1)

            for goat_pos in goat_positions:
                # Check if the goat can move to any adjacent empty cell
                for neighbor in self.reachable_cell_indexes[goat_pos]:
                    if self.board[neighbor] == 0:
                        self.possible_movable_pieces.append(goat_pos)
                        break
        else:
            # Get all tigers
            tiger_positions = self.get_player_indexes(self.board, 2)

            for tiger_pos in tiger_positions:
                can_move = False

                # Check normal moves
                for neighbor in self.reachable_cell_indexes[tiger_pos]:
                    if self.board[neighbor] == 0:
                        can_move = True
                        break

                # Check capture moves
                if not can_move:
                    for i, jump_index in enumerate(
                        self.tiger_jumpable_indexes[tiger_pos]
                    ):
                        if (
                            i
                            < len(self.goat_removal_after_tiger_jump_indexes[tiger_pos])
                            and self.board[jump_index] == 0
                        ):  # Empty destination
                            # Get the goat removal index for this jump
                            goat_removal_index = (
                                self.goat_removal_after_tiger_jump_indexes[tiger_pos][i]
                            )
                            # Check if there's a goat at the removal position
                            if self.board[goat_removal_index] == 1:
                                can_move = True
                                break

                        if can_move:
                            break

                if can_move:
                    self.possible_movable_pieces.append(tiger_pos)

    def get_player_indexes(self, board: List[int], player: int) -> List[int]:
        """Get positions of all pieces for a given player"""
        return [i for i, x in enumerate(board) if x == player]

    def count_blocked_tigers(self) -> int:
        """Count how many tigers are blocked"""
        blocked_tigers = 0
        tiger_positions = self.get_player_indexes(self.board, 2)

        for tiger_pos in tiger_positions:
            is_blocked = True

            # Check normal moves
            for neighbor in self.reachable_cell_indexes[tiger_pos]:
                if self.board[neighbor] == 0:
                    is_blocked = False
                    break

            if is_blocked:
                # Check capture moves
                for i, jump_index in enumerate(self.tiger_jumpable_indexes[tiger_pos]):
                    if (
                        i < len(self.goat_removal_after_tiger_jump_indexes[tiger_pos])
                        and self.board[jump_index] == 0
                    ):  # Empty destination
                        # Get the goat removal index for this jump
                        goat_removal_index = self.goat_removal_after_tiger_jump_indexes[
                            tiger_pos
                        ][i]
                        # Check if there's a goat at the removal position
                        if self.board[goat_removal_index] == 1:
                            is_blocked = False
                            break

                    if not is_blocked:
                        break

            if is_blocked:
                blocked_tigers += 1

        return blocked_tigers

    def count_capturable_goats(self) -> int:
        """Count how many goats can be captured in the next move"""
        capturable_goats = 0
        tiger_positions = self.get_player_indexes(self.board, 2)

        for tiger_pos in tiger_positions:
            # Check jumpable positions for captures
            for i, jump_index in enumerate(self.tiger_jumpable_indexes[tiger_pos]):
                if (
                    i < len(self.goat_removal_after_tiger_jump_indexes[tiger_pos])
                    and self.board[jump_index] == 0
                ):  # Empty destination
                    # Get the goat removal index for this jump
                    goat_removal_index = self.goat_removal_after_tiger_jump_indexes[
                        tiger_pos
                    ][i]
                    # Check if there's a goat at the removal position
                    if self.board[goat_removal_index] == 1:
                        capturable_goats += 1

        return capturable_goats

    def get_value(self, player: int, print_heuristics: bool = False) -> int:
        """Evaluate the board state from a player's perspective"""
        # Features:
        # A: blocked tigers (range 0-3)
        # B: goats captured (range 0-15)
        # C: goats that can be captured next move (range 0-15)

        blocked_tigers = self.count_blocked_tigers()
        goats_captured = self.goats_captured_count
        capturable_goats = self.count_capturable_goats()

        # Updated the bonus to reflect the "capture all goats" win condition
        all_goats_captured = self.goats_captured_count == self.total_goats_to_place

        # Using the heuristic design from option 3 (threshold/non-linear bonuses)
        if player == 2:  # Tiger's perspective
            score = (
                (-10 * blocked_tigers)
                + (6 * goats_captured)
                + (3 * capturable_goats)
                + (100 * (1 if all_goats_captured else 0))
                - (100 * (1 if blocked_tigers == 3 else 0))
            )
        else:  # Goat's perspective
            score = (
                (10 * blocked_tigers)
                - (6 * goats_captured)
                - (3 * capturable_goats)
                - (100 * (1 if all_goats_captured else 0))
                + (100 * (1 if blocked_tigers == 3 else 0))
            )

        if print_heuristics:
            print(f"""
            blocked_tigers: {blocked_tigers}
            goats_captured: {goats_captured}/{self.total_goats_to_place}
            capturable_goats: {capturable_goats}
            player perspective: {"Tiger" if player == 2 else "Goat"}
            score: {score}
            """)

        return score

    def declare_winner(self, player: int) -> None:
        """Declare the winner and end the game"""
        if player == 0:
            print("\n==== GAME OVER ====")
            print("Game ends in a DRAW")
            print("Final board state:")
            self.display()
        else:
            print("\n==== GAME OVER ====")
            print(
                f"Player {player} ({'Goat' if player == 1 else 'Tiger'}) has WON the game!"
            )
            if player == 1:
                print("All tigers are blocked from moving")
            else:
                print(f"Tigers have captured all {self.goats_captured_count} goats")
            print("Final board state:")
            self.display()

        self.game_over = True
        self.winner = player
        return

    def display(self) -> None:
        """Display the current board state"""
        format = """
                    {0}_00
   {1}_01     {2}_02  {3}_03  {4}_04  {5}_05     {6}_06
   {7}_07    {8}_08  {9}_09    {10}_10  {11}_11    {12}_12
   {13}_13   {14}_14  {15}_15      {16}_16  {17}_17   {18}_18
         {19}_19  {20}_20        {21}_21  {22}_22

   """

        # Replace each position with the actual board value
        board_values = []
        for i in range(23):
            value = self.board[i]
            display_value = "." if value == 0 else ("G" if value == 1 else "T")
            board_values.append(display_value)

        print(format.format(*board_values))
        # Show game statistics
        print(f"Goats placed: {self.goats_placed_count}/{self.total_goats_to_place}")
        print(
            f"Goats captured: {self.goats_captured_count}/{self.total_goats_to_place}"
        )
        print(f"Goats on board: {self.goats_placed_count - self.goats_captured_count}")
        if self.current_player == 1:
            print("Current turn: Goat")
        else:
            print("Current turn: Tiger")

        # Display recent move history
        if len(self.move_pairs) > 0:
            print("\nRecent moves (source, destination):")
            start = max(0, len(self.move_pairs) - 8)  # Show up to 8 recent moves
            for i, (src, dst) in enumerate(self.move_pairs[start:]):
                player = "Goat" if (i + start) % 2 == 0 else "Tiger"
                print(f"{start + i + 1}. {player}: {src} → {dst}")


def show_menu() -> Tuple[bool, bool]:
    """
    Show the game menu and get player selections
    Returns: (is_goat_human, is_tiger_human)
    """
    current_date = "2025-06-12 13:17:29"  # Using provided date
    current_user = "LakshmanKishore"  # Using provided username

    print("╔═════════════════════════════════════════════╗")
    print("║         TIGERS AND GOATS - GAME MENU        ║")
    print("╠═════════════════════════════════════════════╣")
    print(f"║ Current Date and Time: {current_date}       ║")
    print(f"║ User: {current_user:<35} ║")
    print("╠═════════════════════════════════════════════╣")
    print("║ Select Game Mode:                           ║")
    print("║                                             ║")
    print("║ 1. Human vs Human                           ║")
    print("║ 2. Human (Goat) vs AI (Tiger)               ║")
    print("║ 3. AI (Goat) vs Human (Tiger)               ║")
    print("║ 4. AI vs AI (Demo)                          ║")
    print("║                                             ║")
    print("║ 0. Exit Game                                ║")
    print("╚═════════════════════════════════════════════╝")

    while True:
        try:
            choice = input("Enter your choice (0-4): ")

            if choice == "0":
                print("Exiting game. Thank you for playing!")
                exit(0)

            choice = int(choice)
            if choice < 1 or choice > 4:
                print("Invalid choice. Please enter a number between 1 and 4.")
                continue

            # Return player types based on selection
            if choice == 1:  # Human vs Human
                return (True, True)
            elif choice == 2:  # Human (Goat) vs AI (Tiger)
                return (True, False)
            elif choice == 3:  # AI (Goat) vs Human (Tiger)
                return (False, True)
            elif choice == 4:  # AI vs AI
                return (False, False)

        except ValueError:
            print("Invalid input. Please enter a number.")


def start_game():
    """Start and run the game"""
    print(f"Tigers and Goats Game - {time.strftime('%Y-%m-%d %H:%M:%S')}")

    # Show menu and get player selections
    is_goat_human, is_tiger_human = show_menu()

    # Display game information based on selected mode
    print("\n===============================================")
    print("           TIGERS AND GOATS GAME               ")
    print("===============================================")

    if is_goat_human and is_tiger_human:
        print("Game Mode: Human vs Human")
    elif is_goat_human:
        print("Game Mode: Human (Goat) vs AI (Tiger)")
    elif is_tiger_human:
        print("Game Mode: AI (Goat) vs Human (Tiger)")
    else:
        print("Game Mode: AI vs AI (Demo)")

    print("\nRules:")
    print("- Goats: Place goats in empty cells, then move to adjacent empty cells")
    print("- Tigers: Move to adjacent empty cells or jump over goats to capture them")
    print("- Tigers win by capturing ALL goats")
    print("- Goats win by blocking all tigers from moving")
    print(
        "- Game ends in a draw if both players repeat their exact sequence of moves twice"
    )
    print("\nInitial board: Tigers at positions 0, 3, 4")
    print("===============================================\n")

    game_board = Board()

    while True:
        if game_board.game_over:
            break

        game_board.display()

        current_action = (
            "selectToPlace"
            if game_board.current_player == 1
            and game_board.goats_placed_count < game_board.total_goats_to_place
            else "selectToMove"
            if game_board.selected_index_to_move == -1
            else "selectDestination"
        )
        current_player = "Goat" if game_board.current_player == 1 else "Tiger"
        is_current_player_human = (
            is_goat_human if game_board.current_player == 1 else is_tiger_human
        )

        print(f"Next Action: {current_action}")
        print(
            f"Current Player: {current_player} ({'Human' if is_current_player_human else 'AI'})"
        )

        if (
            game_board.current_player == 1
            and game_board.goats_placed_count < game_board.total_goats_to_place
        ):
            print(
                f"Remaining Goats to be placed: {game_board.total_goats_to_place - game_board.goats_placed_count}"
            )

        if game_board.selected_index_to_move != -1:
            print(
                f"Possible destinations for index {game_board.selected_index_to_move} are: {game_board.possible_movable_destinations}"
            )

        if game_board.selected_index_to_move == -1 and (
            game_board.current_player == 2
            or (
                game_board.current_player == 1
                and game_board.goats_placed_count >= game_board.total_goats_to_place
            )
        ):
            print(
                f"Possible moves for {current_player} are: {game_board.possible_movable_pieces}"
            )

        # Check if current player is AI
        if not is_current_player_human:
            print(f"\n{current_player} (AI) is thinking...")
            best_move = get_next_best_move(game_board)
            print(f"{current_player} (AI) chooses position {best_move[1]}")
            success = game_board.perform_next_move(best_move[1])

            # If the move failed, try a different approach
            if (
                not success
                and game_board.current_player == 1
                and game_board.goats_placed_count < game_board.total_goats_to_place
            ):
                # For goat placement phase, just pick any empty spot
                print(f"{current_player} (AI) retrying with a random empty location...")
                empty_spots = game_board.get_all_empty_locations()
                if empty_spots:
                    random_spot = empty_spots[0]  # Just pick the first available spot
                    print(f"{current_player} (AI) chooses position {random_spot}")
                    game_board.perform_next_move(random_spot)
                else:
                    print("No valid moves available - game may be in an invalid state")

            continue

        # Human player's turn
        index = input(f"\nEnter your move ({current_player}), or 'q' to quit: ")

        if index.lower() == "q":
            print("Game ended by player.")
            break

        try:
            index = int(index)

            # For testing purposes
            if index == 25:
                # Print the score of the current state of the board
                print("Score: ", game_board.get_value(2, True))
                continue

            if index == 26:
                # Perform min max on the current state of the board
                best_move = get_next_best_move(game_board)
                game_board.perform_next_move(best_move[1])
                continue

            elif index < 0 or index > 22:
                raise ValueError

        except ValueError:
            print("Invalid Input. Please enter a number between 0 and 22.")
            continue

        except Exception as e:
            print("Error: ", e)
            traceback.print_exc()
            continue

        success = game_board.perform_next_move(index)
        if not success:
            print("Move failed. Try again.")


def get_next_best_move(game_board: Board) -> Tuple[int, int, List[int]]:
    """Use min-max with alpha-beta pruning to find the best move for the AI"""
    # Determine valid actions based on the current game state
    if (
        game_board.current_player == 1
        and game_board.goats_placed_count < game_board.total_goats_to_place
    ):
        # During goat placement phase, place on any empty cell
        next_action_possible_positions = game_board.get_all_empty_locations()
        depth = 2  # Use lower depth during placement phase
    elif game_board.selected_index_to_move == -1:
        # If no piece is selected, get all movable pieces
        next_action_possible_positions = game_board.possible_movable_pieces
        depth = 3  # Default depth
    else:
        # If a piece is selected, get all possible destinations
        next_action_possible_positions = game_board.possible_movable_destinations
        depth = 3  # Default depth

    # Ensure we have valid positions
    if not next_action_possible_positions:
        print("No valid moves found for AI")
        # Try to find any empty spot as a fallback
        if (
            game_board.current_player == 1
            and game_board.goats_placed_count < game_board.total_goats_to_place
        ):
            empty_spots = game_board.get_all_empty_locations()
            if empty_spots:
                return (0, empty_spots[0], [])

        # Return a default value if no valid moves are found
        return (-999999, 0, [])

    # Increase depth for endgame situations
    if game_board.goats_captured_count >= 3 or game_board.count_blocked_tigers() >= 2:
        depth = 4

    # For each next action get the min max value and store it and choose the best one.
    min_max_values: List[Tuple[int, int, List[int]]] = []

    start_time = time.time()
    with mp.Pool() as pool:
        results = []
        # Determine if we should maximize or minimize based on current player
        is_maximizing = game_board.current_player == 2  # Maximize for tiger

        args: List[Tuple[Board, int, int, bool, int, int, bool]] = [
            (
                copy.deepcopy(game_board),
                depth,
                next_action,
                is_maximizing,  # Maximize for Tiger, minimize for Goat
                -9999999999,
                9999999999,
                True,
            )  # type: ignore
            for next_action in next_action_possible_positions
        ]

        results = pool.starmap(min_max_with_alpha_beta_pruning, args)
        # Wait until all the processes are finished.
        pool.close()
        pool.join()

        min_max_values = results

    end_time = time.time()
    print(f"Time taken: {end_time - start_time:.2f} seconds")
    print("Min Max Values: ", min_max_values)

    if not min_max_values:
        # No valid moves found
        print("No valid moves evaluated for AI")
        # Return any valid position to avoid errors
        return (0, next_action_possible_positions[0], [])

    # Choose the best move based on player (max for tiger, min for goat)
    if game_board.current_player == 2:  # Tiger
        best_move = max(min_max_values, key=lambda x: x[0])
    else:  # Goat
        best_move = min(min_max_values, key=lambda x: x[0])

    print(f"Best Move: position {best_move[1]} with score {best_move[0]}")

    return best_move


explored_states: Dict[str, int] = {}


def min_max_with_alpha_beta_pruning(
    game_board: Board,
    depth: int,
    initial_action: int,
    maximizing_player: bool,
    alpha: int,
    beta: int,
    apply_initial_action: bool,
) -> Tuple[int, int, List[int]]:
    """Implement the min-max algorithm with alpha-beta pruning"""
    global explored_states

    if depth == 0 or game_board.game_over:
        # Get the value of the board state from current player's perspective
        # Always evaluate as tiger's perspective, then negate for goat if needed
        value = game_board.get_value(2)  # Tiger's perspective
        if not maximizing_player and game_board.current_player == 1:
            value = -value  # Negate for goat's perspective when minimizing

        return value, initial_action, game_board.moves_performed

    # Perform the initial action
    if apply_initial_action:
        print(
            f"Process {initial_action} {os.getpid()}, {mp.current_process().pid} is started"
        )
        success = game_board.perform_next_move(initial_action)
        if not success:
            # If the move is invalid, return a very poor score
            return (
                -999999 if maximizing_player else 999999,
                initial_action,
                game_board.moves_performed,
            )

    # Check if the state has been explored before
    board_string = "".join(map(str, game_board.board))
    player_marker = "M" if maximizing_player else "m"
    state_key = f"{board_string}_{player_marker}"

    if state_key in explored_states:
        return explored_states[state_key], initial_action, game_board.moves_performed

    # Determine valid actions based on the current game state
    if (
        game_board.current_player == 1
        and game_board.goats_placed_count < game_board.total_goats_to_place
    ):
        # Goat placement phase
        next_action_possible_positions = game_board.get_all_empty_locations()
    elif game_board.selected_index_to_move == -1:
        # Selection phase - get all movable pieces
        next_action_possible_positions = game_board.possible_movable_pieces
    else:
        # Destination selection phase
        next_action_possible_positions = game_board.possible_movable_destinations

    if maximizing_player:  # Tiger's turn
        value = -9999999
        moves_performed = []

        for next_action_position in next_action_possible_positions:
            game_board_copied: Board = copy.deepcopy(game_board)  # type: ignore
            success = game_board_copied.perform_next_move(next_action_position)

            if not success:
                continue

            # Next player's turn - reverse maximizing flag
            next_maximizing = game_board_copied.current_player == 2

            min_max_value, _, next_moves_performed = min_max_with_alpha_beta_pruning(
                game_board_copied,
                depth - 1,
                initial_action,
                next_maximizing,
                alpha,
                beta,
                False,
            )

            if min_max_value > value:
                value = min_max_value
                moves_performed = next_moves_performed

            alpha = max(alpha, value)
            if alpha >= beta:
                break

        # Cache the value for this state
        explored_states[state_key] = value
        return value, initial_action, moves_performed
    else:  # Goat's turn
        value = 9999999
        moves_performed = []

        for next_action_position in next_action_possible_positions:
            game_board_copied: Board = copy.deepcopy(game_board)  # type: ignore
            success = game_board_copied.perform_next_move(next_action_position)

            if not success:
                continue

            # Next player's turn - reverse maximizing flag
            next_maximizing = game_board_copied.current_player == 2

            min_max_value, _, next_moves_performed = min_max_with_alpha_beta_pruning(
                game_board_copied,
                depth - 1,
                initial_action,
                next_maximizing,
                alpha,
                beta,
                False,
            )

            if min_max_value < value:
                value = min_max_value
                moves_performed = next_moves_performed

            beta = min(beta, value)
            if alpha >= beta:
                break

        # Cache the value for this state
        explored_states[state_key] = value
        return value, initial_action, moves_performed


if __name__ == "__main__":
    start_game()
