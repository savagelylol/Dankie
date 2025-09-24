import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-6">
            <Link 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="footer-about"
            >
              About
            </Link>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-discord"
            >
              Discord
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-reddit"
            >
              Reddit
            </a>
            <Link 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="footer-support"
            >
              Support
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 Funny Economy - Your favorite meme economy game! 🚀
          </p>
          <p className="text-muted-foreground text-xs">
            Built with ❤️ and lots of memes | Not affiliated with Dank Memer
          </p>
        </div>
      </div>
    </footer>
  );
}
