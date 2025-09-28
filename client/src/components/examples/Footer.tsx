import Footer from '../Footer';

export default function FooterExample() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Footer Component</h2>
        <p className="text-muted-foreground">
          Displays the required "Made by Ujwal Guru" text
        </p>
      </div>
      
      {/* Demo content to show footer positioning */}
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-lg text-muted-foreground">Page Content Area</div>
          <div className="text-sm text-muted-foreground">
            The footer will appear at the bottom of the page
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}