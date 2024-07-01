const board = document.querySelector(".board");
const header = document.querySelector("#header");
const blackLost = document.querySelector("#biru-lost");
const redLost = document.querySelector("#merah-lost");
const time = document.querySelector("#time");
const blackTime = document.querySelector("#biru-timer");
const redTime = document.querySelector("#merah-timer");

let turn = "biru";
let gameOver = false;
let eligiblePiece;

let biruLosses = 0;
let merahLosses = 0;

let selectedPiece;
let proposedMove;

let hasStarted = false;
let startTimestamp = -1;

let pastStates = [saveState()];
let timer = -1;

let merahTimer = 600;
let biruTimer = 600;

addEventListener("click", (event) => {

    if (event.target.classList.contains("piece")) {
        if (gameOver) {
            return;
        }

        if (selectedPiece != null) {
            selectedPiece.parentNode.classList.remove("yellow");
            selectedPiece.parentNode.classList.add("biru");
        }

        selectedPiece = event.target;
        proposedMove = null;


        selectedPiece.parentNode.classList.remove("biru");
        selectedPiece.parentNode.classList.add("yellow");
        if (getTeamOfPiece(selectedPiece) != turn && !turn.includes("+")) {
            setTimeout(() => {
                selectedPiece.parentNode.classList.remove("yellow");
                selectedPiece.parentNode.classList.add("biru");
            }, 125);
            return;
        }
    } else if (event.target.classList.contains("tile") && event.target.classList.contains("biru") && selectedPiece != null) {
        proposedMove = event.target;
    }

    if (selectedPiece != null && proposedMove != null && (getTeamOfPiece(selectedPiece) == turn || turn.includes("+"))) {

        if (isValidMove(selectedPiece, proposedMove)) {
            if (!hasStarted) {
                startTimestamp = Math.floor(Date.now() / 1000);
                timer = setInterval(() => {
                    updateTime();
                }, 1000);
                hasStarted = true;
            }

            selectedPiece.parentNode.classList.remove("yellow");
            selectedPiece.parentNode.classList.add("biru");

            proposedMove.appendChild(selectedPiece);

            if (shouldBeCrown(selectedPiece)) {
                setCrown(selectedPiece);
            }

            selectedPiece = null;
            proposedMove = null;

            if (!turn.includes("+")) {
                switchTurn();
            }

            if (merahLosses == 12) {
                header.innerHTML = "Dam Haji Rimba - BIRU MENANG!";
                gameOver = true;
                clearInterval(timer);
            } else if (biruLosses == 12) {
                header.innerHTML = "Dam Haji Rimba - MERAH MENANG!";
                gameOver = true;
                clearInterval(timer);
            }
            updateScore();

            pastStates.push(saveState());
        }
    }
});

function isSpaceTaken(row, column) {
    return board.children[column].children[row].children.length > 0;
}

function getPieceAt(row, column) {
    return board.children[column].children[row].children[0];
}

function setPieceAt(newPiece, row, column) {
    if (board.children[column].children[row].children.length > 0) {
        board.children[column].children[row].removeChild(getPieceAt(row, column));
    }
    board.children[column].children[row].appendChild(newPiece);
}

function isSpaceTakenByOppositeTeam(currentTeam, row, column) {
    var path = board.children[column].children[row].children[0].src;

    if (isSpaceTaken(row, column) && path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("_")) != currentTeam) {
        return true;
    }
    return false;
}

function getTeamOfPiece(piece) {
    const path = piece.src;
    return path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("_"));
}

function isValidMove(piece, move) {
    const pieceLocation = getLocationOfPiece(piece);
    const moveLocation = getLocationOfTile(move);

    if (!isCrown(piece)) {
        if (getTeamOfPiece(piece) == "biru") {
            if (getLocationOfPiece(piece).column > getLocationOfTile(move).column) {
                return false;
            }
        } else {
            if (getLocationOfPiece(piece).column < getLocationOfTile(move).column) {
                return false;
            }
        }
    }
    if (turn.includes("+")) {
        if (getTeamOfPiece(piece) == turn.substring(0, turn.length-1)) {
            if ((pieceLocation.row + 1 == moveLocation.row && pieceLocation.column + 1 == moveLocation.column) || (pieceLocation.row + 1 == moveLocation.row && pieceLocation.column - 1 == moveLocation.column) || (pieceLocation.row - 1 == moveLocation.row && pieceLocation.column - 1 == moveLocation.column) || (pieceLocation.row - 1 == moveLocation.row && pieceLocation.column + 1 == moveLocation.column)) {
                turn = turn.substring(0, turn.length-1);
                eligiblePiece = null;
                return true;
            }
        }
    } else if ((pieceLocation.row + 1 == moveLocation.row && pieceLocation.column + 1 == moveLocation.column) || (pieceLocation.row + 1 == moveLocation.row && pieceLocation.column - 1 == moveLocation.column) || (pieceLocation.row - 1 == moveLocation.row && pieceLocation.column - 1 == moveLocation.column) || (pieceLocation.row - 1 == moveLocation.row && pieceLocation.column + 1 == moveLocation.column)) {
        eligiblePiece = null;
        return true;
    }


    if (pieceLocation.row + 2 == moveLocation.row && pieceLocation.column + 2 == moveLocation.column && isSpaceTakenByOppositeTeam(getTeamOfPiece(piece), pieceLocation.row + 1, pieceLocation.column + 1)) {
        if (eligiblePiece != null) {
            if (getTeamOfPiece(getPieceAt(eligiblePiece.x, eligiblePiece.y)) == getTeamOfPiece(piece)) {
                if (eligiblePiece.x != pieceLocation.row || eligiblePiece.y != pieceLocation.column) {
                    return false;
                }
            }
        }
        
        let hopped = getPieceAt(pieceLocation.row + 1, pieceLocation.column + 1);
        if (getTeamOfPiece(hopped) == "merah") {
            merahLosses++;
        } else {
            biruLosses++;
        }
        hopped.parentNode.removeChild(hopped);

        if (getTeamOfPiece(piece) == "biru" && turn == "biru+") {
            turn = "merah+";
        } else if (getTeamOfPiece(piece) == "merah" && turn == "merah+") {
            turn = "biru+";
        }
        header.innerHTML = "Dam Haji Rimba - Giliran " + (turn.charAt(0).toUpperCase() + turn.substring(1)).replaceAll("+", "") ;

        if (!turn.includes("+")) {
            switchTurn();
            turn += "+";
        }
        eligiblePiece = { x: moveLocation.row, y: moveLocation.column};
        return true;
    }
    if (pieceLocation.row + 2 == moveLocation.row && pieceLocation.column - 2 == moveLocation.column && isSpaceTakenByOppositeTeam(getTeamOfPiece(piece), pieceLocation.row + 1, pieceLocation.column - 1)) {
        if (eligiblePiece != null) {
            if (getTeamOfPiece(getPieceAt(eligiblePiece.x, eligiblePiece.y)) == getTeamOfPiece(piece)) {
                if (eligiblePiece.x != pieceLocation.row || eligiblePiece.y != pieceLocation.column) {
                    return false;
                }
            }
        }
        
        let hopped = getPieceAt(pieceLocation.row + 1, pieceLocation.column - 1);
        if (getTeamOfPiece(hopped) == "merah") {
            merahLosses++;
        } else {
            biruLosses++;
        }
        hopped.parentNode.removeChild(hopped);

        if (getTeamOfPiece(piece) == "biru" && turn == "biru+") {
            turn = "merah+";
        } else if (getTeamOfPiece(piece) == "merah" && turn == "merah+") {
            turn = "biru+";
        }
        header.innerHTML = "Dam Haji Rimba - Giliran " + (turn.charAt(0).toUpperCase() + turn.substring(1)).replaceAll("+", "") ;

        if (!turn.includes("+")) {
            switchTurn();
            turn += "+";
        }
        eligiblePiece = { x: moveLocation.row, y: moveLocation.column};
        return true;
    }
    if (pieceLocation.row - 2 == moveLocation.row && pieceLocation.column - 2 == moveLocation.column && isSpaceTakenByOppositeTeam(getTeamOfPiece(piece), pieceLocation.row - 1, pieceLocation.column - 1)) {
        if (eligiblePiece != null) {
            if (getTeamOfPiece(getPieceAt(eligiblePiece.x, eligiblePiece.y)) == getTeamOfPiece(piece)) {
                if (eligiblePiece.x != pieceLocation.row || eligiblePiece.y != pieceLocation.column) {
                    return false;
                }
            }
        }
        
        let hopped = getPieceAt(pieceLocation.row - 1, pieceLocation.column - 1);
        if (getTeamOfPiece(hopped) == "merah") {
            merahLosses++;
        } else {
            biruLosses++;
        }
        hopped.parentNode.removeChild(hopped);

        if (getTeamOfPiece(piece) == "biru" && turn == "biru+") {
            turn = "merah+";
        } else if (getTeamOfPiece(piece) == "merah" && turn == "merah+") {
            turn = "biru+";
        }
        header.innerHTML = "Dam Haji Rimba - Giliran " + (turn.charAt(0).toUpperCase() + turn.substring(1)).replaceAll("+", "") ;

        if (!turn.includes("+")) {
            switchTurn();
            turn += "+";
        }
        eligiblePiece = { x: moveLocation.row, y: moveLocation.column};
        return true;
    }
    if (pieceLocation.row - 2 == moveLocation.row && pieceLocation.column + 2 == moveLocation.column && isSpaceTakenByOppositeTeam(getTeamOfPiece(piece), pieceLocation.row - 1, pieceLocation.column + 1)) {
        if (eligiblePiece != null) {
            if (getTeamOfPiece(getPieceAt(eligiblePiece.x, eligiblePiece.y)) == getTeamOfPiece(piece)) {
                if (eligiblePiece.x != pieceLocation.row || eligiblePiece.y != pieceLocation.column) {
                    return false;
                }
            }
        }

        let hopped = getPieceAt(pieceLocation.row - 1, pieceLocation.column + 1);
        if (getTeamOfPiece(hopped) == "merah") {
            merahLosses++;
        } else {
            biruLosses++;
        }
        hopped.parentNode.removeChild(hopped);

        if (getTeamOfPiece(piece) == "biru" && turn == "biru+") {
            turn = "merah+";
        } else if (getTeamOfPiece(piece) == "merah" && turn == "merah+") {
            turn = "biru+";
        }
        header.innerHTML = "Dam Haji Rimba - Giliran " + (turn.charAt(0).toUpperCase() + turn.substring(1)).replaceAll("+", "") ;

        if (!turn.includes("+")) {
            switchTurn();
            turn += "+";
        }
        eligiblePiece = { x: moveLocation.row, y: moveLocation.column};
        return true;
    }
    return false;
}

function getLocationOfTile(tile) {
    let moveColumn = -1;
    for (let i = 0; i < tile.parentNode.parentNode.children.length; i++) {
        if (tile.parentNode.parentNode.children[i] == tile.parentNode) {
            moveColumn = i;
        }
    }
    let moveRow = -1;
    for (let i = 0; i < tile.parentNode.children.length; i++) {
        if (tile.parentNode.children[i] == tile) {
            moveRow = i;
        }
    }
    return { row: moveRow, column: moveColumn };
}

function getLocationOfPiece(piece) {
    return getLocationOfTile(piece.parentNode);
}

function setCrown(piece) {
    const team = getTeamOfPiece(piece);
    piece.src = "/assets/" + team + "_crown.png";
}

function removeCrown(piece) {
    const team = getTeamOfPiece(piece);
    piece.src = "/assets/" + team + "_piece.png";
}

function shouldBeCrown(piece) {
    if (getTeamOfPiece(piece) == "biru") {
        return getLocationOfPiece(piece).column == 7;
    }
    return getLocationOfPiece(piece).column == 0;
}

function isCrown(piece) {
    return piece.src.includes("crown");
}

function switchTurn() {
    if (turn == "biru") {
        turn = "merah";
    } else {
        turn = "biru";
    }
    header.innerHTML = "Dam Haji Rimba - Giliran " + turn.charAt(0).toUpperCase() + turn.substring(1) ;
}

function updateScore() {
    biruLost.innerHTML = "Dam telah dimakan: " + biruLosses;
    merahLost.innerHTML = "Dam telah dimakan: " + merahLosses;
}

function resetGame() {
    location.reload();
}

function saveState() {
    let board = [...Array(8)].map(() => Array(8));
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (getPieceAt(i, j) != undefined) {
                board[j][i] = { piece: getPieceAt(i, j), crowned: isCrown(getPieceAt(i, j)) };
            }
        }
    }
    return [board, turn, biruLosses, merahLosses];
}

function loadState(matrixWithTurn) {
    let matrix = matrixWithTurn[0];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (matrix[j][i] != undefined) {
                setPieceAt(matrix[j][i].piece, i, j);
                if (matrix[j][i].crowned) {
                    setCrown(matrix[j][i].piece);
                } else {
                    removeCrown(matrix[j][i].piece)
                }
            }
        }
    }
    turn = matrixWithTurn[1];
    biruLosses = matrixWithTurn[2];
    merahLosses = matrixWithTurn[3];
    biruLost.innerHTML = "Dam telah dimakan: " + biruLosses;
    merahLost.innerHTML = "Dam telah dimakan: " + merahLosses;
    header.innerHTML = "Dam Haji Rimba - Giliran" + (turn.charAt(0).toUpperCase() + turn.substring(1)).replaceAll("+", "") ;
}

function undo() {
    if (gameOver) return;
    if (pastStates.length > 0) {
        if (selectedPiece != null) {
            selectedPiece.parentNode.classList.remove("yellow");
            selectedPiece.parentNode.classList.add("biru");
        }
        loadState(pastStates[pastStates.length - 2]);
        pastStates.pop();
    }
}