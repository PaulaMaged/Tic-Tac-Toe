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
        let stringOutput = '';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const char = board[i][j] == '' ? ' ' : board[i][j].getToken();
                if (j == 2) {
                    stringOutput += `\t${char}`;
                } else {
                    stringOutput += `\t${char}\t|`;
                }

                if (j == 2 && i != 2) {
                    stringOutput += '\n--------------------------\n';
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

const gameController = (function () {
    const _emptyToken = '';
    let _players = null;
    let _activePlayer = null;
    let _lastTurnStats = {
        position: [],
        player: null,
    };

    let _turn = null;

    let _gameStatus = {
        isGameOver: null,
        gameOverReason: null,
        winningConfiguration: null,
    };

    let _board;

    const _winningConfigurations = (() => {
        //re-implement winning check
        const _winningConfigurations = [];

        //horizontal winning configurations
        for (let i = 0; i < 3; i++) {
            _winningConfigurations.push([]);
            for (let j = 0; j < 3; j++) {
                _winningConfigurations[i].push([i, j]);
            }
        }

        //vertical winning configurations
        for (let i = 3; i < 6; i++) {
            _winningConfigurations.push([]);
            for (let j = 0; j < 3; j++) {
                const columnIndex = i - 3;
                _winningConfigurations[i].push([j, columnIndex]);
            }
        }

        //diagonal winning configurations
        _winningConfigurations.push([
            [0, 0],
            [1, 1],
            [2, 2],
        ]);

        _winningConfigurations.push([
            [2, 0],
            [1, 1],
            [0, 2],
        ]);

        return _winningConfigurations;
    })();

    const startNewGame = (
        players = [
            { name: 'Player One', token: 'X' },
            { name: 'Player Two', token: 'O' },
        ],
        startingPlayer = players[0],
    ) => {
        _board = gameBoard.generateBoard(_emptyToken);

        _players = players;
        _activePlayer = startingPlayer;
        _lastTurnStats = {
            position: [],
            player: null,
        };

        _gameStatus = {
            isGameOver: false,
            gameOverReason: null,
            winningConfiguration: null,
        };

        _turn = 1;
    };

    const getBoard = () => {
        let boardCopy = [];
        for (let i = 0; i < 3; i++) {
            boardCopy[i] = [];
            for (let j = 0; j < 3; j++) {
                boardCopy[i].push(_board[i][j].getToken());
            }
        }
        return boardCopy;
    };

    const playTurn = (i, j) => {
        const turnStatus = {
            isValid: null,
            errorMessage: '',
        };

        if (!isValidMove(i, j)) {
            turnStatus.errorMessage =
                'Action is invalid, please choose an empty space';
            turnStatus.isValid = false;
            return turnStatus;
        }

        _board[i][j].setToken(_activePlayer.token);

        updateGameStatus();
        if (_gameStatus.isGameOver) {
            endGame();
            turnStatus.isValid = true;
            return turnStatus;
        }

        _lastTurnStats.position = [i, j];
        _lastTurnStats.player = _activePlayer.token;
        _turn++;

        _activePlayer =
            _activePlayer === _players[0] ? _players[1] : _players[0];
        console.log(`${_activePlayer.name}'s _Turn`);

        turnStatus.isValid = true;
        return turnStatus;
    };

    const isValidMove = (i, j) => {
        console.log({ i, j });
        if (_board[i][j].getToken() != _emptyToken) {
            console.log('Invalid move, cell is occupied!');
            return false;
        } else if (i < 0 || i > 2 || j < 0 || j > 2) {
            console.log('Move is outside _board boundaries');
            return false;
        } else {
            return true;
        }
    };

    const updateGameStatus = () => {
        for (let configuration of _winningConfigurations) {
            const cell1 =
                _board[configuration[0][0]][configuration[0][1]].getToken();
            const cell2 =
                _board[configuration[1][0]][configuration[1][1]].getToken();
            const cell3 =
                _board[configuration[2][0]][configuration[2][1]].getToken();

            if (cell1 != _emptyToken && cell1 == cell2 && cell1 == cell3) {
                _gameStatus.isGameOver = true;
                _gameStatus.gameOverReason = _activePlayer.token;
                _gameStatus.winningConfiguration = configuration;
            }
        }

        if (_gameStatus.isGameOver == false && _turn == 9) {
            _gameStatus.isGameOver = true;
            _gameStatus.gameOverReason = 2;
        }
    };

    const endGame = () => {
        console.log(`${_activePlayer.name} Won!`);
        gameBoard.printBoard(_board);
        console.log(`${_activePlayer.name}:`);
    };

    function getGameStatus() {
        return _gameStatus;
    }

    function get_lastTurnStats() {
        return _lastTurnStats;
    }

    return {
        startNewGame,
        playTurn,
        getBoard,
        get_lastTurnStats,
        getGameStatus,
    };
})();

const screenController = ((gameController) => {
    //Cache DOM elements
    const elBoard = document.querySelector('.board');
    const cells = [];
    const players = [
        {
            name: 'Player One',
            wins: 0,
        },
        {
            name: 'Player Two',
            wins: 0,
        },
    ];

    //create necessary layout for displaying information
    const init = (
        playerOneName = 'Player One',
        playerTwoName = 'Player Two',
    ) => {
        gameController.startNewGame();
        //create and add elements to status
        for (let i = 0; i < 9; i++) {
            const gameCell = document.createElement('div');
            cells.push(gameCell);
            gameCell.textContent = '';
            gameCell.classList.add('cell');
            const gameCellContainer = document.createElement('div');
            gameCellContainer.addEventListener('click', handleOnClick);
            gameCellContainer.dataset.position = i.toString();
            gameCellContainer.classList.add('cell-container');
            gameCellContainer.appendChild(gameCell);
            elBoard.appendChild(gameCellContainer);
        }

        players[0].name = playerOneName;
        players[1].name = playerTwoName;
    };

    //render board and status (active player and win count)
    const render = () => {
        //render last play
        const _gameStatus = gameController.getGameStatus();
        const _lastTurnStats = gameController.get_lastTurnStats();
        const row = 0;
        const column = 1;
        const cellIndex =
            _lastTurnStats.position[row] * 3 + _lastTurnStats.position[column];

        cells[cellIndex].textContent = _lastTurnStats.player;

        //Allows rendering last turn before ending game.
        setTimeout(() => {
            if (_gameStatus.isGameOver) {
                console.log(`Game Over: ${_gameStatus.gameOverReason}`);
                setupNewRound();
            }
        }, 0);
    };

    function random(number) {
        return Math.floor(Math.random() * (number + 1));
    }

    //register events from clicking cells on game _board
    function handleOnClick(e) {
        const ordinalPosition = e.currentTarget.dataset.position;
        const row = Math.trunc(ordinalPosition / 3);
        const column = ordinalPosition % 3;
        console.log({ ordinalPosition, row, column });
        const turnStatus = gameController.playTurn(row, column);

        if (turnStatus.isValid) render();
        else alert(turnStatus.errorMessage);
    }

    function setupNewRound() {
        for (let cell of cells) {
            cell.textContent = '';
        }

        gameController.startNewGame();
    }

    const restartGame = () => {
        gameController.startNewGame();
    };

    return {
        init,
        setupNewRound,
        restartGame,
    };
})(gameController);

screenController.init();
