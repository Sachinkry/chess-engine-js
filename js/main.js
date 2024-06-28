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

  $('#newGameBtn').on('click', ()=> {
    board.start();
    initBoard();
    $('#myBoard').css('pointer-events', 'auto');
  })

  // Initialize the game board
  initBoard();
  console.log("Main Init Called");
})

function initBoard() {
  console.log("Initializing chess board...")
  initBoardSquares();
  ParseFen(START_FEN);
  PrintBoard();
  updateGameStatusUI();
  checkGameOver();
  handleKingCheck()
}



function onDragStart (source, piece, position, orientation) {
  console.log('~~~~~~~~~~~~~ ON DRAG START:', {
    source,
    piece,
    positionFen: Chessboard.objToFen(position),
    orientation
  });

  // Allow dragging only white pieces
  // if (piece.search(/^w/) === -1) {
  //   return false;
  // }
  
  const turn = SideChar[GameBoard.side];
  if ((turn === 'w' && piece.search(/^w/) === -1) ||
      (turn === 'b' && piece.search(/^b/) === -1)) {
    return false
  }

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
  let hasPositionChanged = (Chessboard.objToFen(newPos) !== Chessboard.objToFen(oldPos))
  
  if(isLegal && hasPositionChanged ){   
    
    handleCastleMove(source, target, piece, newPos);
    makeEnpassantMoveIfPossible(source, target, piece, newPos)
    updateGameBoard(source, target, piece, Chessboard.objToFen(newPos) );
    // isEnpassantMove(source, target, piece);
    PrintBoard();
    handleKingCheck();
    checkGameOver()
    updateGameStatusUI(source, target);
    highlightMove(source,target);
    // make random move 
    setTimeout(gameLoop, 500);
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
  } else {
    $('.highlight-check').removeClass('highlight-check');
  }
}

function checkGameOver() {
  const kingInCheckPos = isKingInCheck();

  // Update the KingInCheckCount and isGameOver
  if (kingInCheckPos !== -1) {
      if (GameBoard.isKingInCheck) {
          GameBoard.kingInCheckCount++;
      } else {
          GameBoard.isKingInCheck = true;
          GameBoard.kingInCheckCount = 1;
      }
  } else {
      GameBoard.isKingInCheck = false;
      GameBoard.kingInCheckCount = 0;
  }

  if (GameBoard.kingInCheckCount >= 2) {
      
      GameBoard.isGameOver = true;
     
  }
}

function resetHighlights() {
  $('.highlight-legal').removeClass('highlight-legal');
  $('.highlight-attack').removeClass('highlight-attack');
}

function highlightMove(source, target) {

  // Remove previous highlights
  $board.find('.square-55d63').removeClass('highlight-move');

    // Add highlight class to source and target squares
    $board.find('.square-' + source).addClass('highlight-move');
    $board.find('.square-' + target).addClass('highlight-move');
    
    console.log(`Move highlighted from ${source} to ${target}`);
}

async function handleCastleMove(source, target, piece, newPos) {
  console.log("This mf has been called........")
  // Handle white king-side castling
  if (piece === 'wK') {
      if (source === 'e1' && target === 'g1') {
          GameBoard.pieces[SQUARES.H1] = PIECES.EMPTY;
          GameBoard.pieces[SQUARES.F1] = PIECES.wR;
          board.move('h1-f1')
          // Update newPos
          delete newPos['h1'];
          newPos['f1'] = 'wR';
          console.log("newPOS after castle:", newPos)
      } 
      // Handle white queen-side castling
      else if (source === 'e1' && target === 'c1') {
          GameBoard.pieces[SQUARES.A1] = PIECES.EMPTY;
          GameBoard.pieces[SQUARES.D1] = PIECES.wR;
          board.move('a1-d1')
          delete newPos['a1'];
          newPos['d1'] = 'wR';
      }
  }
  
  // Handle black king-side castling
  if (piece === 'bK') {
      if (source === 'e8' && target === 'g8') {
          GameBoard.pieces[SQUARES.H8] = PIECES.EMPTY;
          GameBoard.pieces[SQUARES.F8] = PIECES.bR;
          board.move('h8-f8')
          delete newPos['h8'];
          newPos['f8'] = 'bR';
      } 
      // Handle black queen-side castling
      else if (source === 'e8' && target === 'c8') {
          GameBoard.pieces[SQUARES.A8] = PIECES.EMPTY;
          GameBoard.pieces[SQUARES.D8] = PIECES.bR;
          board.move('a8-d8')
          // Update newPos
          delete newPos['a8'];
          newPos['d8'] = 'bR';
      }
  }

}


const isEnpassantMove = (source, target, piece) => {
  // Convert source and target to ranks and files
  const sourceFile = source.charCodeAt(0) - 'a'.charCodeAt(0);
  const sourceRank = parseInt(source[1], 10) - 1;
  const targetFile = target.charCodeAt(0) - 'a'.charCodeAt(0);
  const targetRank = parseInt(target[1], 10) - 1;
  const pieceType = piece[1];
  const pieceColor = piece[0]

  // Check if adjacent square (left and right square of target) is opposite pawn
  const isAdjacentAnOppositePawn = () => {
    const leftFile = targetFile - 1;
    const rightFile = targetFile + 1;
    const oppositePawn = (pieceColor === 'w') ? PIECES.bP : PIECES.wP;

    if (leftFile >= FILES.FILE_A) {
      const leftSq = FR2SQ(leftFile, targetRank);
      if (GameBoard.pieces[leftSq] === oppositePawn) {
        return true;
      }
    }

    if (rightFile <= FILES.FILE_H) {
      const rightSq = FR2SQ(rightFile, targetRank);
      if (GameBoard.pieces[rightSq] === oppositePawn) {
        return true;
      }
    }

    return false;
  };


  // Check if the piece is a pawn and it moved two squares
  if (pieceType === 'P' && isAdjacentAnOppositePawn()) {
    if (pieceColor === 'w' && sourceRank === 1 && targetRank === 3) {
      GameBoard.enPas = FR2SQ(targetFile, 2); // Set enPas to the square behind the pawn
    } else if (pieceColor === 'b' && sourceRank === 6 && targetRank === 4) {
      GameBoard.enPas = FR2SQ(targetFile, 5); // Set enPas to the square behind the pawn
    } else {
      GameBoard.enPas = SQUARES.NO_SQ; // Reset enPas if it's not a two-square pawn move
    }
  } else {
    GameBoard.enPas = SQUARES.NO_SQ; // Reset enPas if it's not a two-square pawn move
  }

  console.log("enPassant square:::::::::::::: ", GameBoard.enPas, {sourceFile, sourceRank, targetFile, targetRank})
};


const makeEnpassantMoveIfPossible = async (source, target, piece, newPos) => {
  
  const enPassSq = SQ120TOFILERANK(GameBoard.enPas)
  if(piece == 'bP' && target === enPassSq ){
    const capturePawnSq = SQ120TOFILERANK(GameBoard.enPas+10)
    console.log("UPDATED ENPASS PAWN CAPTURE..... ", enPassSq, target, GameBoard.enPas + 10)
    
    console.log(typeof(capturePawnSq), board.position() ,newPos)
    // let piecesPos =  
    delete newPos[capturePawnSq]
    board.position(newPos, false)
    console.log(newPos[capturePawnSq], newPos[enPassSq])
    
  } 
  if(piece == 'wP' && target === enPassSq ){
    const capturePawnSq = SQ120TOFILERANK(GameBoard.enPas - 10);
    console.log("UPDATED ENPASS PAWN CAPTURE..... ", enPassSq, target, GameBoard.enPas + 10)
    
    console.log(typeof(capturePawnSq), board.position())
    delete newPos[capturePawnSq]
    board.position(newPos, false)
    console.log(newPos[capturePawnSq], newPos[enPassSq])
    
  } 

  
}




