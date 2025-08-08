const gameBoard = (function GameBoard() {
  const board = [];

  for (let i = 0; i < 3; i++) {
    board[0] = [];
    for (let j = 0; j < 3; j++) {
      board[0].push(Cell(i, j));
    }
  }
})();

const Cell = function (row, column) {
  const position = [row, column];
  let value = 0;

  const getPosition = () => position;
  const setValue = (value) => (value = value);
  const getValue = () => value;
  return { getPosition, setValue, getValue };
};
