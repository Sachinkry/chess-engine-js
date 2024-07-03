let especialMove;

function minimax(position, depth, maximizingPlayer) {
    if (depth === 0 ) {
        console.log("Depth 0000000000000000:::::", { score: evaluatePosition(position), move: null })
        return { score: evaluatePosition(position), move: null };
    }

    let bestMove = null;
    console.log("minimax_______________________________", {position, depth, maximizingPlayer});
    if (maximizingPlayer) {
        let maxEval = -Infinity;
        let children = getChildren(position, maximizingPlayer);

        for (let child of children) {
            let eval = minimax(child.position, depth - 1, false).score;
            if (eval > maxEval) {
                maxEval = eval;
                bestMove = child.move;
            }
        }
        console.log("maxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", { score: maxEval, move: bestMove, maximizingPlayer })
        return { score: maxEval, move: bestMove };
    } else {
        let minEval = Infinity;
        let children = getChildren(position, maximizingPlayer);
 
        for (let child of children) {
            let eval = minimax(child.position, depth - 1, true).score;
            if (eval < minEval) {
                minEval = eval;
                bestMove = child.move;
                // console.log("bestttttttttttttttttttttttt", bestMove, eval)
            }
        }
        console.log("minnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", { score: minEval, move: bestMove, maximizingPlayer })
        return { score: minEval, move: bestMove };
    }
}


//* -----------------
function isGameOver(posFen, maximizingPlayer) {
    

    // parse Fen
    const boardArray = parseFenToArray(posFen.split(' ')[0])

    // returns -1 or +infinity/-infinity or sqIndex of king in check or
    const inCheck = isKingInCheckCopy(boardArray); 

    if (inCheck === Number.NEGATIVE_INFINITY || inCheck === Number.POSITIVE_INFINITY) {
        // GameBoard.moves = []
        const currentPos = GameBoard.fen;
        console.log("KING IS IN CHECK MF;]]]]]]]]]]]]]]]]]", inCheck)
        const legalMovesObj = getChildren(currentPos, maximizingPlayer);
    
        for (const moveObj of legalMovesObj) {
            const boardArray = parseFenToArray(moveObj.position.split(' ')[0]);
            const isKingStillInCheck = isKingInCheckCopy(boardArray);
    
            if (isKingStillInCheck === -1) {
                console.log("This will save your king, my boy@@@@@",moveObj.move )
                false; // there's atleast one legal move
            }
        }

        return true; // Game over due to missing king
    }

    if(inCheck !== -1) {
        // GameBoard.moves = []
        console.log("KING IS IN CHECK MF;]]]]]]]]]]]]]]]]]", inCheck)
        const legalMovesObj = getChildren(posFen, maximizingPlayer);

        for (const moveObj of legalMovesObj) {
            const boardArray = parseFenToArray(moveObj.position.split(' ')[0]);
            const isKingStillInCheck = isKingInCheckCopy(boardArray);

            if (isKingStillInCheck === -1) {
                false; // there's atleast one legal move
            }
        }
        return true; // checkmate
    }
    return false;
    
}

const evaluatePosition = (posFen) => {
    let evaluation = 0;

    // Split the FEN string by '/' to get each rank
    const ranks = posFen.split('/');

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

// get all legal moves for given position and maximizingPlayer
function getChildren(posFen, isMaximizingPlayer) {
    let legalMovesObjList = [];
    let moves = [];
    const currentFen = posFen.split(' ')[0];
    const boardArray = parseFenToArray(currentFen);
    const currentPos = fenToObjs(currentFen);
    const side = isMaximizingPlayer ? COLORS.WHITE : COLORS.BLACK;  // 0 or 1
    // console.log("Current Position:", currentPos, currentFen);

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

    // console.log("Legal Moves FEN:", legalMovesObjList);
    return legalMovesObjList;
}

