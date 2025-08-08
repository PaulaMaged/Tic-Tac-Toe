const game = (function (
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const players = [
    {
      name: playerOneName,
      token: 1,
    },
    {
      name: playerTwoName,
      token: 2,
    },
  ];

  const generateBoard = () => {
    let board = [];
    for (let i = 0; i < 3; i++) {
      board[i] = [];
      for (let j = 0; j < 3; j++) {
        board[i].push(Cell(i, j));
      }
    }

    return board;
  };

  let activePlayer = players[0];
  let board = generateBoard();

  const printBoard = () => {
    let stringOutput = "";
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (j == 2) {
          stringOutput += board[i][j].getToken();
        } else {
          stringOutput += `${board[i][j].getToken()}|`;
        }

        if (j == 2 && i != 2) {
          stringOutput += "\n------\n";
        }
      }
    }

    console.log(stringOutput);
  };

  function Cell(i, j) {
    let token = 0;
    const position = { row: i, column: j };

    const getToken = () => token;
    const setToken = (value) => (token = value);
    const getPosition = () => position;
    return {
      setToken,
      getToken,
      getPosition,
    };
  }

  const setPlayerNames = (playerOneName, playerTwoName) => {
    players[0].name = playerOneName;
    players[1].name = playerTwoName;
  };

  const playRound = (i, j) => {
    if (!isValidMove(i, j)) {
      return;
    }

    board[i][j].setToken(activePlayer.token);
    if (isGameEnd(board[i][j])) {
      endGame();
      return;
    }

    activePlayer = activePlayer === players[0] ? players[1] : players[0];
    console.log(`${activePlayer.name}'s Turn`);
  };

  const isValidMove = (i, j) => {
    if (board[i][j].getToken() != 0) {
      console.log("Invalid move, cell is occupied!");
      return false;
    } else if (i < 0 || i > 2 || j < 0 || j > 2) {
      console.log("Move is outside board boundaries");
      return false;
    } else {
      return true;
    }
  };

  const isGameEnd = (lastCellPlayed) => {
    currentToken = lastCellPlayed.getToken();

    //check horizontal
    const row = lastCellPlayed.getPosition().row;
    let isHorizontalStreak = true;

    for (let i = 0; i < 3; i++) {
      if (board[row][i].getToken() != currentToken) {
        isHorizontalStreak = false;
        break;
      }
    }

    if (isHorizontalStreak) return true;

    //check for vertical
    const column = lastCellPlayed.getPosition().column;
    let isVerticalStreak = true;

    for (let i = 0; i < 3; i++) {
      if (board[i][column].getToken() != currentToken) {
        isVerticalStreak = false;
        break;
      }
    }

    if (isVerticalStreak) return true;

    //two diagnoals to check

    //first the top left to bottom right diagonal
    let isTopLeftToBottomRightDiagonalStreak = true;
    for (let i = 0; i < 3; i++) {
      if (board[i][i].getToken() != currentToken) {
        isTopLeftToBottomRightDiagonalStreak = false;
        break;
      }
    }

    if (isTopLeftToBottomRightDiagonalStreak) return true;

    //second the bottom left to top right diagonal
    let isBottomLeftToTopRightDiagonalStreak = true;
    for (let i = 2; i >= 0; i--) {
      let column = 2 - i;
      if (board[i][column].getToken() != currentToken) {
        isBottomLeftToTopRightDiagonalStreak = false;
        break;
      }
    }

    if (isBottomLeftToTopRightDiagonalStreak) return true;

    return false;
  };

  const endGame = () => {
    console.log(`${activePlayer.name} Won!`);
    printBoard();
    restartGame();
  };

  const restartGame = () => {
    activePlayer = players[0];
    board = generateBoard();
  };

  return {
    setPlayerNames,
    playRound,
  };
})();
