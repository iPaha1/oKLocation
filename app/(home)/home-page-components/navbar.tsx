/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./logo";
import { 
  Menu, 
  HelpCircle,
  Boxes,
  Search,
  MapPin,
  Home,
  Book,
  Computer, 
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
// import FindAddressDialog from "./find-location";
// import GenerateAddressDialog from "./generate-address";
// import OpenStreetGenerateAddressDialog from "./get-address-with-open-street";

const navItems = [
  {
    label: "Get Your Address",
    href: "/generate-address",
    icon: Home
  },
  {
    label: "Find Address",
    href: "/find-address",
    icon: Search
  },
  {
    label: "Developers",
    href: "/documentation",
    icon: Boxes
  },
  {
    label: "Blog",
    href: "/blog",
    icon: Computer
  },
  {
    label: "Help Center",
    href: "/help",
    icon: HelpCircle
  },
];

const mobileNavItems = [
  // {
  //   label: "Find Address",
  //   href: "/find",
  //   icon: Search
  // },
  // {
  //   label: "Generate Address",
  //   href: "/generate-address",
  //   icon: MapPin
  // },
  {
    label: "Get Your Address",
    href: "/generate-address",
    icon: Home
  },
  {
    label: "Find Address",
    href: "/developers",
    icon: Search
  },
  {
    label: "Developers",
    href: "/developers",
    icon: Boxes
  },
  {
    label: "Blog",
    href: "/blog",
    icon: Computer
  },
  {
    label: "Help Center",
    href: "/help",
    icon: HelpCircle
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 py-4 backdrop-blur-md w-full z-50">
      <div className="flex items-center justify-between mx-auto max-w-7xl px-4">
        {/* Logo Section */}
        <div className="flex items-center gap-[2px]">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {/* <nav className="hidden md:flex items-center gap-6">
            <FindAddressDialog />
            <GenerateAddressDialog />
            <OpenStreetGenerateAddressDialog />
          </nav> */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 text-sm font-medium hover:font-bold transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section with Sheet for Mobile Menu */}
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 text-sm font-medium p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navbar;