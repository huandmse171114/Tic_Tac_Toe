const empty = 0, player = 1, ai = -1, player2 = 2;
const gameModeSelections = document.querySelectorAll(".game-mode-item");
window.currentPlayer = player;

gameModeSelections.forEach(mode => {
    mode.addEventListener("click", () => {
        if (!mode.classList.contains("active")) {
            document.querySelector(".game-mode-item.active").classList.remove("active");
            mode.classList.add("active");
            // Update score board
            if (mode.innerHTML.trim() === "1 Player") {
                document.querySelector(".player-2-heading").innerHTML = "Computer";
            }else {
                document.querySelector(".player-2-heading").innerHTML = "Player 2";
            }
            document.querySelectorAll(".player-score").forEach(score => {
                score.innerHTML = '0';
            })
        }
        run();
    })
})

function run() {
    console.log('Run function');
    let field = [];
    let table = document.getElementById("table");
    table.innerHTML = ''; 
    for (let y = 0; y < 3; y++) {
        let tr = document.createElement("tr");
        table.appendChild(tr);
        let row = [];
        field.push(row);
        // set empty value for each cell
        const isAIGameMode = isAIMode();
        for (let x = 0; x < 3; x++) {
            let td = document.createElement("td");
            td.classList.add("cell");
            // check game mode
            if (isAIGameMode) {
                td.onclick = onePlayerMove(field, x, y);
            }else {
                td.onclick = twoPlayerMove(field, x, y);
            }
            tr.appendChild(td);
            row.push({value: empty, element: td});
        }
    }
}

function isAIMode() {
    const gameMode = document.querySelector(".game-mode-item.active").textContent.trim();
    return gameMode === "1 Player";
}

function onePlayerMove(field, row, col) {
    return function() {
        if (!move(field, row, col, player)) return; 
        wins(field, player) ? gameOver('You won!', field, player) : aiMove(field);
    }
}

function twoPlayerMove(field, row, col) {
    return function() {
        if (!move(field, row, col, window.currentPlayer)) return;
        let moves = validMoves(field);
        if (moves.length !== 0) {
            wins(field, currentPlayer) && gameOver(window.currentPlayer === player ? "Player 1 Won!" : "Player 2 Won!", field, window.currentPlayer);
            window.currentPlayer = window.currentPlayer === player ? player2 : player;
        } else {
            wins(field, currentPlayer) ? gameOver(window.currentPlayer === player ? "Player 1 Won!" : "Player 2 Won!", field, window.currentPlayer) : gameOver("Draw!", field);
        }
    }
}


function move(field, row, col, who) {
    let e = field[col][row];
    if (e.value !== empty) return false;
    e.value = who;
    e.element.innerHTML = who === player ? 'X' : 'O';
    return true;
}

// return all valid moves left in the field, ex: [{row: 0, col: 1}, {row: 0, col: 2}]
function validMoves(field) {
    let moves = [];
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            field[y][x].value === empty && moves.push({row: x, col: y})
        }
    }
    return moves;
}

// based on the Minimax algorithm
function findBestMove(field, player) {
    // player = 1, ai = -1 => ai = -player && player = -ai
    if (wins(field, player)) return {score: player}
    if (wins(field, -player)) return {score: -player}
    let moves = validMoves(field); 
    if (moves.length === 0) return {score: 0}
    let res = [];
    for (let i = 0; i < moves.length; i++) {
        let m = moves[i];
        let e = field[m.col][m.row];
        e.value = player;
        let r = findBestMove(field, -player);
        r.move = m;
        res.push(r);
        e.value = empty;
    }
    //    
    res.sort((a, b) => {
        return (b.score - a.score)*player;
    })
    return res[0];
}

function aiMove(field) {
    let m = findBestMove(field, ai).move;
    if (!m) {
        gameOver("Draw!", field);
        return;
    }
    // Delay AI move
    setTimeout(() => {
        move(field, m.row, m.col, ai);
        wins(field, ai) && gameOver("AI won!", field, ai);
    }, 150)
}

function wins(field, who) {
    function lineWins(row, col, dx, dy) {
        let a = field[col][row].value, b = field[col + dy][row + dx].value,
             c = field[col + 2*dy][row + 2*dx].value;
        return a === b && b === c && a === who;
    }

    for (let i = 0; i < 3; i++) {
        // lineWins(0, i, 1, 0) : checking column's cell value, lineWins(i, 0, 0, 1): checking row's cell value
        if (lineWins(0, i, 1, 0) || lineWins(i, 0, 0, 1)) return true;
    }
    // lineWins(0, 0, 1, 1): checking \ line's cell value, lineWins(2, 0, -1, 1): checking / line's cell value
    return lineWins(0, 0, 1, 1) || lineWins(2, 0, -1, 1);
}

function gameOver(msg, field, winner) {
    setTimeout(() => {
        alert(msg);
        // clear field value
        for (let x = 0; x < 3; x++) {
            for (let y=0; y < 3; y++) {
                let e = field[x][y];
                e.value = empty;
                e.element.innerHTML = "";
            }
        }
        // check if it is a draw case, if draw winner will be undefined
        if (winner !== undefined) {
            // update score board
            switch (winner) {
                case player:
                    document.querySelector(".player-1-score").innerHTML = 
                        parseInt(document.querySelector(".player-1-score").innerHTML) + 1;
                    break;
                default:
                    document.querySelector(".player-2-score").innerHTML = 
                        parseInt(document.querySelector(".player-2-score").innerHTML) + 1;
            }
        }
        window.currentPlayer = player;
    }, 100)
}

run();