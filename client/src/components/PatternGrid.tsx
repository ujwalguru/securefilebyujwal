import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PatternGridProps {
  onPatternChange: (pattern: number[]) => void;
  disabled?: boolean;
  className?: string;
}

const DOT_POSITIONS = [
  { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
  { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
  { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
];

export default function PatternGrid({ onPatternChange, disabled = false, className }: PatternGridProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getDotIndex = (clientX: number, clientY: number): number | null => {
    if (!svgRef.current) return null;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 300;
    const y = ((clientY - rect.top) / rect.height) * 300;
    
    for (let i = 0; i < DOT_POSITIONS.length; i++) {
      const dotX = DOT_POSITIONS[i].x * 100 + 50;
      const dotY = DOT_POSITIONS[i].y * 100 + 50;
      const distance = Math.sqrt((x - dotX) ** 2 + (y - dotY) ** 2);
      if (distance <= 25) return i;
    }
    return null;
  };

  const addDotToPattern = useCallback((dotIndex: number) => {
    if (pattern.includes(dotIndex)) return;
    
    const newPattern = [...pattern, dotIndex];
    setPattern(newPattern);
    onPatternChange(newPattern);
  }, [pattern, onPatternChange]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const dotIndex = getDotIndex(clientX, clientY);
    if (dotIndex !== null) {
      setIsDrawing(true);
      setPattern([dotIndex]);
      onPatternChange([dotIndex]);
      setCurrentPos({ x: clientX, y: clientY });
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setCurrentPos({ x: clientX, y: clientY });
    
    const dotIndex = getDotIndex(clientX, clientY);
    if (dotIndex !== null && !pattern.includes(dotIndex)) {
      addDotToPattern(dotIndex);
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
    setCurrentPos(null);
  };

  const clearPattern = () => {
    setPattern([]);
    onPatternChange([]);
    setIsDrawing(false);
    setCurrentPos(null);
  };

  const getLinesBetweenDots = () => {
    const lines = [];
    for (let i = 0; i < pattern.length - 1; i++) {
      const from = DOT_POSITIONS[pattern[i]];
      const to = DOT_POSITIONS[pattern[i + 1]];
      lines.push({
        x1: from.x * 100 + 50,
        y1: from.y * 100 + 50,
        x2: to.x * 100 + 50,
        y2: to.y * 100 + 50,
        key: `line-${i}`
      });
    }
    return lines;
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="relative">
        <svg
          ref={svgRef}
          width="300"
          height="300"
          className="border-2 border-primary/20 rounded-lg bg-card/50 cursor-crosshair select-none"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          data-testid="pattern-grid"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="300" height="300" fill="url(#grid)" />
          
          {/* Connection lines */}
          {getLinesBetweenDots().map(line => (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="100%"
              className="animate-line-draw"
              style={{ animationDelay: `${pattern.indexOf(parseInt(line.key.split('-')[1])) * 0.1}s` }}
            />
          ))}
          
          {/* Active drawing line */}
          {isDrawing && pattern.length > 0 && currentPos && svgRef.current && (
            <line
              x1={DOT_POSITIONS[pattern[pattern.length - 1]].x * 100 + 50}
              y1={DOT_POSITIONS[pattern[pattern.length - 1]].y * 100 + 50}
              x2={((currentPos.x - svgRef.current.getBoundingClientRect().left) / svgRef.current.getBoundingClientRect().width) * 300}
              y2={((currentPos.y - svgRef.current.getBoundingClientRect().top) / svgRef.current.getBoundingClientRect().height) * 300}
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.6"
            />
          )}
          
          {/* Dots */}
          {DOT_POSITIONS.map((pos, index) => (
            <circle
              key={index}
              cx={pos.x * 100 + 50}
              cy={pos.y * 100 + 50}
              r={pattern.includes(index) ? "12" : "8"}
              fill={pattern.includes(index) ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
              stroke={pattern.includes(index) ? "hsl(var(--primary-foreground))" : "hsl(var(--border))"}
              strokeWidth="2"
              className={cn(
                "transition-all duration-200",
                pattern.includes(index) && "animate-pattern-pulse"
              )}
              data-testid={`pattern-dot-${index}`}
            />
          ))}
        </svg>
        
        {disabled && (
          <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
            <div className="text-muted-foreground text-sm">Pattern locked</div>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          Connected: {pattern.length} dots
        </div>
        <button
          onClick={clearPattern}
          disabled={disabled || pattern.length === 0}
          className="text-sm text-destructive hover:text-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-clear-pattern"
        >
          Clear Pattern
        </button>
      </div>
    </div>
  );
}