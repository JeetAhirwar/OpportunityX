import { Link } from "react-router-dom";
import { Briefcase, Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    "For Job Seekers": [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Career Resources", href: "/blog" },
      { label: "Resume Builder", href: "/resume-parser" },
      { label: "Job Alerts", href: "/candidate/alerts" },
    ],
    "For Recruiters": [
      { label: "Post a Job", href: "/recruiter/post-job" },
      { label: "Pricing", href: "/pricing" },
      { label: "Talent Search", href: "/jobs" },
      { label: "Company Profile", href: "/recruiter/company" },
    ],
    Company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Opportunity<span className="gradient-text">X</span>
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Connecting talent with opportunity. Find your dream job or the perfect candidate with our AI-powered job portal.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} OpportunityX. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms</Link>
            <Link to="/contact" className="text-xs text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
