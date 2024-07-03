
const InitSq120To64 = () => {
    var index = 0;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;
    var sq64 = 0;
  
    for(index=0; index < BRD_SQ_NUM; index++) {
        Sq120ToSq64[index] = 65;
    }
  
    for(index = 0; index < 64; index++) {
        Sq64ToSq120[index] = 120;
    }
  
    for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
        for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file, rank);
            Sq64ToSq120[sq64] = sq;
            Sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }
    
}

const initHashKeys = () => {
    for (let i = 0; i < 14 * 120; i++) {
        PieceKeys[i] = RAND_32();
    }
    SideKey = RAND_32();
    for (let i = 0; i < 16; i++) {
        CastleKeys[i] = RAND_32();
    }
};

const RAND_32 = () => {
    return (
        Math.floor((Math.random()*255)+1) << 23) | 
        (Math.floor((Math.random()*255)+1) << 16) | 
        (Math.floor((Math.random()*255)+1) << 8) | 
        Math.floor((Math.random()*255)+1);
}

const FR2SQ = (f,r) => (21 + (f) ) + ((r) * 10 );

const FR2SQIndex = (pos) => {
    const file = pos.charCodeAt(0) - 'a'.charCodeAt();
    const rank = parseInt(pos[1]) - 1;
    return (21 + file) + (rank * 10);
}

const SQ64 = sq120 => Sq120ToSq64[sq120];
const SQ120 = sq64 => Sq64ToSq120[sq64];

const SQ120TOFILE = sq120 => (sq120 % 10) - 1;
const SQ120TORANK = sq120 => Math.floor(sq120 / 10) - 2;

const SQ120TOFILERANK = sq120 => {
    const fileIndex = SQ120TOFILE(sq120);
    const rankIndex = SQ120TORANK(sq120);
    const fileChar = FileChar[fileIndex];
    const rankChar = RankChar[rankIndex];
    return fileChar + rankChar;
}

const fenToObjs = (fen) => {
    const boardObj = {};
    const rows = fen.split(' ')[0].split('/'); // Get the board configuration part and split it by ranks

    // Files and ranks for referencing board squares
    const files = 'abcdefgh';
    const ranksReverse = '87654321';

    rows.forEach((row, rankIdx) => {
        let fileIdx = 0;

        for (let char of row) {
            if (char >= '1' && char <= '8') {
                // Empty squares, skip the number of squares indicated by the digit
                fileIdx += parseInt(char);
            } else {
                // Piece found, map it to the board object
                const square = files[fileIdx] + ranksReverse[rankIdx];
                // Check if the piece is white or black and format accordingly
                const piece = char >= 'a' && char <= 'z' ? 'b' + char.toUpperCase() : 'w' + char;
                boardObj[square] = piece;
                fileIdx++;
            }
        }
    });

    return boardObj;
};

const posObjToFen = (boardObj) => {
    const files = 'abcdefgh';
    const ranks = '87654321';
    const fenArray = [];

    if (!boardObj || typeof boardObj !== 'object') {
        throw new Error('Invalid board object');
    }

    for (let rank of ranks) {
        let fenRank = '';
        let emptyCount = 0;

        for (let file of files) {
            const square = file + rank;
            const piece = boardObj[square];

            if (piece && typeof piece === 'string' && piece.length === 2) {
                if (emptyCount > 0) {
                    fenRank += emptyCount;
                    emptyCount = 0;
                }
                const [color, type] = piece.split('');
                fenRank += color === 'w' ? type.toUpperCase() : type.toLowerCase();
            } else {
                // Square is empty (either no piece or invalid piece)
                emptyCount++;
            }
        }

        if (emptyCount > 0) {
            fenRank += emptyCount;
        }

        fenArray.push(fenRank);
        emptyCount = 0;  // Reset emptyCount at the end of each rank
    }

    const fenString = fenArray.join('/');

    // Validate the resulting FEN string
    if (!/^([pnbrqkPNBRQK1-8]{1,8}\/){7}[pnbrqkPNBRQK1-8]{1,8}$/.test(fenString)) {
        throw new Error('Generated invalid FEN string');
    }

    return fenString;
};

const updateGameStatusUI = (source, target) => {
    document.getElementById('sideToMove').innerText = GameBoard.side === 0 ? "White's move": "Black's move";
    // document.getElementById('currentFEN').innerText = GameBoard.fen;
    // document.getElementById('fiftyMoveCounter').innerText = GameBoard.fiftyMove;
    // document.getElementById('enPassantSquare').innerText = GameBoard.enPas !== 0 ? SQ120TOFILERANK(GameBoard.enPas) : 'None';
    // document.getElementById('castlingPermission').innerText = castlingPermissionToString(GameBoard.castlePerm);

    // if (GameBoard.isGameOver) {
    //     const turn = SideChar[GameBoard.side];
    //     const winner = (turn === 'w') ? 'Black' : 'White';
    
    //     document.getElementById('winningStatus').innerText = `Game Over: ${winner} won`;
        
    //     // Disable board
    //     $('#myBoard').css('pointer-events', 'none');
    
    // // $board.find('.square-' + square).css('pointer-events', none)
    // }
    console.log("board chess", board, source, target, `${source}-${target}`)
    board.move(`${source}-${target}`);
  
};

// * quite a good function
// ? what should i do with this function
// ! alert
// TODO this is quite good
// @param this is quite good
const castlingPermissionToString = (perm) => {
    let str = '';
    if (perm & CASTLEBIT.WKCA) str += 'K';
    if (perm & CASTLEBIT.WQCA) str += 'Q';
    if (perm & CASTLEBIT.BKCA) str += 'k';
    if (perm & CASTLEBIT.BQCA) str += 'q';
    return str || 'None';
};

const PCEINDEX = (pce, pceNum) => (pce * 10 + pceNum);

const GeneratePosKey = () => {
    let finalKey = 0;

    for (let sq = 0; sq < BRD_SQ_NUM; ++sq) {
        const piece = GameBoard.pieces[sq];
        if (piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
            finalKey ^= PieceKeys[(piece * 120) + sq];
        }
    }

    if (GameBoard.side == COLORS.WHITE) {
        finalKey ^= SideKey;
    }

    if (GameBoard.enPas != SQUARES.NO_SQ) {
        finalKey ^= PieceKeys[GameBoard.enPas];
    }

    finalKey ^= CastleKeys[GameBoard.castlePerm];
    return finalKey;
}

const ParseFen= (fen) => {
    // ResetBoard();

    let rank = RANKS.RANK_8;
    let file = FILES.FILE_A;
    let fenCnt = 0;

    while (rank >= RANKS.RANK_1 && fenCnt < fen.length) {
        let count = 1;
        const char = fen[fenCnt];
        let piece = PIECES.EMPTY;

        switch (char) {
            case 'p': piece = PIECES.bP; break;
            case 'r': piece = PIECES.bR; break;
            case 'n': piece = PIECES.bN; break;
            case 'b': piece = PIECES.bB; break;
            case 'k': piece = PIECES.bK; break;
            case 'q': piece = PIECES.bQ; break;
            case 'P': piece = PIECES.wP; break;
            case 'R': piece = PIECES.wR; break;
            case 'N': piece = PIECES.wN; break;
            case 'B': piece = PIECES.wB; break;
            case 'K': piece = PIECES.wK; break;
            case 'Q': piece = PIECES.wQ; break;

            case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8':
                count = char.charCodeAt() - '0'.charCodeAt();
                break;

            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                continue;

            default:
                console.error("FEN error");
                return;
        }

        for (let i = 0; i < count; i++) {
            const sq120 = FR2SQ(file, rank);
            GameBoard.pieces[sq120] = piece;
            file++;
        }
        fenCnt++;
    }

    GameBoard.side = (fen[fenCnt] == 'w') ? COLORS.WHITE : COLORS.BLACK;
    fenCnt += 2;

    for (let i = 0; i < 4; i++) {
        if (fen[fenCnt] == ' ') {
            break;
        }
        switch (fen[fenCnt]) {
            case 'K': GameBoard.castlePerm |= CASTLEBIT.WKCA; break;
            case 'Q': GameBoard.castlePerm |= CASTLEBIT.WQCA; break;
            case 'k': GameBoard.castlePerm |= CASTLEBIT.BKCA; break;
            case 'q': GameBoard.castlePerm |= CASTLEBIT.BQCA; break;
        }
        fenCnt++;
    }

    fenCnt++; // Skip the space

    if (fen[fenCnt] != '-') {
        file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
        rank = 8 - (fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt());
        GameBoard.enPas = FR2SQ(file, rank);
    }

    GameBoard.posKey = GeneratePosKey(); // Generate the position key after parsing the FEN
}

const parseFenToArray = (fen) => {
    const boardArray = new Array(BRD_SQ_NUM).fill(SQUARES.OFFBOARD);

    // Fill the main board area with EMPTY
    for (let i = 21; i <= 98; i++) {
        if (i % 10 !== 0 && i % 10 !== 9) {
            boardArray[i] = PIECES.EMPTY;
        }
    }

    const ranks = fen.split('/').reverse();
    let sq120Index = 21; // Start from A1 in the 12x10 board

    ranks.forEach(rank => {
        for (let char of rank) {
            if (char >= '1' && char <= '8') {
                sq120Index += parseInt(char); // Skip empty squares
            } else {
                const pieceIndex = PceChar.indexOf(char);
                if (pieceIndex !== -1) {
                    boardArray[sq120Index] = pieceIndex;
                }
                sq120Index++;
            }
        }
        sq120Index += 2; // Move to the next rank, accounting for the offboard squares
    });

    return boardArray;
}

function getLegalMovesCopy(boardArray,source, piece) {
    // GameBoard.moves = [];
    let legalMoves = []
    let p = piece == 'bP' ? piece[1].toLowerCase() : piece[1];
    let directions = pieceDirections[p];
    let f = FileChar.indexOf(source[0]);
    let r = RankChar.indexOf(source[1]);
    let square = FR2SQ(f,r)
    // console.log(source, piece, square, directions, GameBoard.pieces[square])  // g2 wP {a1:'wR', ... h8:'bR'}


    directions.forEach(direction => {
        let targetSquare = square + direction;
        // console.log(p, GameBoard.pieces[targetSquare], targetSquare)
        
        if (p === 'P' || p === 'p') {
            // Single square forward move
            if (direction === (p === 'P' ? 10 : -10) && boardArray[targetSquare] === PIECES.EMPTY ) {
                legalMoves.push(targetSquare);
                
                // Double square forward move from starting position
                if ((p === 'P' && r === 1) || (p === 'p' && r === 6)) {
                    let doubleMoveSquare = targetSquare + direction;
                    if (boardArray[doubleMoveSquare] === PIECES.EMPTY) {
                        legalMoves.push(doubleMoveSquare);
                    }
                }
            } 
            // Handle captures
            else if (Math.abs(direction) === 9 || Math.abs(direction) === 11) {
                // console.log("isNotEmpty", boardArray[targetSquare] !== PIECES.EMPTY)
                // console.log("NotOffboard", boardArray[targetSquare] !== SQUARES.OFFBOARD)
                // console.log("hi", ((p === 'P' && boardArray[targetSquare] >= PIECES.bP) ||
                // (p === 'p' && boardArray[targetSquare] <= PIECES.wK)));
                if (boardArray[targetSquare] !== PIECES.EMPTY &&
                    boardArray[targetSquare] !== SQUARES.OFFBOARD &&
                    ((p === 'P' && boardArray[targetSquare] >= PIECES.bP) ||
                    (p === 'p' && boardArray[targetSquare] <= PIECES.wK))) {
                    legalMoves.push(targetSquare);
                } else if (targetSquare === GameBoard.enPas) {
                    legalMoves.push(targetSquare)
                }
            }
        } else {
            // For non-pawn pieces
            while (boardArray[targetSquare] !== SQUARES.OFFBOARD) {
                if (boardArray[targetSquare] === PIECES.EMPTY) {
                    if(piece[1] === 'K' && IsSqAttacked(targetSquare)){
                        // legalMoves.push(targetSquare);
                        // console.log("targetSquare for king in attack oh my lord help me........")
                    } else {
                        legalMoves.push(targetSquare);
                    }
                } else if (boardArray[targetSquare] !== PIECES.EMPTY) {
                    if((piece[0] === 'w' && boardArray[targetSquare] >= PIECES.bP) ||
                    (piece[0] === 'b' && boardArray[targetSquare] <= PIECES.wK)) {
                        legalMoves.push(targetSquare);
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

        
        
    })
    return legalMoves;

}

function isKingInCheckCopy(boardArray) {
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
            if (boardArray[sq] === pieceKing[side]) {
                kingPos = sq;
                break;
            }
        }

        if (kingPos === -1) {
            // King not found, treat as game over
            console.log("KING NOT FOUND ON THE BOARD............")
            return side === COLORS.WHITE ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        }

        // Check for pawn attacks
        if (side === 0) {
            if (boardArray[kingPos + 11] === piecePawn[side] || boardArray[kingPos + 9] === piecePawn[side]) {
                return kingPos;
            }
        } else {
            if (boardArray[kingPos - 11] === piecePawn[side] || boardArray[kingPos - 9] === piecePawn[side]) {
                return kingPos;
            }
        }

        // Check for knight attacks
        for (let dir of knightDirections) {
            if (boardArray[kingPos + dir] === pieceKnight[opponent]) {
                return kingPos;
            }
        }

        // Check for bishop/queen diagonal attacks
        for (let dir of bishopDirections) {
            let t_square = kingPos + dir;
            while (boardArray[t_square] !== SQUARES.OFFBOARD) {
                const piece = boardArray[t_square];
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
            while (boardArray[t_square] !== SQUARES.OFFBOARD) {
                const piece = boardArray[t_square];
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
            if (boardArray[kingPos + dir] === pieceKing[opponent]) {
                return kingPos;
            }
        }
    }

    return -1; // Neither king is in check
}

//? Used mainly to update fen position after castle moves
//! not in use
const updateFenPosition = () => {
    let newFenPosition = "";
    let emptyCount = 0;

    // Generate the new position part of the FEN
    for (let rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        for (let file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            const sq = FR2SQ(file, rank);
            const piece = GameBoard.pieces[sq];
            if (piece === PIECES.EMPTY) {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    newFenPosition += emptyCount.toString();
                    emptyCount = 0;
                }
                const pieceChar = PceChar[piece];
                newFenPosition += pieceChar;
            }
        }
        if (emptyCount > 0) {
            newFenPosition += emptyCount.toString();
            emptyCount = 0;
        }
        if (rank > RANKS.RANK_1) {
            newFenPosition += '/';
        }
    }

    // Extract the current FEN string from GameBoard
    let currentFen = GameBoard.fen;

    // Split the current FEN string into its components
    let fenParts = currentFen.split(' ');

    // Update only the position part of the FEN string
    fenParts[0] = newFenPosition;

    // Reassemble the FEN string
    let updatedFen = fenParts.join(' ');

    // Update the GameBoard.fen with the new FEN string
    GameBoard.fen = updatedFen;

    console.log("fen update after castling")

    return updatedFen;
}

//! not in use
function isThisACastleMove(source, target, piece) {
    if (piece !== 'wK' && piece !== 'bK') {
        return false;
    }
  
    // Handle white king-side castling
    if (piece === 'wK' && source === 'e1' && target === 'g1') {
        return true;
    }
    
    // Handle white queen-side castling
    if (piece === 'wK' && source === 'e1' && target === 'c1') {
        return true;
    }
    
    // Handle black king-side castling
    if (piece === 'bK' && source === 'e8' && target === 'g8') {
        return true;
    }
    
    // Handle black queen-side castling
    if (piece === 'bK' && source === 'e8' && target === 'c8') {
        return true;
    }
  
    return false;
}
  
