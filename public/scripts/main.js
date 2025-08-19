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

    let _turn = null;

    let _gameStatus = {
        isGameOver: null,
        gameWinner: null,
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

    /**
     *
     * @param {Array} players
     */
    const startNewGame = (players, startingPlayer) => {
        _board = gameBoard.generateBoard(_emptyToken);

        _players = players;

        //enter the list of players with the first one being the first to play
        _activePlayer = startingPlayer;

        _gameStatus = {
            isGameOver: false,
            gameWinner: null,
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
            player: _activePlayer,
            position: [i, j],
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
                _gameStatus.gameWinner = _activePlayer;
                _gameStatus.winningConfiguration = configuration;
            }
        }

        if (_gameStatus.isGameOver == false && _turn == 9) {
            _gameStatus.isGameOver = true;
            _gameStatus.gameWinner = null;
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

    return {
        startNewGame,
        playTurn,
        getBoard,
        getGameStatus,
    };
})();

const screenController = ((gameController) => {
    //Cache DOM elements
    const boardEl = document.querySelector('.grid-game-board');
    const gameStatusEl = document.querySelector('.game-status');
    const newGameButtonEl = document.querySelector('.bt-new-game');
    let currentGameStatus = "Let's Play!";

    const cells = [];
    const playerCards = [];
    let playerStartedLastTurn = null;

    const players = [
        {
            name: 'Player One',
            token: 'X',
            wins: 0,
        },
        {
            name: 'Player Two',
            token: 'O',
            wins: 0,
        },
    ];

    //create necessary layout for displaying information
    const init = () => {
        //randomely choose starting player & save it
        const startingPlayerIndex = random(1);
        const startingPlayer = players[startingPlayerIndex];
        gameController.startNewGame(players, startingPlayer);
        playerStartedLastTurn = startingPlayer;

        writeToGameStatus(`Starting off with ${startingPlayer.name}!`);

        //create and add elements to game board
        for (let i = 0; i < 9; i++) {
            const gameCell = document.createElement('div');
            cells.push(gameCell);
            gameCell.textContent = '';
            gameCell.addEventListener('click', handleUserMove);
            gameCell.dataset.position = i.toString();
            gameCell.classList.add('grid-game-board__cell', 'border-radius-sm');
            boardEl.appendChild(gameCell);
        }

        //setup player cards:
        const playerCardsContainer = document.querySelector(
            '#players-stats-container',
        );

        for (let i = 0; i < 2; i++) {
            const playerCardEl = document.createElement('section');

            playerCardEl.className =
                'player-stats-card gap-sm align-items-center border-radius-lg padding-horizontal-lg padding-vertical-md';

            //flex item 1
            const playerNameEl = document.createElement('p');
            playerNameEl.className = 'player-stats-card__name';

            const playerNameText = document.createTextNode(players[i].name);
            playerNameEl.appendChild(playerNameText);
            const SVG_NS = 'http://www.w3.org/2000/svg';

            const editIconEl = document.createElementNS(SVG_NS, 'svg');
            editIconEl.setAttribute('class', 'player-stats-card__edit-icon');
            editIconEl.setAttribute('viewBox', '0 0 24 24');
            editIconEl.setAttribute('fill', 'none');
            // Now embed children with innerHTML
            editIconEl.innerHTML = `
                <path d="M12 8L4 16v4h4l8-8m-4-4l2.87-2.87c.4-.4.6-.6.83-.68.19-.06.4-.06.59 0 .23.08.43.28.83.68l1.74 1.74c.4.4.6.6.68.83.06.19.06.4 0 .59-.08.23-.28.43-.68.83L16 12m-4-4l4 4"
                stroke="#000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round" />
            `;
            playerNameEl.appendChild(editIconEl);

            //flex item 2
            const playerMarkerEl = document.createElement('p');
            playerMarkerEl.className = 'player-stats-card__player-marker';
            playerMarkerEl.innerHTML = playerHighlight(
                players[i].token,
                players[i].token,
            );

            //flex item 3
            const playerWinsEl = document.createElement('p');
            playerWinsEl.className = 'player-stats-card__player-score-text';
            playerWinsEl.textContent = `Wins: `;

            const playerWinsScoreEl = document.createElement('span');
            playerWinsScoreEl.className =
                'player-stats-card__player-score-value';
            playerWinsScoreEl.textContent = '0';
            playerWinsEl.appendChild(playerWinsScoreEl);

            //cache elements for later use
            players[i].DOMReferences = {
                name: playerNameEl,
                score: playerWinsScoreEl,
            };

            playerCardEl.append(playerNameEl, playerMarkerEl, playerWinsEl);
            playerCardsContainer.appendChild(playerCardEl);
        }

        //used if input is taken before initiating the game
        // players[0].name = playerOneName;
        // players[1].name = playerTwoName;
    };

    //render board and status (active player and win count)
    const updateCellContent = (cellIndex, player) => {
        //render last play

        cells[cellIndex].innerHTML = playerHighlight(
            player.token,
            player.token,
        );
    };

    function playerHighlight(text, token) {
        return `<span class="player${token}">${text}</span>`;
    }

    function writeToGameStatus(statusText) {
        gameStatusEl.innerHTML = statusText;
    }

    function random(number) {
        return Math.floor(Math.random() * (number + 1));
    }

    //register events from clicking cells on game _board
    function handleUserMove(e) {
        const ordinalPosition = e.currentTarget.dataset.position;
        const row = Math.trunc(ordinalPosition / 3);
        const column = ordinalPosition % 3;
        console.log({ ordinalPosition, row, column });
        const { player, isValid, errorMessage } = gameController.playTurn(
            row,
            column,
        );
        const { isGameOver, gameWinner, winningConfiguration } =
            gameController.getGameStatus();

        if (!isValid) {
            //create indicator of incorrect move... add an animation for a moment on the pressed cell
            cells[ordinalPosition].classList.add('red-color');

            // Remove the class after animation completes
            setTimeout(() => {
                cells[ordinalPosition].classList.remove('red-color');
            }, 1000);
            return;
        }

        updateCellContent(ordinalPosition, player);

        let gameStatusMessage;
        //set game status
        if (!isGameOver) {
            gameStatusMessage = `${playerHighlight(player.name)}'s Turn`;
        } else {
            //handle game end

            //disable all events
            boardEl.classList.add('disabled-state');

            //create a timed indicator to take the next recommended action

            if (gameWinner == null) {
                gameStatusMessage = `ma7adesh keseb ya showayet fashala🤣`;
            } else {
                gameStatusMessage = `${playerHighlight(gameWinner.name)} Won!🎊`;

                //create a line along the winning configuration
            }
        }

        writeToGameStatus(gameStatusMessage);
    }

    function setupNewRound() {
        for (let cell of cells) {
            cell.textContent = '';
        }

        gameController.startNewGame(players);
    }

    const restartGame = () => {
        gameController.startNewGame(players);
    };

    return {
        init,
        setupNewRound,
        restartGame,
    };
})(gameController);

//after html content is generated
screenController.init();
