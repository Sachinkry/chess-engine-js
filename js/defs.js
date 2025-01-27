const PIECES = {
    EMPTY: 0, 
    wP: 1, wN: 2, wB: 3, wR: 4, wQ: 5, wK: 6, 
    bP: 7, bN: 8, bB: 9, bR: 10, bQ: 11, bK: 12, 
};

const PIECES_ = [
    'EMPTY', 'wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 
    'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'
];

const pieceDirections = {
    'p': [-10, -20, -11, -9], // White pawns
    'P': [10, 20, 11, 9],     // Black pawns
    'N': [-21, -19, -12, -8, 8, 12, 19, 21],
    'B': [-11, -9, 9, 11],
    'R': [-10, -1, 1, 10],
    'Q': [-11, -10, -9, -1, 1, 9, 10, 11],
    'K': [-11, -10, -9, -1, 1, 9, 10, 11]
};

const BRD_SQ_NUM = 120;

const FILES = { 
    FILE_A: 0, FILE_B: 1, FILE_C: 2, FILE_D: 3,
    FILE_E: 4, FILE_F: 5, FILE_G: 6, FILE_H: 7,
    FILE_NONE: 8
}

const RANKS = {
    RANK_1: 0, RANK_2: 1, RANK_3: 2, RANK_4: 3, 
    RANK_5: 4, RANK_6: 5, RANK_7: 6, RANK_8: 7,
    RANK_NONE: 8,
}

const COLORS = { WHITE: 0, BLACK: 1, BOTH: 2}

const CASTLEBIT = { WKCA: 1, WQCA: 2, BKCA: 4, BQCA: 8 }

const SQUARES = {
    A1: 21, B1: 22, C1: 23, D1: 24, E1: 25, F1: 26, G1: 27, H1: 28,
    A8: 91, B8: 92, C8: 93, D8: 94, E8: 95, F8: 96, G8: 97, H8: 98,
    NO_SQ: 99, OFFBOARD: 100
}

const BOOL = { FALSE: 0, TRUE: 1 }

const MAXGAMEMOVES = 2048;
const MAXPOSITIONMOVES = 256;
const MAXDEPTH = 64;

const FilesBrd = new Array(BRD_SQ_NUM); 
const RanksBrd = new Array(BRD_SQ_NUM);

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const PceChar = ".PNBRQKpnbrqk";
const SideChar = "wb.";
const RankChar = "12345678";
const FileChar = "abcdefgh";

const PieceBig = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
const PieceMaj = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
const PieceMin = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
const PieceVal= [ 0, 100, 325, 325, 550, 1000, 50000, -100, -325, -325, -550, -1000, -50000  ];
const PieceCol = [ COLORS.BOTH, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE,
	COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK ];
	
const PiecePawn = [ BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];	
const PieceKnight = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
const PieceKing = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE ];
const PieceRookQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
const PieceBishopQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE ];
const PieceSlides = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];

const PieceKeys = new Array(14 * 120);
var SideKey;
const CastleKeys = new Array(16);

const Sq120ToSq64 = new Array(BRD_SQ_NUM);
const Sq64ToSq120 = new Array(64);

