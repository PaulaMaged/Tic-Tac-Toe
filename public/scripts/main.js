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

function createTurnStatus(player, position) {
    let _isValid = true;
    let _errorCode = null;
    let _errorMessage = null;

    function setInvalid(errorCode, errorMessage = '') {
        _isValid = false;
        _errorCode = errorCode;
        _errorMessage = errorMessage;
    }

    const isValid = () => _isValid;
    const getErrorCode = () => _errorCode;
    const getErrorMessage = () => _errorMessage;

    return {
        player: player,
        position: position,
        isValid,
        setInvalid,
        getErrorCode,
        getErrorMessage,
    };
}

const gameController = (function () {
    const _emptyToken = '';
    let _players = null;
    let _activePlayer = null;

    let _turn = null;

    let _turnStatus = null;

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

        _turnStatus = null;

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

    //trying to merge both the implementation of console and UI related aspects into one. This is especifically
    //convoluted when the end of the game is reached for the console game and I need to display some stuff...
    //I need to pass the responsibility of handling the messages to some other entity, possibly in a queue so that the
    // order is preserved. But who will dictate whether it should be printed or not??? It usually early returns if the game
    //ends in the console game which is problematic for the UI game.
    const playTurn = (i, j) => {
        //this is why I wanted to do a state machine,
        // having these state checks and handling edge cases can get overwhelming

        const turnStatus = createTurnStatus(_activePlayer, [i, j]);

        if (_gameStatus.isGameOver) {
            turnStatus.setInvalid(2, `Can't play after game is over`);
            _turnStatus = turnStatus;
            return;
        }

        if (!isValidMove(i, j)) {
            turnStatus.setInvalid(1, `Can't overwrite another player's marker`);
            _turnStatus = turnStatus;
            return;
        }

        _board[i][j].setToken(_activePlayer.token);

        updateGameStatus();

        if (_gameStatus.isGameOver) {
            endGame();
            _turnStatus = turnStatus;
            return;
        }

        _turnStatus = turnStatus;

        setupNextTurn();
    };

    function setupNextTurn() {
        console.log(`${_activePlayer.name}'s _Turn`);

        _turn++;
        _activePlayer =
            _activePlayer === _players[0] ? _players[1] : _players[0];
    }

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

    function getTurnStatus() {
        return {
            player: _turnStatus.player,
            position: getCellPosition1D(_turnStatus.position),
            isValid: _turnStatus.isValid(),
            errorCode: _turnStatus.getErrorCode(),
            errorMessage: _turnStatus.getErrorMessage(),
        };
    }

    function getGameStatus() {
        return _gameStatus;
    }

    const getActivePlayer = () => _activePlayer;

    return {
        startNewGame,
        playTurn,
        getBoard,
        getActivePlayer,
        getTurnStatus,
        getGameStatus,
    };
})();

const screenController = ((gameController) => {
    //Cache DOM elements
    const boardEl = document.querySelector('.grid-game-board');
    const gameStatusEl = document.querySelector('.game-status');
    const playerCardEls = [];

    let currentGameStatus = "Let's Play!";

    const cells = [];
    let playerStartedLastGame = null;

    const players = [
        {
            name: 'Player One',
            token: 'X',
            wins: 0,
            DOMReferences: null,
        },
        {
            name: 'Player Two',
            token: 'O',
            wins: 0,
            DOMReferences: null,
        },
    ];

    //create necessary layout for displaying information
    const init = () => {
        initializeGameState();
        createGridCells();
        createPlayerCards();
        setupGameControlButtonListeners();

        function initializeGameState() {
            //randomely choose starting player & save it
            const startingPlayerIndex = random(1);
            const startingPlayer = players[startingPlayerIndex];
            playerStartedLastGame = startingPlayer;
            startGame(startingPlayer);
        }

        function createGridCells() {
            //create and add elements to game board
            for (let i = 0; i < 9; i++) {
                const gameCell = document.createElement('div');
                cells.push(gameCell);
                gameCell.textContent = '';
                gameCell.addEventListener('click', handleUserCellInteraction);
                gameCell.dataset.position = i.toString();
                gameCell.classList.add(
                    'grid-game-board__cell',
                    'border-radius-sm',
                );
                boardEl.appendChild(gameCell);
            }
        }

        function createPlayerCards() {
            //setup player cards:
            const playerCardsContainer = document.querySelector(
                '#players-stats-container',
            );

            for (let i = 0; i < 2; i++) {
                const playerCardEl = document.createElement('section');

                playerCardEl.setAttribute('data-player-index', i.toString());
                playerCardEl.className =
                    'player-stats-card gap-sm align-items-center border-radius-lg padding-horizontal-lg padding-vertical-md';

                //flex item 1
                const playerNameEl = document.createElement('p');
                playerNameEl.className = 'player-stats-card__name-block';

                const playerNameTextEl = document.createElement('span');
                playerNameTextEl.classList.add('player-stats-card__name-text');
                playerNameTextEl.textContent = players[i].name;
                playerNameEl.appendChild(playerNameTextEl);

                const editNameButton = document.createElement('button');
                editNameButton.classList.add('player-stats-card__button');

                editNameButton.addEventListener('click', (e) => {
                    const targetEl = e.currentTarget;
                    changeNameUI(targetEl.parentElement);
                    targetEl.classList.add(
                        'player-stats-card__edit-icon-final',
                    );
                });

                const SVG_NS = 'http://www.w3.org/2000/svg';

                const editIconEl = document.createElementNS(SVG_NS, 'svg');
                editIconEl.setAttribute(
                    'class',
                    'player-stats-card__edit-icon',
                );
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

                editNameButton.appendChild(editIconEl);
                playerNameEl.appendChild(editNameButton);

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
                    nameEl: playerNameTextEl,
                    scoreEl: playerWinsScoreEl,
                };

                playerCardEl.append(playerNameEl, playerMarkerEl, playerWinsEl);
                playerCardsContainer.appendChild(playerCardEl);
                playerCardEls.push(playerCardEl);
            }
        }

        function changeNameUI(parentEl) {
            const playerNameTextEl = parentEl.querySelector(
                '.player-stats-card__name-text',
            );
            playerNameTextEl.classList.add('hide');
            const inputEl = document.createElement('input');
            inputEl.setAttribute('type', 'text');
            //hyphen not allowed as a literal character for some reaosn
            inputEl.setAttribute('pattern', '[A-Za-z0-9_]{3,10}');
            inputEl.setAttribute(
                'title',
                "3-10 alphanumeric characters and '-' or '_'",
            );

            parentEl.insertBefore(inputEl, parentEl.childNodes[0]);
            inputEl.focus();

            inputEl.addEventListener('blur', (e) => {
                playerNameTextEl.classList.remove('hide');
                e.currentTarget.parentElement
                    .querySelector('.player-stats-card__edit-icon-final')
                    .classList.remove('player-stats-card__edit-icon-final');
                e.currentTarget.remove();
            });

            inputEl.addEventListener('keydown', (e) => {
                if (e.key != 'Enter') return;

                const newName = e.target.value;
                if (!isValidName(newName)) return;

                let playerIndex = null;

                //get Player
                const playerCardEl = playerCardEls.find((cardEl) =>
                    cardEl.contains(e.target),
                );
                if (playerCardEl != undefined) {
                    playerIndex =
                        playerCardEl.getAttribute('data-player-index');
                } else {
                    alert(
                        "Couldn't find player card related to this input field",
                    );
                    return;
                }

                const player = players[playerIndex];
                let processedNewPlayerName = newName;
                processedNewPlayerName = processedNewPlayerName.trim();
                player.name = processedNewPlayerName;
                player.DOMReferences.nameEl.textContent =
                    processedNewPlayerName;

                e.target.blur();
            });
        }

        function isValidName(name) {
            if (name.trim().length == 0) return false;

            return true;
        }

        function setupGameControlButtonListeners() {
            const newGameButtonEl = document.querySelector('.bt-new-game');
            const resetGameButton = document.querySelector('.bt-reset-stats');

            newGameButtonEl.addEventListener('click', () => {
                startGame();
            });
            resetGameButton.addEventListener('click', () => {
                startGame();
                clearStats();
            });
        }

        //used if input is taken before initiating the game
        // players[0].name = playerOneName;
        // players[1].name = playerTwoName;
    };

    function startGame(startingPlayer = getNextPlayer(playerStartedLastGame)) {
        clearGame();
        setBoardInteractivity(true);
        playerStartedLastGame = startingPlayer;
        gameController.startNewGame(players, startingPlayer);
        writeToGameStatus(`Starting off with ${startingPlayer.name}!`);
    }

    function clearStats() {
        players.forEach((player) => {
            player.wins = 0;
        });

        displayScores();
    }

    function displayScores() {
        players.forEach((player) => {
            player.DOMReferences.scoreEl.textContent = player.wins;
        });
    }

    function clearGame() {
        for (let cell of cells) {
            cell.textContent = '';
        }

        writeToGameStatus('');
    }

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

    function handleUserCellInteraction(e) {
        const singleIndex = e.currentTarget.dataset.position;
        handleMove(singleIndex);
    }

    /**
     *
     * @param {number} cellIndex: a one dimensional index representing the cell's location
     * @returns null
     */
    function handleMove(cellIndex) {
        const gridCoordinates = getCellPosition2D(cellIndex);
        gameController.playTurn(...gridCoordinates);
        const turnStatus = gameController.getTurnStatus();
        const gameStatus = gameController.getGameStatus();

        if (!turnStatus.isValid) {
            displayInvalidMoveFeedback(cellIndex, {
                errorCode: turnStatus.errorCode,
                errorMessage: turnStatus.errorMessage,
                isValid: turnStatus.isValid,
            });
        } else {
            updateUIAfterMove(turnStatus, gameStatus);
        }
    }

    function updateUIAfterMove(turnStatus, gameStatus) {
        const { player, position } = turnStatus;
        const { isGameOver, gameWinner, winningConfiguration } = gameStatus;

        if (isGameOver) {
            updateScore(gameWinner);
            highlightStreak(winningConfiguration);
            setBoardInteractivity(false);
        }

        updateCellContent(position, player);
        updateGameStatusMessage(
            isGameOver,
            gameController.getActivePlayer(),
            gameWinner,
        );
    }

    /**
     * Creates an SVG element over the grid container and finds cell locations to draw a line over.
     * The goal is to create a line from the center of each end point cell.
     * @param {Array} streak The cells involved
     */
    function highlightStreak(streak) {}

    function updateScore(player) {
        if (typeof player?.wins !== 'number') return;

        player.wins++;
        displayScores();
    }

    function setBoardInteractivity(active) {
        if (active === true) {
            boardEl.classList.remove('disabled-state');
        } else {
            boardEl.classList.add('disabled-state');
        }
    }

    function updateGameStatusMessage(isGameOver, player, gameWinner) {
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

    /**
     *
     * @param {number} position used to locate cell
     */
    function displayInvalidMoveFeedback(position, errorObject) {
        const cell = cells[position];

        cell.classList.add('red-color');

        // Remove the class after animation completes
        setTimeout(() => {
            cell.classList.remove('red-color');
        }, 1000);
    }

    const getNextPlayer = (currentPlayer) => {
        return players.find((player) => player != currentPlayer);
    };

    return {
        init,
    };
})(gameController);

screenController.init();
