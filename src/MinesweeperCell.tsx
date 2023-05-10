import { useState, useEffect } from 'react';

import { MinesweeperToken, BoardState, ClickState } from './MinesweeperTypes';

interface MinesweeperCellProps {
  token: MinesweeperToken;
  state: BoardState;
  onClick: () => void;
};

function MinesweeperCell({ token, state, onClick }: MinesweeperCellProps) {
  let show: string = ' ';

  if (state === 'revealed') {
    show = token === 'mine' ? '💣' : token.toString();
  } else if (state === 'flagged') {
    show = '🚩';
  }

  return (
    <button onClick={onClick} style={{aspectRatio: 1}}>
      {show}
    </button>
  );
}

export default MinesweeperCell;
