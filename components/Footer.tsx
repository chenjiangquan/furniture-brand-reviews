import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const columns = [
  {
    title: "Platform",
    links: [
      ["About us", "/about"],
      ["How it works", "#"],
      ["Review guidelines", "/review-guidelines"],
      ["Report a review", "/report-review"],
      ["Contact", "/contact"]
    ]
  },
  {
    title: "For reviewers",
    links: [
      ["Write a review", "/brands"],
      ["Reviewer rules", "/review-guidelines"],
      ["Privacy choices", "/privacy-policy"],
      ["Help centre", "#"],
      ["Trust & safety", "#"]
    ]
  },
  {
    title: "For businesses",
    links: [
      ["Claim your profile", "/contact"],
      ["Business login", "#"],
      ["Respond to reviews", "#"],
      ["Brand tools", "#"],
      ["Pricing coming soon", "#"]
    ]
  },
  {
    title: "Categories",
    links: [
      ["Sofa brands", "/brands"],
      ["Dining table brands", "/brands"],
      ["Bedroom furniture", "/brands"],
      ["Outdoor furniture", "/brands"],
      ["Home office furniture", "/brands"]
    ]
  },
  {
    title: "Legal",
    links: [
      ["Privacy policy", "/privacy-policy"],
      ["Terms & conditions", "/terms"],
      ["Content policy", "/review-guidelines"],
      ["Cookie policy", "#"],
      ["System status", "#"]
    ]
  }
];

const socialLinks: Array<[string, LucideIcon]> = [
  ["Facebook", Facebook],
  ["Instagram", Instagram],
  ["LinkedIn", Linkedin],
  ["YouTube", Youtube]
];

export function Footer() {
  return (
    <footer className="bg-[#171744] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-9 lg:grid-cols-[1.35fr_3fr]">
          <div>
            <Link href="/" aria-label="Furniture Brand Reviews" className="inline-block rounded-lg bg-white p-2">
              <Image
                src="/logo.png"
                alt="Furniture Brand Reviews"
                width={320}
                height={102}
                className="h-[34px] w-auto sm:h-[42px]"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              Independent review moderation for furniture shoppers and brands worldwide.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-bold text-white">{column.title}</h2>
                <nav className="mt-4 grid gap-3 text-sm text-white/70">
                  {column.links.map(([label, href]) => (
                    <Link key={`${column.title}-${label}`} href={href} className="hover:text-[#f6b73c]">
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-5 border-t border-white/12 pt-6 text-sm text-white/65 md:flex-row md:items-center md:justify-between">
          <div>
            <p>© 2026 Furniture Brand Reviews. All rights reserved.</p>
            <p className="mt-1">Independent reviews for furniture brands worldwide.</p>
          </div>
          <div className="flex items-center gap-3">
            {socialLinks.map(([label, Icon]) => (
              <Link
                key={label}
                href="#"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white/70 hover:border-[#f6b73c] hover:text-[#f6b73c]"
              >
                <Icon size={17} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
