import PatternGrid from '../PatternGrid';
import { useState } from 'react';
import { validatePatternStrength } from '../../lib/crypto';

export default function PatternGridExample() {
  const [pattern, setPattern] = useState<number[]>([]);
  
  const handlePatternChange = (newPattern: number[]) => {
    setPattern(newPattern);
    console.log('Pattern changed:', newPattern);
    
    if (newPattern.length >= 4) {
      const validation = validatePatternStrength(newPattern);
      console.log('Pattern validation:', validation);
    }
  };

  const validation = pattern.length >= 4 ? validatePatternStrength(pattern) : null;

  return (
    <div className="p-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">Draw Your Security Pattern</h2>
        <p className="text-muted-foreground">Connect at least 4 dots to create your encryption pattern</p>
      </div>
      
      <PatternGrid onPatternChange={handlePatternChange} />
      
      {pattern.length > 0 && (
        <div className="text-center space-y-2">
          <div className="text-sm font-mono text-muted-foreground">
            Pattern: {pattern.join(' → ')}
          </div>
          {validation && (
            <div className={`text-sm font-medium ${
              validation.strength === 'strong' ? 'text-green-400' :
              validation.strength === 'medium' ? 'text-yellow-400' : 'text-destructive'
            }`}>
              {validation.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}