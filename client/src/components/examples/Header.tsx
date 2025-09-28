import Header from '../Header';
import { useState } from 'react';

export default function HeaderExample() {
  const [menuClicked, setMenuClicked] = useState(false);

  const handleMenuClick = () => {
    setMenuClicked(!menuClicked);
    console.log('Menu clicked, state:', !menuClicked);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center">Header Component</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Basic Header</h3>
            <Header />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Header with Menu</h3>
            <Header 
              showMenu={true} 
              onMenuClick={handleMenuClick}
            />
            {menuClicked && (
              <div className="mt-2 p-2 bg-accent rounded text-sm">
                Menu is open! (click menu button to toggle)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo content to show sticky behavior */}
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Scroll down to see the sticky header behavior...</p>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>
            This is demo content line {i + 1}. The header should remain visible while scrolling.
          </p>
        ))}
      </div>
    </div>
  );
}