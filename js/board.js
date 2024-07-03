
var GameBoard = {
    pieces: new Array(BRD_SQ_NUM),   
    fen: START_FEN,
    side: COLORS.WHITE,
    fiftyMove: 0,   // number of half-moves since the last pawn move or capture
    hisPly: 0,      // total number of half-moves in the game so far
    ply: 0,         // number of half-moves in the current search depth
    enPas: 0,       // en passant square index if available otherwise 0
    castlePerm: 0,  // bitwise flags for castling permission
    material: new Array(2), // WHITE, BLACK material of pieces
    pceNum: new Array(13), // array storing the number of each piece type on the board
    pList: new Array(14 * 10),  // array containg pieces for each square
    posKey: 0,             // unique position key for current board state
    moves: [],             // array storing the legal moves for the current position
    castleMove: [],
    moveList: new Array(MAXDEPTH * MAXPOSITIONMOVES),
    moveScores: new Array(MAXDEPTH * MAXPOSITIONMOVES),
    moveListStart: new Array(MAXDEPTH),
    isKingInCheck: false,
    isGameOver: false,
    kingInCheckCount: 0,
};
// moveList: Array storing all moves in the current search.
// moveScores: Array storing the scores for each move.
// moveListStart: Array storing the index of the start of each depth in moveList.

const initBoardSquares = () => {
    for (let i = 0; i < BRD_SQ_NUM; ++i) {
        FilesBrd[i] = SQUARES.OFFBOARD;
        RanksBrd[i] = SQUARES.OFFBOARD;
    }
  
    for (let rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
        for (let file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
            const sq = FR2SQ(file, rank);
            FilesBrd[sq] = file;
            RanksBrd[sq] = rank;
        }
    }
};

const PrintBoard = () => {
    console.log("\nGame Board:\n");
    for (let rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        let line = RankChar[rank] + " ";
        for (let file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            const sq = FR2SQ(file, rank);
            const piece = GameBoard.pieces[sq];
            line += " " + PceChar[piece] + " ";
        }
        console.log(line);
    }

    let line = "  ";
    for (let file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
        line += ' ' + FileChar[file] + ' ';
    }
    console.log(line);
    console.log("side: " + SideChar[GameBoard.side]);
    console.log("enPass: " + GameBoard.enPas);

    line = "";
    if (GameBoard.castlePerm & CASTLEBIT.WKCA) line += 'K';
    if (GameBoard.castlePerm & CASTLEBIT.WQCA) line += 'Q';
    if (GameBoard.castlePerm & CASTLEBIT.BKCA) line += 'k';
    if (GameBoard.castlePerm & CASTLEBIT.BQCA) line += 'q';
    console.log("castle: " + line);
    console.log("key: " + GameBoard.posKey.toString(16));
    console.log("fen: ", GameBoard.fen)
}

const ResetBoard = () => {
    let i = 0;

    GameBoard.pieces[i] = SQUARES.OFFBOARD;

    for(i=0; i < 64; i++){
        GameBoard.pieces[SQ120(i)] = PIECES.EMPTY;
    }

    for(i=0; i < 14 * 120; i++){
        GameBoard.pList[i] = PIECES.EMPTY;
    }

    for(i=0; i < 2; i++){
        GameBoard.material[i] = 0;
    }

    for(i=0; i < 13; i++){
        GameBoard.pceNum[i] = 0;
    }

    GameBoard.side = COLORS.BOTH;
    GameBoard.enPas = SQUARES.NO_SQ;
    GameBoard.fiftyMove = 0;
    GameBoard.ply = 0;
    GameBoard.hisPly = 0;
    GameBoard.castlePerm = 0;
    GameBoard.posKey = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0;
}


const updateGameBoard = async (source, target, piece, newPosFen) => {

    console.log("updateGameBoard:", GameBoard.fen);
    
    const turn = SideChar[GameBoard.side];
    const fen = `${newPosFen} ${turn} KQkq - 0 1`
    const fenParts = fen.split(' ');
    const position = fenParts[0];
    const fenSide = fenParts[1];
    // const castling = fenParts[2];
    let enPassant = fenParts[3];
    const halfMove = parseInt(fenParts[4], 10);
    const fullMove = parseInt(fenParts[5], 10);
    
    // Update en passant square
    isEnpassantMove(source, target, piece);
    if(GameBoard.enPas === 99){
        enPassant = '-'
    } else {
        enPassant = GameBoard.enPas;
    }
    
    const positionRanks = position.split('/');
    if (positionRanks.length !== 8) {
        console.error("FEN error: Invalid FEN position format; lol your code sucks man!", position);
        return;
    }

    let rank = RANKS.RANK_8;
    for (let i = 0; i < positionRanks.length; i++) {
        const fenRank = positionRanks[i];

        let file = FILES.FILE_A;
        for (let j = 0; j < fenRank.length; j++) {
            const fenChar = fenRank[j];
            let piece = PIECES.EMPTY;
            let count = 1;

            if ('1' <= fenChar && fenChar <= '8') {
                count = parseInt(fenChar, 10);
            } else {
                switch (fenChar) {
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
                    default:
                        console.error("FEN error: Invalid piece character");
                        return;
                }
            }

            for (let k = 0; k < count; k++) {
                const sq120 = FR2SQ(file, rank);
                GameBoard.pieces[sq120] = piece;
                file++;
            }
        }

        rank--;
    }

    // update turn
    GameBoard.side = (fenSide === 'w' ? COLORS.BLACK: COLORS.WHITE);
    

    // Update castling permissions
    UpdateCastlePerm();
    // update castling in fen string
    let updatedCastling = '';
    if (GameBoard.castlePerm & CASTLEBIT.WKCA) updatedCastling += 'K';
    if (GameBoard.castlePerm & CASTLEBIT.WQCA) updatedCastling += 'Q';
    if (GameBoard.castlePerm & CASTLEBIT.BKCA) updatedCastling += 'k';
    if (GameBoard.castlePerm & CASTLEBIT.BQCA) updatedCastling += 'q';
    if (updatedCastling === '') updatedCastling = '-';

    // Update half-move counter
    GameBoard.fiftyMove = halfMove;

    // Update full-move number (this may not be necessary for the GameBoard object, but you can store it if needed)
    GameBoard.hisPly = (fullMove - 1) * 2 + (GameBoard.side === COLORS.BLACK ? 1 : 0);

    // Update the FEN string in GameBoard
    const sideChar = GameBoard.side === COLORS.WHITE ? 'w' : 'b';
    GameBoard.fen = `${position} ${sideChar} ${updatedCastling} ${enPassant} ${halfMove} ${fullMove}`;

    console.log("Updated GameBoard:", GameBoard);
}

