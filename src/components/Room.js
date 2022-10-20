import React from 'react';
import Cursor from './Cursor';
import TextEditor from './TextEditor';
import { USER_COLORS } from '../constants';
import { useOthers, useSelf } from 'y-presence';

const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];

export default function CursorRoom() {
  const others = useOthers();

  const { updatePresence } = useSelf({
    x: 0,
    y: 0,
    color: color,
  });

  const handlePointMove = React.useCallback(
    (e) => {
      updatePresence({
        x: e.clientX,
        y: e.clientY,
      });
    },
    [updatePresence]
  );

  return (
    <div className='room' onPointerMove={handlePointMove}>
      <div className='info'>
        There are currently {others.length} other cursor(s) present in the room
      </div>
      {others.map(({ id, presence }) => {
        if (!presence) return null;
        return (
          <Cursor
            key={id}
            color={presence.color}
            x={presence.x}
            y={presence.y}
          />
        );
      })}
    </div>
  );
}
