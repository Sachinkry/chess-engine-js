// Piece movement vectors
const pieceDirections = {
    'p': [-10, -20, -11, -9], // White pawns
    'P': [10, 20, 11, 9],     // Black pawns
    'N': [-21, -19, -12, -8, 8, 12, 19, 21],
    'B': [-11, -9, 9, 11],
    'R': [-10, -1, 1, 10],
    'Q': [-11, -10, -9, -1, 1, 9, 10, 11],
    'K': [-11, -10, -9, -1, 1, 9, 10, 11]
};

function getLegalMoves(source, piece) {
    GameBoard.moves = [];
    let p = piece == 'bP' ? piece[1].toLowerCase() : piece[1];
    let directions = pieceDirections[p];
    let f = FileChar.indexOf(source[0]);
    let r = RankChar.indexOf(source[1]);
    let square = FR2SQ(f,r)
    console.log(source, piece, square, directions, GameBoard.pieces[square])  // g2 wP {a1:'wR', ... h8:'bR'}

    directions.forEach(direction => {
        let targetSquare = square + direction;
        // console.log(p, GameBoard.pieces[targetSquare], targetSquare)
        
        if (p === 'P' || p === 'p') {
            // Single square forward move
            if (direction === (p === 'P' ? 10 : -10) && GameBoard.pieces[targetSquare] === PIECES.EMPTY) {
                GameBoard.moves.push(targetSquare);
                
                // Double square forward move from starting position
                if ((p === 'P' && r === 1) || (p === 'p' && r === 6)) {
                    let doubleMoveSquare = targetSquare + direction;
                    if (GameBoard.pieces[doubleMoveSquare] === PIECES.EMPTY) {
                        GameBoard.moves.push(doubleMoveSquare);
                    }
                }
            } 
            // Handle captures
            else if (Math.abs(direction) === 9 || Math.abs(direction) === 11) {
                // console.log("isNotEmpty", GameBoard.pieces[targetSquare] !== PIECES.EMPTY)
                // console.log("NotOffboard", GameBoard.pieces[targetSquare] !== SQUARES.OFFBOARD)
                // console.log("hi", ((p === 'P' && GameBoard.pieces[targetSquare] >= PIECES.bP) ||
                // (p === 'p' && GameBoard.pieces[targetSquare] <= PIECES.wK)));
                if (GameBoard.pieces[targetSquare] !== PIECES.EMPTY &&
                    GameBoard.pieces[targetSquare] !== SQUARES.OFFBOARD &&
                    ((p === 'P' && GameBoard.pieces[targetSquare] >= PIECES.bP) ||
                    (p === 'p' && GameBoard.pieces[targetSquare] <= PIECES.wK))) {
                    GameBoard.moves.push(targetSquare);
                } else if (targetSquare === GameBoard.enPas) {
                    GameBoard.moves.push(targetSquare)
                }
            }
        } else {
            // For non-pawn pieces
            while (GameBoard.pieces[targetSquare] !== SQUARES.OFFBOARD) {
                if (GameBoard.pieces[targetSquare] === PIECES.EMPTY) {
                    if(piece[1] === 'K' && IsSqAttacked(targetSquare)){
                        // GameBoard.moves.push(targetSquare);
                        console.log("targetSquare for king in attack oh my lord help me........")
                    } else {
                        GameBoard.moves.push(targetSquare);
                    }
                } else if (GameBoard.pieces[targetSquare] !== PIECES.EMPTY) {
                    if((piece[0] === 'w' && GameBoard.pieces[targetSquare] >= PIECES.bP) ||
                    (piece[0] === 'b' && GameBoard.pieces[targetSquare] <= PIECES.wK)) {
                        GameBoard.moves.push(targetSquare);
                    }
                    break;
                } else {
                    break;
                }

                // Continue in the same direction for sliding pieces
                if (['N', 'K'].includes(p)) {
                    break;
                }
                targetSquare += direction;
            }
        }

        // Additional check for king moves
        // if (p === 'K' || p === 'k') {
        //     if (IsSqAttacked(targetSquare)) {
        //         GameBoard.moves.(targetSquare);
        //     }
        // }
        
    })

    // genertePossibleCastleMoves();
    // console.log(GameBoard.moves)

    return GameBoard.moves;

}

// returns true/false
function isLegalMove(target) {
    let legalMoves = GameBoard.moves;
    console.log("islegalmove:", legalMoves)

    // Convert the target from file-rank format to board index
    let targetFile = FileChar.indexOf(target[0]);
    let targetRank = RankChar.indexOf(target[1]);
    let targetSquare = FR2SQ(targetFile, targetRank);

    return legalMoves.includes(targetSquare);
}

function isSquareAttacked(sqIndex, draggedPiece){
    const pieceType = draggedPiece[1]; // e.g., 'P', 'R', 'N', 'B', 'Q', 'K'
    const pieceColor = (draggedPiece[0] === 'w') ? COLORS.WHITE : COLORS.BLACK;
    let isEmpty = GameBoard.pieces[sqIndex] == PIECES.EMPTY;
    // console.log(sqIndex, side, draggedPiece, pieceType)

    if(isEmpty) return false;
    // console.log(square, side, piece, "lol321")

    // Ensure the square is on the board
    if (sqIndex < 0 || sqIndex >= BRD_SQ_NUM || GameBoard.pieces[sqIndex] === SQUARES.OFFBOARD) {
        console.error("Invalid square for attack check:", sq);
        return false;
    }


    // Pawn attacks
    if (pieceType === 'P') {
        if (pieceColor === COLORS.WHITE) {
            return GameBoard.pieces[sqIndex - 11] === PIECES.wP || GameBoard.pieces[sqIndex - 9] === PIECES.wP;
        } else {
            return GameBoard.pieces[sqIndex + 11] === PIECES.bP || GameBoard.pieces[sqIndex + 9] === PIECES.bP;
        }
    }

    // knight attacks
    if (pieceType === 'N') {
        const knightDirections = [-8, -19, -21, -12, 8, 19, 21, 12];
        return knightDirections.some(dir => GameBoard.pieces[sqIndex + dir] === (pieceColor === COLORS.WHITE ? PIECES.wN : PIECES.bN));
    }

    // Bishop attacks
    if (pieceType === 'B') {
        const bishopDirections = [-9, -11, 11, 9];
        return bishopDirections.some(dir => {
            let t_square = sqIndex + dir;
            while (GameBoard.pieces[t_square] !== SQUARES.OFFBOARD) {
                const piece = GameBoard.pieces[t_square];
                if (piece !== PIECES.EMPTY) {
                    return (pieceColor === COLORS.WHITE && piece === PIECES.wB) || (pieceColor === COLORS.BLACK && piece === PIECES.bB);
                }
                t_square += dir;
            }
            return false;
        });
    }

    // Rook attacks
    if (pieceType === 'R') {
        const rookDirections = [-1, -10, 1, 10];
        return rookDirections.some(dir => {
            let t_square = sqIndex + dir;
            while (GameBoard.pieces[t_square] !== SQUARES.OFFBOARD) {
                const piece = GameBoard.pieces[t_square];
                if (piece !== PIECES.EMPTY) {
                    return (pieceColor === COLORS.WHITE && piece === PIECES.wR) || (pieceColor === COLORS.BLACK && piece === PIECES.bR);
                }
                t_square += dir;
            }
            return false;
        });
    }

    // Queen attacks (combining bishop and rook moves)
    if (pieceType === 'Q') {
        const bishopDirections = [-9, -11, 11, 9];
        const rookDirections = [-1, -10, 1, 10];

        const bishopAttacked = bishopDirections.some(dir => {
            let t_square = sqIndex + dir;
            while (GameBoard.pieces[t_square] !== SQUARES.OFFBOARD) {
                const piece = GameBoard.pieces[t_square];
                if (piece !== PIECES.EMPTY) {
                    return (pieceColor === COLORS.WHITE && (piece === PIECES.wB || piece === PIECES.wQ)) || (pieceColor === COLORS.BLACK && (piece === PIECES.bB || piece === PIECES.bQ));
                }
                t_square += dir;
            }
            return false;
        });

        const rookAttacked = rookDirections.some(dir => {
            let t_square = sqIndex + dir;
            while (GameBoard.pieces[t_square] !== SQUARES.OFFBOARD) {
                const piece = GameBoard.pieces[t_square];
                if (piece !== PIECES.EMPTY) {
                    return (pieceColor === COLORS.WHITE && (piece === PIECES.wR || piece === PIECES.wQ)) || (pieceColor === COLORS.BLACK && (piece === PIECES.bR || piece === PIECES.bQ));
                }
                t_square += dir;
            }
            return false;
        });

        return bishopAttacked || rookAttacked;
    }

    // King attacks
    if (pieceType === 'K') {
        const kingDirections = [-1, -10, 1, 10, -9, -11, 11, 9];
        const isKingInAttack = kingDirections.some(dir => GameBoard.pieces[sqIndex + dir] === (pieceColor === COLORS.WHITE ? PIECES.wK : PIECES.bK));
        // const side = GameBoard.side;  // 0 || 1 || 2

        
        return isKingInAttack;
    }
    
    return false;
}


function isKingInCheck() {
    const sides = [COLORS.WHITE, COLORS.BLACK];
    const pieceKing = [PIECES.wK, PIECES.bK];
    const piecePawn = [PIECES.bP, PIECES.wP];
    const pieceKnight = [PIECES.wN, PIECES.bN];
    const pieceBishop = [PIECES.wB, PIECES.bB];
    const pieceRook = [PIECES.wR, PIECES.bR];
    const pieceQueen = [PIECES.wQ, PIECES.bQ];

    const knightDirections = [-8, -19, -21, -12, 8, 19, 21, 12];
    const bishopDirections = [-9, -11, 11, 9];
    const rookDirections = [-1, -10, 1, 10];
    const kingDirections = [-1, -10, 1, 10, -9, -11, 11, 9];

    for (let side = 0; side < sides.length; side++) {
        const opponent = (side === 0) ? COLORS.BLACK : COLORS.WHITE;
        let kingPos = -1;

        // Locate the king
        for (let sq = 0; sq < BRD_SQ_NUM; sq++) {
            if (GameBoard.pieces[sq] === pieceKing[side]) {
                kingPos = sq;
                break;
            }
        }

        if (kingPos === -1) {
            console.error("King not found on the board!");
            continue;
        }

        // Check for pawn attacks
        if (side === 0) {
            if (GameBoard.pieces[kingPos + 11] === piecePawn[side] || GameBoard.pieces[kingPos + 9] === piecePawn[side]) {
                return kingPos;
            }
        } else {
            if (GameBoard.pieces[kingPos - 11] === piecePawn[side] || GameBoard.pieces[kingPos - 9] === piecePawn[side]) {
                return kingPos;
            }
        }

        // Check for knight attacks
        for (let dir of knightDirections) {
            if (GameBoard.pieces[kingPos + dir] === pieceKnight[opponent]) {
                return kingPos;
            }
        }

        // Check for bishop/queen diagonal attacks
        for (let dir of bishopDirections) {
            let t_square = kingPos + dir;
            while (GameBoard.pieces[t_square] !== SQUARES.OFFBOARD) {
                const piece = GameBoard.pieces[t_square];
                if (piece !== PIECES.EMPTY) {
                    if ((piece === pieceBishop[opponent] || piece === pieceQueen[opponent])) {
                        return kingPos;
                    }
                    break;
                }
                t_square += dir;
            }
        }

        // Check for rook/queen straight attacks
        for (let dir of rookDirections) {
            let t_square = kingPos + dir;
            while (GameBoard.pieces[t_square] !== SQUARES.OFFBOARD) {
                const piece = GameBoard.pieces[t_square];
                if (piece !== PIECES.EMPTY) {
                    if ((piece === pieceRook[opponent] || piece === pieceQueen[opponent])) {
                        return kingPos;
                    }
                    break;
                }
                t_square += dir;
            }
        }

        // Check for king attacks
        for (let dir of kingDirections) {
            if (GameBoard.pieces[kingPos + dir] === pieceKing[opponent]) {
                return kingPos;
            }
        }
    }

    return -1; // Neither king is in check
}



//* ---------------- Random Move Generation for black ------------------
// get all possible/legal moves when black's turn 
const getAllLegalMoves = () => {
    const moves = [];
    const side = GameBoard.side;
    for (let sq = 0; sq < BRD_SQ_NUM; sq++) {
        if (GameBoard.pieces[sq] !== SQUARES.OFFBOARD && PieceCol[GameBoard.pieces[sq]] === side) {
            const piece = PIECES_[GameBoard.pieces[sq]];
            const legalMovesSq = getLegalMoves(SQ120TOFILERANK(sq), piece, Chessboard.fenToObj(GameBoard.fen));
            legalMovesSq.forEach(move => {
                moves.push({ from: sq, to: move });
            });
        }
    }
    GameBoard.moves = moves;
    return moves;
};

const makeRandomMove = () => {
    const moves = getAllLegalMoves();
    if (moves.length === 0) {
        console.log("No legal moves available");
        return;
    }
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    const source = SQ120TOFILERANK(randomMove.from);
    const target = SQ120TOFILERANK(randomMove.to);
    const piece = GameBoard.pieces[randomMove.from];

    // Move the piece on the board
    const newPos = movePiece(source, target, piece);

    // Update the GameBoard state
    // GameBoard.side = GameBoard.side === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    // GameBoard.fen = Chessboard.objToFen(newPos);
    console.log("newPost after random move", source, target, newPos, Chessboard.objToFen(newPos))

    // console.log("board position", position)
    handleCastleMove(source, target, PIECES_[piece], newPos);
    makeEnpassantMoveIfPossible(source, target, PIECES_[piece], newPos)
    updateGameBoard(source, target, PIECES_[piece], Chessboard.objToFen(newPos) );
    // isEnpassantMove(source, target, piece);
    handleKingCheck();
    checkGameOver()
    PrintBoard();
    highlightMove(source, target);
    updateGameStatusUI(source, target);
};

// Function to move the piece and return the new position object
const movePiece = (source, target, piece) => {
    const newPos = Chessboard.fenToObj(GameBoard.fen);
    newPos[target] = PIECES_[piece];
    delete newPos[source];
    return newPos;
};


const gameLoop = () => {
    if (GameBoard.side === COLORS.BLACK) {
        makeRandomMove();
        // getAllLegalMoves();
        console.log(GameBoard.moves, "moves for black")
    } else {
        // Wait for the player's move or call the function to get player's move
    }
};


//* ------------------ CASTLING LOGIC ------------------------------------
const CheckCastling = () => {
    const { side, castlePerm } = GameBoard;

    if (side === COLORS.WHITE) {
        if (castlePerm & CASTLEBIT.WKCA) {
            if (GameBoard.pieces[SQUARES.E1] === PIECES.wK &&
                GameBoard.pieces[SQUARES.H1] === PIECES.wR &&
                GameBoard.pieces[SQUARES.F1] === PIECES.EMPTY &&
                GameBoard.pieces[SQUARES.G1] === PIECES.EMPTY &&
                !IsSqAttacked(SQUARES.E1) &&
                !IsSqAttacked(SQUARES.F1) &&
                !IsSqAttacked(SQUARES.G1)) {
                
                // White king-side castling
                GameBoard.castleMove.push({ from: SQUARES.E1, to: SQUARES.G1}); 
                // add the target sq to gameboard.moves
                GameBoard.moves.push(SQUARES.G1)
            }
        }
        if (castlePerm & CASTLEBIT.WQCA) {
            if (GameBoard.pieces[SQUARES.E1] === PIECES.wK &&
                GameBoard.pieces[SQUARES.A1] === PIECES.wR &&
                GameBoard.pieces[SQUARES.D1] === PIECES.EMPTY &&
                GameBoard.pieces[SQUARES.C1] === PIECES.EMPTY &&
                GameBoard.pieces[SQUARES.B1] === PIECES.EMPTY &&
                !IsSqAttacked(SQUARES.E1) &&
                !IsSqAttacked(SQUARES.D1) &&
                !IsSqAttacked(SQUARES.C1)) {
                
                // White queen-side castling
                GameBoard.castleMove.push({ from: SQUARES.E1, to: SQUARES.C1});
                GameBoard.moves.push(SQUARES.C1)
            }
        }
    } else {
        if (castlePerm & CASTLEBIT.BKCA) {
            if (GameBoard.pieces[SQUARES.E8] === PIECES.bK &&
                GameBoard.pieces[SQUARES.H8] === PIECES.bR &&
                GameBoard.pieces[SQUARES.F8] === PIECES.EMPTY &&
                GameBoard.pieces[SQUARES.G8] === PIECES.EMPTY &&
                !IsSqAttacked(SQUARES.E8) &&
                !IsSqAttacked(SQUARES.F8) &&
                !IsSqAttacked(SQUARES.G8)) {
                    
                    // Black king-side castling
                    GameBoard.castleMove.push({ from: SQUARES.E8, to: SQUARES.G8});
                    GameBoard.moves.push(SQUARES.G8)
            }
        }
        if (castlePerm & CASTLEBIT.BQCA) {
            if (GameBoard.pieces[SQUARES.E8] === PIECES.bK &&
                GameBoard.pieces[SQUARES.A8] === PIECES.bR &&
                GameBoard.pieces[SQUARES.D8] === PIECES.EMPTY &&
                GameBoard.pieces[SQUARES.C8] === PIECES.EMPTY &&
                GameBoard.pieces[SQUARES.B8] === PIECES.EMPTY &&
                !IsSqAttacked(SQUARES.E8) &&
                !IsSqAttacked(SQUARES.D8) &&
                !IsSqAttacked(SQUARES.C8)) {
                
                // Black queen-side castling
                GameBoard.castleMove.push({ from: SQUARES.E8, to: SQUARES.C8});
                GameBoard.moves.push(SQUARES.C8)
            }
        }
    }

    console.log("CastleMoves..........", GameBoard.castleMove, GameBoard.moves)
};

//* This function runs at every turn and revokes castling rights if king or rook position changes
const UpdateCastlePerm = () => {
    const { pieces } = GameBoard;

    if (pieces[SQUARES.E1] !== PIECES.wK) {
        GameBoard.castlePerm &= ~CASTLEBIT.WKCA;
        GameBoard.castlePerm &= ~CASTLEBIT.WQCA;
    }
    if (pieces[SQUARES.H1] !== PIECES.wR) {
        GameBoard.castlePerm &= ~CASTLEBIT.WKCA;
    }
    if (pieces[SQUARES.A1] !== PIECES.wR) {
        GameBoard.castlePerm &= ~CASTLEBIT.WQCA;
    }
    if (pieces[SQUARES.E8] !== PIECES.bK) {
        GameBoard.castlePerm &= ~CASTLEBIT.BKCA;
        GameBoard.castlePerm &= ~CASTLEBIT.BQCA;
    }
    if (pieces[SQUARES.H8] !== PIECES.bR) {
        GameBoard.castlePerm &= ~CASTLEBIT.BKCA;
    }
    if (pieces[SQUARES.A8] !== PIECES.bR) {
        GameBoard.castlePerm &= ~CASTLEBIT.BQCA;
    }

    console.log("Updated Castle Permissions:", GameBoard.castlePerm);
};


//! use this function for castling checks only
const IsSqAttacked= (sqIndex) => {
    const attackingColor = GameBoard.side === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

    // Ensure the square is on the board
    if (sqIndex < 0 || sqIndex >= BRD_SQ_NUM || GameBoard.pieces[sqIndex] === SQUARES.OFFBOARD) {
        console.error("Invalid square for attack check:", sqIndex);
        return false;
    }

    // Check for pawn attacks
    if (attackingColor === COLORS.WHITE) {
        if (GameBoard.pieces[sqIndex - 11] === PIECES.wP || GameBoard.pieces[sqIndex - 9] === PIECES.wP) {
            return true;
        }
    } else {
        if (GameBoard.pieces[sqIndex + 11] === PIECES.bP || GameBoard.pieces[sqIndex + 9] === PIECES.bP) {
            return true;
        }
    }

    // Check for knight attacks
    const knightDirections = [-8, -19, -21, -12, 8, 19, 21, 12];
    for (let dir of knightDirections) {
        if (GameBoard.pieces[sqIndex + dir] === (attackingColor === COLORS.WHITE ? PIECES.wN : PIECES.bN)) {
            return true;
        }
    }

    // Check for bishop/queen diagonal attacks
    const bishopDirections = [-9, -11, 11, 9];
    for (let dir of bishopDirections) {
        let t_square = sqIndex + dir;
        while (GameBoard.pieces[t_square] !== SQUARES.OFFBOARD) {
            const piece = GameBoard.pieces[t_square];
            if (piece !== PIECES.EMPTY) {
                if ((attackingColor === COLORS.WHITE && (piece === PIECES.wB || piece === PIECES.wQ)) ||
                    (attackingColor === COLORS.BLACK && (piece === PIECES.bB || piece === PIECES.bQ))) {
                    return true;
                }
                break;
            }
            t_square += dir;
        }
    }

    // Check for rook/queen straight attacks
    const rookDirections = [-1, -10, 1, 10];
    for (let dir of rookDirections) {
        let t_square = sqIndex + dir;
        while (GameBoard.pieces[t_square] !== SQUARES.OFFBOARD) {
            const piece = GameBoard.pieces[t_square];
            if (piece !== PIECES.EMPTY) {
                if ((attackingColor === COLORS.WHITE && (piece === PIECES.wR || piece === PIECES.wQ)) ||
                    (attackingColor === COLORS.BLACK && (piece === PIECES.bR || piece === PIECES.bQ))) {
                    return true;
                }
                break;
            }
            t_square += dir;
        }
    }

    // Check for king attacks
    const kingDirections = [-1, -10, 1, 10, -9, -11, 11, 9];
    for (let dir of kingDirections) {
        if (GameBoard.pieces[sqIndex + dir] === (attackingColor === COLORS.WHITE ? PIECES.wK : PIECES.bK)) {
            return true;
        }
    }

    return false;
}
