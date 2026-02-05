'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

interface TileProps {
  value: number;
  row: number;
  col: number;
}

const EmbedTile = memo(function EmbedTile({ value, row, col }: TileProps) {
  // Determine tile class for CSS styling
  const getTileClass = (val: number): string => {
    if (val === 0) return 'tile-0';
    if (val <= 2048) return `tile-${val}`;
    return 'tile-super';
  };

  // Font size based on digits - smaller for embed
  const getFontSize = (val: number): string => {
    if (val >= 1000) return 'clamp(12px, 3.5vmin, 22px)';
    if (val >= 100) return 'clamp(14px, 4vmin, 28px)';
    return 'clamp(18px, 5vmin, 34px)';
  };

  const tileClass = getTileClass(value);

  // Smaller gaps for embed (8px padding, 8px gap)
  const cellSize = 'calc((100% - 24px) / 4)';
  const gapSize = '8px';

  return (
    <motion.div
      key={`${row}-${col}-${value}`}
      initial={value ? { scale: 0.8, opacity: 0.5 } : { scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.1 }}
      className={`tile ${tileClass}`}
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: cellSize,
        height: cellSize,
        borderRadius: '4px',
        fontWeight: 700,
        fontSize: getFontSize(value),
        top: `calc(${row} * (${cellSize} + ${gapSize}))`,
        left: `calc(${col} * (${cellSize} + ${gapSize}))`,
        boxShadow: value > 0 ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
        transition: 'top 0.1s, left 0.1s',
      }}
    >
      {value !== 0 && value}
    </motion.div>
  );
});

export default EmbedTile;
