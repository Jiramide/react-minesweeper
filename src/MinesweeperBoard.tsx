import { useState, useEffect } from 'react';

import MinesweeperCell from './MinesweeperCell';
import { MinesweeperToken, BoardState, ClickState } from './MinesweeperTypes';

const isBounded = (x: number, max: number): boolean => x >= 0 && x < max;
const flatten = (x: number, y: number, width: number, height: number) => y * width + x;
const unflatten = (ind: number, width: number, height: number): number[] => [ind % width, Math.floor(ind / width)];
const isNumber = (x: unknown): x is number => !Number.isNaN(Number(x));

function getNeighbours(width: number, height: number, x: number, y: number): number[] {
  const neighbours: number[] = [];

  for (let yOffset = -1; yOffset <= 1; yOffset++) {
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      if (yOffset === 0 && xOffset === 0) {
        continue;
      }

      const neighbourX = x + xOffset;
      const neighbourY = y + yOffset;

      const xIsBounded = isBounded(neighbourX, width);
      const yIsBounded = isBounded(neighbourY, height);

      if (xIsBounded && yIsBounded) {
        neighbours.push(flatten(neighbourX, neighbourY, width, height));
      }
    }
  }

  return neighbours;
}

function produceMinesweeperBoard(width: number, height: number, mines: number): MinesweeperToken[] {
  const newBoard: MinesweeperToken[] = Array(width * height).fill(0);
  let minesRemaining = mines;

  while (minesRemaining > 0) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * width);
    const flattened = flatten(x, y, width, height);

    if (newBoard[flattened] !== 'mine') {
      newBoard[flattened] = 'mine';
      getNeighbours(width, height, x, y).forEach((ind) => {
        const n = newBoard[ind];
        if (isNumber(n)) {
          newBoard[ind] = n + 1;
        }
      });

      minesRemaining -= 1;
    } else {
      continue;
    }
  }

  return newBoard;
}

interface MinesweeperBoardProps {
  width: number;
  height: number;
  mines: number;
};

function MinesweeperBoard({ width, height, mines }: MinesweeperBoardProps) {
  const [board, setBoard] = useState<MinesweeperToken[]>([]);
  const [boardState, setBoardState] = useState<BoardState[]>([]);
  const [clickState, setClickState] = useState<ClickState>('reveal');
  const [gameState, setGameState] = useState<'playing' | 'win' | 'lose'>('playing');

  const resetBoard = () => {
    setBoard(produceMinesweeperBoard(width, height, mines));
    setBoardState(Array(width * height).fill('unrevealed'));
    setGameState('playing');
  };

  useEffect(resetBoard, []);

  useEffect(() => {
    for (let ind = 0; ind < board.length; ind++) {
      if (boardState[ind] !== 'revealed' && board[ind] !== 'mine') {
        return;
      }
    }

    setGameState('win');
    console.log("you win!");
  }, [boardState]);

  const revealCell = (ind: number) => {
    if (gameState !== 'playing') {
      return;
    }

    setBoardState((prevBoardState) => {
      const newBoardState = [...prevBoardState];
      const visitQueue: number[] = [ind];
      const visited: Set<number> = new Set();

      while (visitQueue.length > 0) {
        const visitIndex = visitQueue.pop();
        const [x, y] = unflatten(visitIndex, width, height);
        const boardState = prevBoardState[visitIndex];
        const adjacentMines = board[visitIndex];

        if (visited.has(visitIndex)) {
          continue;
        }

        visited.add(visitIndex);

        if (boardState === 'flagged') {
          continue;
        }

        newBoardState[visitIndex] = 'revealed';

        if (adjacentMines === 0) {
          getNeighbours(width, height, x, y).forEach((ind) => {
            visitQueue.push(ind);
          });
        }
      }

      return newBoardState;
    });
  };

  const flagCell = (ind: number) => {
    if (gameState !== 'playing') {
      return;
    }

    setBoardState((prevBoardState) =>
      prevBoardState.map((prevState, boardInd) => {
        if (ind === boardInd) {
          if (prevState !== 'revealed') {
            return prevState === 'flagged'
              ? 'unrevealed'
              : 'flagged';
          }
        }

        return prevState;
      })
    );
  };

  const revealMines = (ind: number) => {
    if (gameState !== 'playing') {
      return;
    }

    if (boardState[ind] === 'flagged') {
      return;
    }

    setGameState('lose');

    setBoardState((prevBoardState) =>
      prevBoardState.map((prevState, boardInd) =>
        board[boardInd] === 'mine'
          ? 'revealed'
          : prevState
      )
    );
  }

  const switchClickState = () => {
    setClickState((prevState) =>
      prevState === 'reveal'
        ? 'flag'
        : 'reveal'
    );
  }

  return (
    <>
      <div
        className='minesweeper-board'
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          gridGap: '5px',
          width: '50%',
        }}
      >
        {
          board.map((token: MinesweeperToken, ind) =>
            <MinesweeperCell
              key={ind}
              token={token}
              state={boardState[ind]}
              onClick={
                  clickState === 'flag'
                  ? () => flagCell(ind)
                  : board[ind] === 'mine'
                  ? () => revealMines(ind)
                  : () => revealCell(ind)
              }
            />
          )
        }
      </div>

      <p>Currently {clickState === 'reveal' ? 'revealing 🔍' : 'flagging 🚩'} cells</p>
      <button
        className='minesweeper-switch-action'
        onClick={switchClickState}
      >
        {clickState === 'reveal' ? '🚩' : '🔍'}
      </button>
      <button className='minesweeper-reset' onClick={resetBoard}>Reset</button>
      { gameState !== 'playing' && <p> { gameState === 'win' ? 'congrats!' : 'you lose : (' } </p> }
    </>
  );
}

export default MinesweeperBoard;
