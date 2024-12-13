
import { useState } from 'react';

function Square({ value, winningSquare, onSquareClick }) {
  const className = winningSquare ? "winning-square" : "square"
  return <button className={className} onClick={onSquareClick}>{value}</button>;
}

function Board({ xIsNext, squares, onPlay }) {
  // Allow squares to update once clicked
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i][0]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = ["X", false];
    } else {
      nextSquares[i] = ["O", false];
    }
    onPlay(nextSquares);
  }

  // Check if there is a winner, and which squares are the winning squares to be highlighted
  const winningSquares = calculateWinner(squares)
  let status;
  if (winningSquares) {
    const winner = squares[winningSquares[0]][0];
    status = "Winner: " + winner;
    winningSquares.forEach((index) => squares[index][1] = true);
  } else if (
    (() => {
      let full = true;
      for (let i=0; i<squares.length; i++) {
        if (squares[i][0] === null) {
          full = false;
          break;
        }
      }
      return full;
    })()
  ) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  // Create the game board
  let jsx = <div className="status">{status}</div>;
  let newJsx;
  let index = 0;
  for (let i=0; i<3; i++) {
    let jsxFragment;
    let newJsxFragment;
    for (let j=0; j<3; j++) {
      const thisIndex = index;
      newJsxFragment = (
        <>
          {jsxFragment}
          <Square value={squares[index]} winningSquare={squares[index][1]} onSquareClick={() => handleClick(thisIndex)} />
        </>
      );
      jsxFragment = newJsxFragment;
      index++;
    }
    newJsx = (
      <>
        {jsx}
        <div className="board-row">
          {jsxFragment}
        </div>
      </>
    );
    jsx = newJsx;
  }
  return jsx;
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill([null, false])]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  // Update game states each game cycle
  function handlePlay(nextSquares) {
    // Stringifiy nextSquares to create a deep copy and prevent same object reference throughout entire history
    const nextHistory = [...history.slice(0, currentMove + 1), JSON.parse(JSON.stringify(nextSquares))];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  // TIME TRAVEL!!!
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // Create list of previous moves that can be travelled back to
  const moves = history.map((squares, move) => {
    let description;
    
    if (move === currentMove) {
      if (move === 0) {
        description = 'Currently at game start'
      } else {
        description = 'Currently at #' + move;
      }
      return (
        <li key={move}>
          <h5>{description}</h5>
        </li>
      )
    } else {
      if (move > 0) {
        description = 'Go to #' + move;
      } else {
        description = 'Go to game start';
      }
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );
    }
  });

  // Create the game UI
  return (
    <div className="game">
      <div className="gameboard">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

// Check every possible victory line and return the winning square indexes if there is a win
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i=0; i<lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a][0] && squares[a][0] === squares[b][0] && squares[a][0] === squares[c][0]) {
      return [a, b, c];
    }
  }
  return null;
}
