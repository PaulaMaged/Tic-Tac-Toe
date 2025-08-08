const gameBoard = (function () {
  const generateBoard = (emptyToken) => {
    let board = [];
    for (let i = 0; i < 3; i++) {
      board[i] = [];
      for (let j = 0; j < 3; j++) {
        board[i].push(Cell(emptyToken, i, j));
      }
    }

    return board;
  };

  const printBoard = (board) => {
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

  return { generateBoard, printBoard };
})();

function Cell(emptyToken, i, j) {
  let token = emptyToken;
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

const gameController = (function (
  playerOneName = "Player One",
  playerOneToken = "X",
  playerTwoName = "Player Two",
  playerTwoToken = "O",
  emptyToken = ""
) {
  const players = [
    {
      name: playerOneName,
      token: playerOneToken,
      wins: 0,
    },
    {
      name: playerTwoName,
      token: playerTwoToken,
      wins: 0,
    },
  ];

  let isGameRunning = false;
  let startingPlayer = players[0];
  let activePlayer = players[0];
  let board;

  const startNewGame = () => {
    isGameRunning = true;
    board = gameBoard.generateBoard(emptyToken);

    //reset wins
    for (let player of players) {
      player.wins = 0;
    }

    activePlayer = players[0];
  };

  const getBoard = () => {
    let boardRep = [];
    for (let i = 0; i < 3; i++) {
      boardRep[i] = [];
      for (let j = 0; j < 3; j++) {
        boardRep[i].push(board[i][j].getToken());
      }
    }
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
    console.log({ i, j });
    if (board[i][j].getToken() != emptyToken) {
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
    const currentToken = lastCellPlayed.getToken();

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
    gameBoard.printBoard(board);
    console.log(`${players[0].name}:`);
  };

  const restartGame = () => {
    activePlayer = startingPlayer == players[0] ? players[1] : players[0];
    board = board.generateBoard();
  };

  const getStatus = () => {
    return [Object.assign({}, players[0]), Object.assign({}, players[1])];
  };

  return {
    startNewGame,
    playRound,
    getStatus,
    getBoard,
    restartGame,
  };
})();

const screenController = ((gameController) => {
  //Cache DOM elements
  const elBoard = document.querySelector(".board");

  //create necessary layout for displaying information
  const init = () => {
    gameController.startNewGame();
    //create and add elements to status
    for (let i = 0; i < 9; i++) {
      const gameCell = document.createElement("div");
      gameCell.textContent = "X";
      gameCell.classList.add("cell");
      const gameCellContainer = document.createElement("div");
      gameCellContainer.addEventListener("click", handleOnClick);
      gameCellContainer.dataset.position = i.toString();
      gameCellContainer.classList.add("cell-container");
      gameCellContainer.appendChild(gameCell);
      elBoard.appendChild(gameCellContainer);
    }
  };

  //render board and status (active player and win count)
  const render = () => {};

  function random(number) {
    return Math.floor(Math.random() * (number + 1));
  }

  //register events from clicking cells on game board
  function handleOnClick(e) {
    const ordinalPosition = e.currentTarget.dataset.position;
    const row = Math.trunc(ordinalPosition / 3);
    const column = ordinalPosition % 3;
    gameController.playRound(row, column);
    console.log({ ordinalPosition, row, column });
  }

  //invoke restart game method
  const restartGame = () => {};

  //invoke startNewGame method
  const startNewGame = () => {};

  return {
    init,
    render,
    restartGame,
    startNewGame,
  };
})(gameController);

screenController.init();
