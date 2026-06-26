import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/AuthContext";
import { useTheme } from "@/store/ThemeContext";
import {
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  MessageSquare,
  User,
  ChevronDown,
  LogOut,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import OXLogo from "@/components/common/OXLogo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/features/chat/ChatContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { unreadMessages, unreadNotifications } = useChat();

  const isActive = (path: string) => location.pathname === path;

  const publicLinks = [
    { label: "Find Jobs", href: "/jobs" },
    { label: "For Candidates", href: "/register?role=candidate" },
    { label: "For Recruiters", href: "/register?role=recruiter" },
  ];

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "candidate": return "/candidate/dashboard";
      case "recruiter": return "/recruiter/dashboard";
      case "admin": return "/admin/dashboard";
      default: return "/";
    }
  };
  const getProfileLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "candidate": return "/candidate/profile";
      case "recruiter": return "/recruiter/profile";
      case "admin": return "/admin/profile";
      default: return "/";
    }
  };
  const getSettingsLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "candidate": return "/candidate/settings";
      case "recruiter": return "/recruiter/settings";
      case "admin": return "/admin/settings";
      default: return "/";
    }
  };
  const messagesLink = user?.role === "recruiter" ? "/recruiter/chat" : "/candidate/chat";
  const notificationsLink = user?.role === "recruiter" ? "/recruiter/notifications" : user?.role === "admin" ? "/admin/notifications" : "/candidate/notifications";

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/78 shadow-[0_10px_34px_hsl(224_48%_3%/0.16)] backdrop-blur-2xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <OXLogo className="h-9 w-9" />
          <span className="font-display text-xl font-bold tracking-normal">
            Opportunity<span className="gradient-text">X</span>
          </span>
          <span className="hidden rounded-full border border-border/70 bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground lg:inline-flex">
            GhostCode Dynamics
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-all hover:bg-secondary/80 hover:text-foreground ${
                isActive(link.href) ? "bg-secondary text-foreground shadow-inner" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="View notifications" asChild>
                <Link to={notificationsLink}>
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">{Math.min(unreadNotifications, 99)}</span>}
                </Link>
              </Button>
              {user?.role !== "admin" && (
                <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Open messages" asChild>
                  <Link to={messagesLink}>
                    <MessageSquare className="h-4 w-4" />
                    {unreadMessages > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{Math.min(unreadMessages, 99)}</span>}
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 rounded-full pl-2 pr-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary ring-1 ring-primary/30">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={getProfileLink()} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={getSettingsLink()} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-2xl md:hidden"
          >
            <div className="container mx-auto space-y-1 px-4 py-4">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive(link.href) ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

