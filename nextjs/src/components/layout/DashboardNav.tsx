"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'Applications', href: '/dashboard/applications', icon: Users },
  ];

  return (
    <nav className="w-64 border-r border-slate-800 h-screen p-6 flex flex-col">
      <div className="text-2xl font-bold text-blue-500 mb-10 px-2">HireIQ</div>
      
      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <button 
        onClick={handleSignOut}
        className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors"
      >
        <LogOut size={20} />
        <span className="font-medium">Sign Out</span>
      </button>
    </nav>
  );
}