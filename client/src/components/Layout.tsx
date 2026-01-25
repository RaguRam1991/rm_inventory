import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingCart, Package, History, Menu, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "POS Terminal", href: "/pos", icon: ShoppingCart },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "History", href: "/history", icon: History },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-primary text-primary-foreground">
      <div className="p-6 border-b border-primary-foreground/10">
        <h1 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary">H</span>
          Hotel POS
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-secondary text-primary font-semibold shadow-lg shadow-black/10" 
                    : "hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-primary-foreground/70 group-hover:text-white")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-foreground/10">
        <Button variant="ghost" className="w-full justify-start text-primary-foreground/70 hover:text-white hover:bg-primary-foreground/10">
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 fixed h-screen shadow-2xl z-50">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 p-4 bg-primary z-40 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-bold font-display text-white">Hotel POS</h1>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-none w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-4 lg:p-8 mt-16 lg:mt-0 max-w-[100vw] overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
