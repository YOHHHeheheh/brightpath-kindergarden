import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Image, Leaf, LogOut, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuItems = [{ icon: Image, label: "Gallery manager", path: "/admin" }];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <AccessMessage
        title="Staff sign-in required"
        description="This workspace is reserved for Phanindranath team members. Please sign in with your approved staff account."
        action={<Button onClick={() => startLogin()} className="rounded-full px-6">Sign in securely</Button>}
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <AccessMessage
        title="Staff access only"
        description="Your account is signed in, but it does not have access to the Phanindranath Admin Portal. Please contact the school administrator if you need gallery access."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" className="rounded-full" onClick={() => setLocation("/")}>Return to website</Button>
            <Button variant="ghost" className="rounded-full" onClick={logout}>Sign out</Button>
          </div>
        }
      />
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}

function AccessMessage({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-6 text-[#2d3a31]">
      <section className="max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-[0_22px_70px_rgba(36,54,44,0.12)] sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e5f0e8] text-[#37654a]"><ShieldCheck className="h-7 w-7" /></span>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-[#6e8974]">Phanindranath Nursery School & Kindergarten House</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-[#657268]">{description}</p>
        <div className="mt-8">{action}</div>
      </section>
    </main>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-[#e6e5df] bg-[#253f33] text-white">
        <SidebarHeader className="px-4 py-5">
          <button onClick={() => setLocation("/")} className="flex w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4ad62] text-[#253f33]"><Leaf className="h-5 w-5" /></span>
            <span className="min-w-0 group-data-[collapsible=icon]:hidden"><span className="block font-serif text-base leading-none">Phanindranath</span><span className="mt-1 block text-[8px] uppercase tracking-[0.12em] text-[#c6d6c8]">Staff portal</span></span>
          </button>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={location === item.path}
                  onClick={() => setLocation(item.path)}
                  tooltip={item.label}
                  className="h-11 text-[#ecf2ea] hover:bg-white/10 hover:text-white data-[active=true]:bg-white data-[active=true]:text-[#253f33]"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                <Avatar className="h-9 w-9 border border-white/15"><AvatarFallback className="bg-[#d4ad62] text-xs font-bold text-[#253f33]">{user?.name?.charAt(0).toUpperCase() ?? "S"}</AvatarFallback></Avatar>
                <span className="min-w-0 group-data-[collapsible=icon]:hidden"><span className="block truncate text-sm font-medium">{user?.name ?? "Staff member"}</span><span className="block truncate text-xs text-[#c6d6c8]">Administrator</span></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setLocation("/")} className="cursor-pointer">View public website</DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-[#f8f5ef]">
        {isMobile && <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-[#e6e5df] bg-[#f8f5ef]/95 px-4 backdrop-blur"><SidebarTrigger className="rounded-lg" /><span className="font-serif text-lg text-[#253f33]">Gallery manager</span></header>}
        <main className="min-h-screen p-4 sm:p-7 lg:p-10">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
