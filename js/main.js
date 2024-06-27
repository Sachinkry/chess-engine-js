var board = null
var $board = $('#myBoard')
var squareClass = 'square-55d63'
var squareToHighlight = null

$(document).ready(function() {
  console.log("Current gameStateFen:", GameBoard.fen);
  const config = {
    position: GameBoard.fen,
    draggable: true,
    onDragStart: onDragStart,
    onDrop: onDrop
  }
  
  board = Chessboard('myBoard', config)

  // Initialize the game board
  initBoard();
  console.log("Main Init Called");
})

function initBoard() {
  console.log("Initializing chess board...")
  initBoardSquares();
  ParseFen(START_FEN);
  PrintBoard();
  updateGameStatusUI()
}

function onDragStart (source, piece, position, orientation) {
  console.log('~~~~~~~~~~~~~ ON DRAG START:', {
    source,
    piece,
    positionFen: Chessboard.objToFen(position),
    orientation
  });
  
  const turn = SideChar[GameBoard.side];
  if ((turn === 'w' && piece.search(/^w/) === -1) ||
      (turn === 'b' && piece.search(/^b/) === -1)) {
    return false
  }

  // only pick up pieces for White
  // if (piece.search(/^b/) !== -1) return false

  if((source === 'e1' || source === 'e8') && (piece[1] === 'K')) {
    console.log("SEND THIS MF TO CHECK FOR CASTLING")
    // CHECK CASTLING
    getLegalMoves(source, piece)
    CheckCastling();
    highlightLegalMoves(piece);
  } else {
    getLegalMoves(source, piece);
    console.log("LOLOLOLOL", GameBoard.moves)
    highlightLegalMoves(piece);

  }

  // try {
  // } catch (error) {
  //     console.error('Error getting legal moves:', error);
  // }
}

function highlightLegalMoves(piece) {
  let lgMoves = []
  lgMoves = GameBoard.moves;

  lgMoves.forEach(sqIndex => {
      const square = SQ120TOFILERANK(sqIndex);
      const squareAttacked = isSquareAttacked(sqIndex, piece);
      $board.find('.square-' + square).addClass('highlight-legal');
      $board.find('.square-' + square)
          .addClass(squareAttacked ? 'highlight-attack' : 'highlight-legal');
      
      console.log(`${square} is ${squareAttacked ? '' : 'not '}attacked`);
  });
}

function onDrop (source, target, piece, newPos, oldPos, orientation) {
  console.log('~~~~~~~~~~~~~~ ON DROP:', {
    source,
    target,
    piece,
    newPos,
    newPosFen: Chessboard.objToFen(newPos),
    oldPosFen: Chessboard.objToFen(oldPos),
    orientation
  });

  var isLegal = isLegalMove(target);
  let newPosFen = Chessboard.objToFen(newPos) 
  let hasPositionChanged = (Chessboard.objToFen(newPos) !== Chessboard.objToFen(oldPos))
  
  if(isLegal && hasPositionChanged){    
    updateGameBoard(newPosFen);
    PrintBoard();
    handleKingCheck();
    updateGameStatusUI(source, target);

    // make random move 
    // setTimeout(gameLoop, 500);
  } else {
    resetHighlights();
    return 'snapback';
  }

  resetHighlights();
}

// * Helper functions
function handleKingCheck() {
  const kingInCheckPos = isKingInCheck();
  if (kingInCheckPos !== -1) {
    GameBoard.isKingInCheck = true;
    
  } else {
    $('.highlight-check').removeClass('highlight-check');
    GameBoard.isKingInCheck = false;
  }
  
  if(isKingInCheck) {
    const square = SQ120TOFILERANK(kingInCheckPos);
    $board.find('.square-' + square).addClass('highlight-check');

  }
}

function resetHighlights() {
  $('.highlight-legal').removeClass('highlight-legal');
  $('.highlight-attack').removeClass('highlight-attack');
}


