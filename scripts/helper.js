function getCellPosition2D(singleIndex) {
    const row = Math.trunc(singleIndex / 3);
    const column = singleIndex % 3;
    console.log({ singleIndex, row, column });
    return [row, column];
}

function getCellPosition1D(row, column) {
    if (arguments.length == 1) {
        [row, column] = arguments[0];
    }

    return row * 3 + column;
}
