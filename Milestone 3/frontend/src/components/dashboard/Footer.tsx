import { Github, Linkedin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="w-full py-6 mt-8 border-t border-border/50 bg-background/50 backdrop-blur-sm">
            <div className="container flex flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm text-muted-foreground">
                    Made by <span className="font-semibold text-foreground">Suhas-Ramesha</span>
                </p>
                <div className="flex items-center gap-4">
                    <a
                        href="https://github.com/Suhas-Ramesha"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="GitHub"
                    >
                        <Github className="h-5 w-5" />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/suhas-ramesha/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
};
