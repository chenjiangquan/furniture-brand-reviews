import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { HeaderSearch } from "@/components/HeaderSearch";
import { getCompanies } from "@/lib/data";

export async function Header() {
  const companies = await getCompanies();

  return (
    <header className="relative z-40 border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link href="/" aria-label="Furniture Brand Reviews" className="block">
          <Image
            src="/logo.png"
            alt="Furniture Brand Reviews"
            width={320}
            height={102}
            priority
            className="h-[34px] w-auto sm:h-[62px]"
          />
        </Link>

        <HeaderSearch companies={companies} />

        <nav className="hidden shrink-0 items-center gap-6 text-sm font-medium text-muted sm:flex">
          <Link href="/brands">Brands</Link>
          <Link href="/category">Categories</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/review-guidelines">Guidelines</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/business/login" className="rounded-full border border-purple-200 px-4 py-2 font-bold text-trust-dark hover:bg-purple-50">
            Business login
          </Link>
        </nav>
        <Link
          href="/brands"
          aria-label="Search brands"
          className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted sm:hidden"
        >
          <Search size={18} />
        </Link>
      </div>
    </header>
  );
}
