function testIsGameOver() {
    const testCases = [
        {
            fen: '8/8/8/8/8/5k2/4q3/4K3 w - - 0 1',
            expected: true, // Checkmate
            description: "Checkmate position"
        },
        {
            fen: '8/8/8/8/8/5k2/8/4K3 w - - 0 1',
            expected: false, // In check but not checkmate
            description: "In check but not checkmate"
        },
        {
            fen: '8/8/8/8/8/5k2/8/4K3 w - - 0 1',
            expected: false, // No check
            description: "No check"
        }
    ];

    testCases.forEach((testCase, index) => {
        const result = isGameOver(testCase.fen);
        console.log(`Test Case ${index + 1}: ${testCase.description}`);
        console.log(`Expected: ${testCase.expected}, Got: ${result}`);
        console.log(result === testCase.expected ? "PASS" : "FAIL");
        console.log('-------------------------------------------');
    });
}

// Run the test function
// testIsGameOver();

function testGetAllLegalMovesObjs() {
    const testCases = [
        {
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            isMaximizingPlayer: true,
            description: "Starting position for white",
        },
        {
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 1 1',
            isMaximizingPlayer: false,
            description: "Starting position for black",
        },
        {
            fen: 'rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 2',
            isMaximizingPlayer: true,
            description: "Position with some knights moved",
        },
        {
            fen: 'rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 2 2',
            isMaximizingPlayer: false,
            description: "Position with some knights moved, black to move",
        }
    ];

    testCases.forEach((testCase, index) => {
        console.log(`Test Case ${index + 1}: ${testCase.description}`);
        const legalMoves = getChildren(testCase.fen, testCase.isMaximizingPlayer);
        console.log(`Legal moves for ${testCase.isMaximizingPlayer ? 'white' : 'black'}:`);
        console.log(legalMoves, getLegalMoves('b1', 'wN'));
        console.log('-------------------------------------------');
    });
}

// Run the test function
// testGetAllLegalMovesObjs();

function testPosObjToFen() {
    const testCases = [
        {
            name: "Starting position",
            input: {
                a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR',
                a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
                a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
                a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR'
            },
            expected: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
        },
        {
            name: "Mid-game position with captures",
            input: {
                a1: 'wR', c1: 'wB', e1: 'wK', f1: 'wR',
                a2: 'wP', b2: 'wP', g2: 'wP', h2: 'wP',
                c3: 'wN', f3: 'wP',
                d4: 'wP', e4: 'wP',
                f5: 'wN',
                d6: 'bP',
                c7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
                a8: 'bR', d8: 'bQ', e8: 'bK', h8: 'bR'
            },
            expected: 'r2qk2r/2p1pppp/3p4/5N2/3PP3/2N2P2/PP4PP/R1B1KR2'
        },
        {
            name: "Empty board",
            input: {},
            expected: '8/8/8/8/8/8/8/8'
        },
        {
            name: "Board with invalid pieces",
            input: {
                a1: 'wR', b1: 'invalid', c1: 'wB',
                a7: 'bP', b7: 123, c7: 'bP'
            },
            expected: '8/p1p5/8/8/8/8/8/R1B5'
        },
        {
            name: "Board with multiple captures",
            input: {
                e1: 'wK', g1: 'wR',
                f2: 'wP', g2: 'wP', h2: 'wP',
                e3: 'wP',
                d5: 'wQ',
                e6: 'bP',
                e8: 'bK', h8: 'bR'
            },
            expected: '4k2r/8/4p3/3Q4/8/4P3/5PPP/4K1R1'
        }
    ];

    testCases.forEach(testCase => {
        try {
            const result = posObjToFen(testCase.input);
            console.log(`Test: ${testCase.name}`);
            console.log(`Result: ${result === testCase.expected ? 'PASS' : 'FAIL'}`);
            console.log(`Expected: ${testCase.expected}`);
            console.log(`Actual: ${result}`);
            console.log('---');
        } catch (error) {
            console.log(`Test: ${testCase.name}`);
            console.log(`Result: ERROR - ${error.message}`);
            console.log('---');
        }
    });

    // Test invalid input
    try {
        posObjToFen(null);
        console.log('Invalid input test: FAIL - Should have thrown an error');
    } catch (error) {
        console.log('Invalid input test: PASS - Error thrown as expected');
    }
}

// Run the tests
// testPosObjToFen();

function testProblematicFen() {
    const problematicBoard = {
        a8: 'bR', b8: 'bN', c8: 'bB', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
        a7: 'bP', b7: 'bP', d7: 'bP', e7: 'bP', g7: 'bP', h7: 'bP',
        f6: 'bP',
        c5: 'wP',
        e4: 'wP',
        a2: 'wP', b2: 'wP', c2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
        a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR'
    };

    console.log("Testing problematic board:");
    const result = posObjToFen(problematicBoard);
    console.log(`Result: ${result}`);
    console.log(`Expected: rnb1kbnr/pp1pp1pp/5p2/2P5/4P3/8/PPP2PPP/RNBQKBNR`);
    console.log(`Matches expected: ${result === 'rnb1kbnr/pp1pp1pp/5p2/2P5/4P3/8/PPP2PPP/RNBQKBNR'}`);
}

// testProblematicFen();


function testIsGameOver() {
    const tests = [
        {
            posFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            maximizingPlayer: true,
            expected: false,
            description: 'Starting position'
        },
        {
            posFen: 'rnb1kbnr/pppppppp/8/8/4P3/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
            maximizingPlayer: true,
            expected: false,
            description: 'King is not in check'
        },
        {
            posFen: 'rnbqkb1r/pppppppp/8/8/4P3/8/PPP1PPPP/RNBQK1NR b KQkq - 0 1',
            maximizingPlayer: true,
            expected: true,
            description: 'White king in check by queen'
        },
        {
            posFen: 'rnb1kbnr/pppppppp/8/8/4P3/8/PPP1PPPP/RNBQ1KNR b KQkq - 0 1',
            maximizingPlayer: true,
            expected: false,
            description: 'Black king in check by pawn'
        },
        {
            posFen: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
            maximizingPlayer: true,
            expected: false,
            description: 'Kings only, not in check'
        },
        {
            posFen: '4k3/8/8/8/8/8/8/5K2 w - - 0 1',
            maximizingPlayer: true,
            expected: true,
            description: 'White king in check by black king'
        },
        {
            posFen: '4k3/8/8/8/8/8/8/8 w - - 0 1',
            maximizingPlayer: true,
            expected: true,
            description: 'Missing white king'
        },
        {
            posFen: '8/8/8/8/8/8/8/8 w - - 0 1',
            maximizingPlayer: true,
            expected: true,
            description: 'Missing both kings'
        }
    ];

    tests.forEach(test => {
        const result = isGameOver(test.posFen, test.maximizingPlayer);
        console.log(`${test.description}: ${result === test.expected ? 'PASSED' : 'FAILED'}`);
    });
}

// testIsGameOver();
