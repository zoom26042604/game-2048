'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

interface TileProps {
  value: number;
  row: number;
  col: number;
}

const Tile = memo(function Tile({ value, row, col }: TileProps) {
  // Determine tile class for CSS styling
  const getTileClass = (val: number): string => {
    if (val === 0) return 'tile-0';
    if (val <= 2048) return `tile-${val}`;
    return 'tile-super';
  };

  // Font size based on digits - using clamp for responsive sizing
  const getFontSize = (val: number): string => {
    if (val >= 1000) return 'clamp(14px, 4vmin, 28px)';
    if (val >= 100) return 'clamp(18px, 5vmin, 36px)';
    return 'clamp(22px, 6vmin, 42px)';
  };

  const tileClass = getTileClass(value);

  // Calculate position based on gap (12px) and padding (12px)
  // Calculate position based on gap and padding
  // These will be overridden by CSS for embed mode
  const cellSize = 'calc((100% - 36px) / 4)';
  const gapSize = '12px';

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
        fontWeight: 700,
        fontSize: getFontSize(value),
        top: `calc(${row} * (${cellSize} + ${gapSize}))`,
        left: `calc(${col} * (${cellSize} + ${gapSize}))`,
        boxShadow: value > 0 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        transition: 'top 0.1s, left 0.1s',
      }}
    >
      {value !== 0 && value}
    </motion.div>
  );
});

export default Tile;
