import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import OXLogo from "@/components/common/OXLogo";

const Footer = () => {
  const footerLinks = {
    "For Job Seekers": [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Resume Builder", href: "/candidate/resume" },
      { label: "Job Alerts", href: "/candidate/alerts" },
    ],
    "For Recruiters": [
      { label: "Post a Job", href: "/recruiter/post-job" },
      { label: "Talent Search", href: "/jobs" },
      { label: "Company Profile", href: "/recruiter/company" },
    ],
    Company: [
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
      { label: "Public Jobs", href: "/jobs" },
    ],
  };

  return (
    <footer className="border-t border-border/70 bg-card/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <OXLogo className="h-9 w-9" />
              <span className="font-display text-xl font-bold">
                Opportunity<span className="gradient-text">X</span>
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-6 text-muted-foreground">
              A GhostCode Dynamics hiring platform for precise matching,
              real-time collaboration, and cleaner talent operations.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github, Mail].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label={`OpportunityX social link ${index + 1}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-secondary/70 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/15 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 font-display text-sm font-semibold">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">Copyright {new Date().getFullYear()} GhostCode Dynamics / OpportunityX. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/jobs" className="text-xs text-muted-foreground hover:text-foreground">Jobs</Link>
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">Login</Link>
            <Link to="/register" className="text-xs text-muted-foreground hover:text-foreground">Register</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
