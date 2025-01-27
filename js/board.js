
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
    isGameOver: false,
    isKingInCheck: false,
};
// kingInCheckCount: 0,
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

const PrintBoardInConsole = () => {
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

function updateGameBoard(source, target, piece, newPos, newPosFen) {

    console.log("updateGameBoard:", GameBoard.fen);
    
    
    const turn = SideChar[GameBoard.side];
    const fen = `${newPosFen} ${turn} KQkq - 0 1`
    // const fen = GameBoard.fen;
    const fenParts = fen.split(' ');
    let position = fenParts[0];
    const fenSide = fenParts[1];
    let castling = fenParts[2];
    let enPassant = fenParts[3];
    const halfMove = parseInt(fenParts[4], 10);
    const fullMove = parseInt(fenParts[5], 10);
    
    newPos = makeEnpassantMove(source, target, piece, newPos)
    position = posObjToFen(newPos)
    // check if enPass possible & update GameBoard.enPas
    isEnpassantMove(source, target, piece);
    if(GameBoard.enPas === 99 || GameBoard.enPas === 0){
        enPassant = '-'
    } else {
        enPassant = GameBoard.enPas;
    }
    
    const positionRanks = position.split('/');
    if (positionRanks.length !== 8) {
        console.error("FEN error: Invalid FEN position format; lol your code sucks man!", position);
        return;
    }

    //? Update GameBoard.pieces
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
    
    // update castle Permissions & UI if castle move happens
    castling = updateBoardAfterCastleing(source, target, piece, newPos);

    // Update half-move counter
    GameBoard.fiftyMove = halfMove;

    // Update full-move number (this may not be necessary for the GameBoard object, but you can store it if needed)
    GameBoard.hisPly = (fullMove - 1) * 2 + (GameBoard.side === COLORS.BLACK ? 1 : 0);

    // Update the FEN string in GameBoard
    const sideChar = GameBoard.side === COLORS.WHITE ? 'w' : 'b';
    GameBoard.fen = `${position} ${sideChar} ${castling} ${enPassant} ${halfMove} ${fullMove}`;

    let isGameover = isGameOver(GameBoard.fen, (sideChar === 'w' ? true: false))
    GameBoard.isGameOver = isGameover;
    PrintBoardInConsole();
    console.log("Updated GameBoard:", GameBoard);
}

//* Helper functions
// update Ui and castle permissions
const updateBoardAfterCastleing = (source, target, piece, newPos) => {
    console.log("This function has been called...");
  
    const isKingSideCastle = (source, target, rank) => source === `e${rank}` && target === `g${rank}`;
    const isQueenSideCastle = (source, target, rank) => source === `e${rank}` && target === `c${rank}`;
  
    const updatePosition = (oldPos, newPos, piece) => {
      GameBoard.pieces[oldPos] = PIECES.EMPTY;
      GameBoard.pieces[newPos] = piece;
      delete newPos[oldPos];
      newPos[newPos] = PIECES_[piece];
    };
  
    const handleCastle = (rank, rookOldPos, rookNewPos, rookPiece) => {
      updatePosition(rookOldPos, rookNewPos, rookPiece);
      board.move(`${rookOldPos}-${rookNewPos}`);
      newPos[rookNewPos] = PIECES_[rookPiece];
    };
  
    if (piece === 'wK') {
      if (isKingSideCastle(source, target, 1)) {
        handleCastle(1, 'h1', 'f1', PIECES.wR);
      } else if (isQueenSideCastle(source, target, 1)) {
        handleCastle(1, 'a1', 'd1', PIECES.wR);
      }
    } else if (piece === 'bK') {
      if (isKingSideCastle(source, target, 8)) {
        handleCastle(8, 'h8', 'f8', PIECES.bR);
      } else if (isQueenSideCastle(source, target, 8)) {
        handleCastle(8, 'a8', 'd8', PIECES.bR);
      }
    }

    // update/revoke castle Permissions in GameBoard.castlePerm
    UpdateCastlePerm();

    // update castle Perm string
    let castlingStr = '';
    if (GameBoard.castlePerm & CASTLEBIT.WKCA) castlingStr += 'K';
    if (GameBoard.castlePerm & CASTLEBIT.WQCA) castlingStr += 'Q';
    if (GameBoard.castlePerm & CASTLEBIT.BKCA) castlingStr += 'k';
    if (GameBoard.castlePerm & CASTLEBIT.BQCA) castlingStr += 'q';
    if (castlingStr === '') castlingStr = '-';
    return castlingStr;
}

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