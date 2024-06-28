
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

const updateGameStatusUI = (source, target) => {
    document.getElementById('sideToMove').innerText = GameBoard.side === 0 ? "White's move": "Black's move";
    // document.getElementById('currentFEN').innerText = GameBoard.fen;
    // document.getElementById('fiftyMoveCounter').innerText = GameBoard.fiftyMove;
    // document.getElementById('enPassantSquare').innerText = GameBoard.enPas !== 0 ? SQ120TOFILERANK(GameBoard.enPas) : 'None';
    // document.getElementById('castlingPermission').innerText = castlingPermissionToString(GameBoard.castlePerm);

    if (GameBoard.isGameOver) {
        const turn = SideChar[GameBoard.side];
        const winner = (turn === 'w') ? 'White' : 'Black';
    
        document.getElementById('winningStatus').innerText = `Game Over: ${winner} won`;
        
        // Disable board
        $('#myBoard').css('pointer-events', 'none');
    
    }
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
  
