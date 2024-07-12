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
    location.reload();
    // board.start();
    // initBoard();
    // $('#myBoard').css('pointer-events', 'auto');
  })

  // Initialize the game board
  initBoard();
  
  console.log("Main Init Called");
})

function initBoard() {
  console.log("Initializing chess board...")
  // initBoardSquares();
  ParseFen(START_FEN);
  PrintBoardInConsole();
  checkGameOver();
  handleKingCheck()
  updateGameStatusUI();
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
  
  getLegalMoves(source, piece);
  console.log("LOLOLOLOL", GameBoard.moves);
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
    updateGameBoard(source, target, piece, newPos, Chessboard.objToFen(newPos) );
    // handleKingCheck();
    // checkGameOver()
    // checkIfGameOver()
    updateGameStatusUI(source, target);
    highlightMove(source,target);
    // make random move 
    if(GameBoard.kingInCheckCount !== 2){
      // setTimeout(gameLoop, 500);
      // makeEvaluatedMove();
      setTimeout(makeEvaluatedMove, 4000);
      // makeEvaluatedMove();
    }
  } else {
    resetHighlights();
    return 'snapback';
  }

  resetHighlights();
}

// * Helper functions

const highlightLegalMoves= (piece) => {
  let lgMoves = []
  lgMoves = GameBoard.moves;

  lgMoves.forEach(sqIndex => {
      const square = SQ120TOFILERANK(sqIndex);
      const squareAttacked = isSquareAttacked(sqIndex, piece);
      $board.find('.square-55d63').removeClass('highlight-move');
      $board.find('.square-' + square).addClass('highlight-legal');
      $board.find('.square-' + square)
          .addClass(squareAttacked ? 'highlight-attack' : 'highlight-legal');
      
      console.log(`${square} is ${squareAttacked ? '' : 'not '}attacked`);
  });
}

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
  // checkGameOver();
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
      const turn = SideChar[GameBoard.side];
      const winner = (turn === 'w') ? 'White' : 'Black';
  
      document.getElementById('winningStatus').innerText = `Game Over: ${winner} won`;
      
      // Disable board
      $('#myBoard').css('pointer-events', 'none');
     
  }
}

const resetHighlights = () => {
  $('.highlight-legal').removeClass('highlight-legal');
  $('.highlight-attack').removeClass('highlight-attack');
}

const highlightMove = (source, target) => {
  // Remove previous highlights
  $board.find('.square-55d63').removeClass('highlight-move');

  // Add highlight class to source and target squares
  $board.find('.square-' + source).addClass('highlight-move');
  $board.find('.square-' + target).addClass('highlight-move');
  
  console.log(`Move highlighted from ${source} to ${target}`);
}






