
// get legal moves, check castling and highlight those moves
function getLegalMoves(source, piece) {
    GameBoard.moves = [];
    const pieceType = (piece === 'bP') ? piece[1].toLowerCase(): piece[1];
    const directions = pieceDirections[pieceType];
    const f = FileChar.indexOf(source[0]);
    const r = RankChar.indexOf(source[1]);
    const square = FR2SQ(f, r);

    const addMoveIfValid = (targetSquare) => {
        if (GameBoard.pieces[targetSquare] === SQUARES.OFFBOARD) return false;
        if (GameBoard.pieces[targetSquare] === PIECES.EMPTY) {
            if (piece[1] !== 'K' || !IsSqAttacked(targetSquare)) {
                GameBoard.moves.push(targetSquare);
            }
            return true;
        }
        const isWhitePiece = piece[0] === 'w';
        const isEnemyPiece = isWhitePiece ? GameBoard.pieces[targetSquare] >= PIECES.bP : GameBoard.pieces[targetSquare] <= PIECES.wK;
        if (isEnemyPiece) GameBoard.moves.push(targetSquare);
        return false;
    };

    const handlePawnMoves = () => {
        directions.forEach(direction => {
            const targetSquare = square + direction;
            const forwardDirection = pieceType === 'p' ? -10 : 10;
            const startRank = pieceType === 'p' ? 6 : 1;
            const doubleMoveSquare = targetSquare + direction;

            if (direction === forwardDirection && GameBoard.pieces[targetSquare] === PIECES.EMPTY) {
                GameBoard.moves.push(targetSquare);
                if (r === startRank && GameBoard.pieces[doubleMoveSquare] === PIECES.EMPTY) {
                    GameBoard.moves.push(doubleMoveSquare);
                }
            } else if (Math.abs(direction) === 9 || Math.abs(direction) === 11) {
                if (GameBoard.pieces[targetSquare] !== PIECES.EMPTY && GameBoard.pieces[targetSquare] !== SQUARES.OFFBOARD) {
                    addMoveIfValid(targetSquare);
                } else if (targetSquare === GameBoard.enPas) {
                    GameBoard.moves.push(targetSquare);
                }
            }
        });
    };

    const handleNonPawnMoves = () => {
        // check castling permissions for king pieces
        if (piece[1] === 'K' && (source === 'e1' || source === 'e8')) {
            checkCastling();
        }
        directions.forEach(direction => {
            let targetSquare = square + direction;
            while (GameBoard.pieces[targetSquare] !== SQUARES.OFFBOARD) {
                if (!addMoveIfValid(targetSquare)) break;
                if (['N', 'K'].includes(piece[1])) break;
                targetSquare += direction;
            }
        });
    };

    if (pieceType === 'p' || pieceType === 'P') {
        handlePawnMoves();
    } else {
        handleNonPawnMoves();
    }

    // highlight legal moves
    if(GameBoard.moves.length > 0){
        highlightLegalMoves(piece);
    }

    return GameBoard.moves;
}

function getAllLegalMovesObjs(posFen, isMaximizingPlayer) {
    let legalMovesObjList = [];
    let moves = [];
    const currentFen = posFen.split(' ')[0];
    const boardArray = parseFenToArray(currentFen);
    const currentPos = fenToObjs(currentFen);
    const side = isMaximizingPlayer ? COLORS.WHITE : COLORS.BLACK;  // 0 or 1
    console.log("Current Position:", currentPos, currentFen);

    // Function to get the file and rank from square index
    const getFileRank = (sq) => SQ120TOFILERANK(sq);

    // Function to process each move
    const processMove = (from, to, piece, currentPos) => {
        const source = getFileRank(from);
        const target = getFileRank(to);

        // Create a deep copy of the current position
        const newPos = JSON.parse(JSON.stringify(currentPos));

        // Perform the move on the copied position
        delete newPos[source];
        newPos[target] = piece;

        // Convert the new position to FEN and add to the list
        const newPosFen = Chessboard.objToFen(newPos);
        return { position: newPosFen, move:{source, target, piece} };
    };

    // Get legal moves for each piece
    for (let sq = 0; sq < BRD_SQ_NUM; sq++) {
        if (boardArray[sq] !== SQUARES.OFFBOARD  && PieceCol[boardArray[sq]] === side) {
            const piece = PIECES_[boardArray[sq]];
            const legalMovesSq = getLegalMovesCopy(boardArray, getFileRank(sq), piece);
            // console.log(`Legal moves for ${piece} at ${getFileRank(sq)}:`, legalMovesSq);

            legalMovesSq.forEach(move => {
                moves.push({ from: sq, to: move, piece });
            });
        }
    }

    // Process each legal move
    moves.forEach(legalMove => {
        const { from, to, piece } = legalMove;
        const legalMoveObj = processMove(from, to, piece, currentPos);
        legalMovesObjList.push(legalMoveObj);
    });

    console.log("Legal Moves FEN:", legalMovesObjList);
    return legalMovesObjList;
}
// 
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




//* ----------- Evaluated Move Generator for black --------------------

const makeEvaluatedMove = () => {
    console.log("********************************** Black's turn *************************************")
    let source, target, piece;
    // let result = minimax(GameBoard.fen, 2, false);
    let result = minimax_ab(GameBoard.fen, 4, false);
    console.log("Best move:", result.move, "Score:", result.score);
    // when eval is 0, the moves are dull, add some randomness(later: we may give opening book to bot)

    source = result.move.source;
    target = result.move.target;
    piece = result.move.piece;
    if(result.move !== null){

    }
    
    if(result.score === 0){
        // get legal Moves for given posFen
        // makeRandomMove();
        // select one of them randomly
        // const moves = getAllLegalMoves();
        // if (moves.length === 0) {
        //     console.log("No legal moves available");
        //     return;
        // }
        // const randomMove = moves[Math.floor(Math.random() * moves.length)];
        // source = SQ120TOFILERANK(randomMove.from);
        // target = SQ120TOFILERANK(randomMove.to);
        // piece = PIECES_[GameBoard.pieces[randomMove.from]];
        // console.log("POS JFLDKJFDFDJJFDJF", source, target, piece )
        // pass that move piece function 
    } else {

        
        console.log("POS EVAL [[[[NOT]]] ZEROOOOOOOOOOOOOOOOOO", source, target, piece )
    }
    // make a move
    let newPos;
    let newPosfen;
    if(!GameBoard.isGameOver){

        newPos = movePiece(source, target, piece);
    }
    newPosfen = posObjToFen(newPos);

    // handleCastleMove(source, target, piece, newPos);
    // makeEnpassantMoveIfPossible(source, target, piece, newPos)
    console.log("jjjjjjjjjjjjjjjjjjust checking.... ", newPos, newPosfen)
    updateGameBoard(source, target, piece, newPos, newPosfen);
    // isEnpassantMove(source, target, piece);
    // handleKingCheck();
    // checkGameOver()
    // PrintBoard();
    updateGameStatusUI(source, target);
    highlightMove(source, target);

}

const getMinEvalFen = (fenList) => {
    const evalList = []

    // Function to evaluate a single FEN string
    const evaluateFEN = (fen) => {
        let evaluation = 0;

        // Split the FEN string by '/' to get each rank
        const ranks = fen.split('/');

        ranks.forEach(rank => {
            for (let char of rank) {
                // Check if char is a digit (representing empty squares)
                if (char >= '1' && char <= '8') {
                    continue;
                } else {
                    // Find the index of the piece character in PceChar
                    const pieceIndex = PceChar.indexOf(char);
                    if (pieceIndex !== -1) {
                        evaluation += PieceVal[pieceIndex];
                    }
                }
            }
        });

        return evaluation;
    };

    let minEval = Infinity;
    let minEvalFen = null;

    // Loop through the FEN list and find the one with the minimum evaluation
    fenList.forEach(fen => {
        const fenBoard = fen.split(' ')[0];  // Get the board configuration part of the FEN
        const eval = evaluateFEN(fenBoard);
        evalList.push({eval, fen})
        if (eval < minEval) {
            minEval = eval;
            minEvalFen = fen;
        }
    });

    console.log("Eval Listttttttttttttttt", evalList)

    return minEvalFen;
};


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
    console.log("MOVES>>>>", moves)
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
    const newPos = moveRandomPiece(source, target, piece);

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
    const currentPos = Chessboard.fenToObj(GameBoard.fen);
    const newPos = JSON.parse(JSON.stringify(currentPos));
    // newPos[target] = PIECES_[piece]; 
    newPos[target] = piece;
    delete newPos[source];
    return newPos;
};
const moveRandomPiece = (source, target, piece) => {
    const currentPos = Chessboard.fenToObj(GameBoard.fen);
    const newPos = JSON.parse(JSON.stringify(currentPos));
    // newPos[target] = PIECES_[piece]; 
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


//* ------------------ CASTLING MOVE --------------------

const checkCastling = () => {
    const { side, castlePerm } = GameBoard;
    
    const canCastle = (kingPos, rookPos, emptySquares, targetSquares) => {
        if (GameBoard.pieces[kingPos] === PIECES[`${SideChar[side]}K`] &&
            GameBoard.pieces[rookPos] === PIECES[`${SideChar[side]}R`] &&
            emptySquares.every(sq => GameBoard.pieces[sq] === PIECES.EMPTY) &&
            targetSquares.every(sq => !IsSqAttacked(sq))) {
            return true;
        }
        return false;
    };

    const addCastleMove = (kingPos, rookPos, emptySquares, targetSquares, target) => {
        if (canCastle(kingPos, rookPos, emptySquares, targetSquares)) {
            GameBoard.castleMove.push({ from: kingPos, to: target });
            GameBoard.moves.push(target);
        }
    };

    if (side === COLORS.WHITE) {
        if (castlePerm & CASTLEBIT.WKCA) {
            addCastleMove(SQUARES.E1, SQUARES.H1, [SQUARES.F1, SQUARES.G1], [SQUARES.E1, SQUARES.F1, SQUARES.G1], SQUARES.G1);
        }
        if (castlePerm & CASTLEBIT.WQCA) {
            addCastleMove(SQUARES.E1, SQUARES.A1, [SQUARES.D1, SQUARES.C1, SQUARES.B1], [SQUARES.E1, SQUARES.D1, SQUARES.C1], SQUARES.C1);
        }
    } else {
        if (castlePerm & CASTLEBIT.BKCA) {
            addCastleMove(SQUARES.E8, SQUARES.H8, [SQUARES.F8, SQUARES.G8], [SQUARES.E8, SQUARES.F8, SQUARES.G8], SQUARES.G8);
        }
        if (castlePerm & CASTLEBIT.BQCA) {
            addCastleMove(SQUARES.E8, SQUARES.A8, [SQUARES.D8, SQUARES.C8, SQUARES.B8], [SQUARES.E8, SQUARES.D8, SQUARES.C8], SQUARES.C8);
        }
    }

    console.log("CastleMoves..........", GameBoard.castleMove, GameBoard.moves);
};

//* ------------------ ENPASSANT MOVE --------------------
// if pawn is double-square move, update GameBoard.enPas
const isEnpassantMove = (source, target, piece) => {
    console.log("Is EnPassant Move...",{source, target, piece} );
  
    // Convert source and target to ranks and files
    const sourceFile = source.charCodeAt(0) - 'a'.charCodeAt(0);
    const sourceRank = parseInt(source[1], 10) - 1;
    const targetFile = target.charCodeAt(0) - 'a'.charCodeAt(0);
    const targetRank = parseInt(target[1], 10) - 1;
    const pieceColor = piece[0];
  
    // Check if the move is a two-square pawn move
    const isTwoSquareMove = () => (
        (pieceColor === 'w' && sourceRank === 1 && targetRank === 3) ||
        (pieceColor === 'b' && sourceRank === 6 && targetRank === 4)
    );
  
    // Check if adjacent square (left and right square of target) is an opposite pawn
    const isAdjacentAnOppositePawn = () => {
        const oppositePawn = (pieceColor === 'w') ? PIECES.bP : PIECES.wP;
        const checkSquare = (file) => (
            file >= FILES.FILE_A && file <= FILES.FILE_H && 
            GameBoard.pieces[FR2SQ(file, targetRank)] === oppositePawn
        );
        return checkSquare(targetFile - 1) || checkSquare(targetFile + 1);
    };
  
    if (piece[1] === 'P' && isTwoSquareMove() && isAdjacentAnOppositePawn()) {
        GameBoard.enPas = FR2SQ(targetFile, pieceColor === 'w' ? 2 : 5);
    } else {
        GameBoard.enPas = SQUARES.NO_SQ;
    }
  
    console.log("En Passant square: ", GameBoard.enPas);
};
  
// if GameBoard.enPas !== 0 or 99; make EnPassant move 
const makeEnpassantMove = (source, target, piece, newPos) => {

    const enPassSq = SQ120TOFILERANK(GameBoard.enPas);
    
    const updateBoardForEnPassant = (captureOffset) => {
        const capturePawnSq = SQ120TOFILERANK(GameBoard.enPas + captureOffset);
        console.log("UPDATED ENPASS PAWN CAPTURE..... ", enPassSq, target, GameBoard.enPas + captureOffset);
        // Deep copy newPos to avoid mutating the original object
        const newPosCopy = { ...newPos };
        delete newPosCopy[capturePawnSq];
        board.position(newPosCopy, false);
        newPos = newPosCopy;
        //update fen 
    };
    
    if (piece === 'bP' && target === enPassSq) {
        updateBoardForEnPassant(10);
    } else if (piece === 'wP' && target === enPassSq) {
        updateBoardForEnPassant(-10);
    }
    return newPos;
};
