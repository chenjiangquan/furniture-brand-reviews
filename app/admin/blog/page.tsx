import type { Metadata } from "next";
import { AdminBlogManager } from "@/components/AdminBlogManager";
import { getAdminBlogAutoDraftLogs, getAdminBlogs } from "@/lib/blogs";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Blog Admin",
  "Create, edit and publish Furniture Brand Reviews blog posts."
);

export default async function AdminBlogPage({ searchParams }: { searchParams: { password?: string } }) {
  const password = searchParams.password ?? "";
  const isAllowed = Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);

  if (!isAllowed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-10">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Blog admin</h1>
        <p className="mt-3 leading-7 text-muted">Enter the admin password to manage blog articles.</p>
        <form className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <label className="grid gap-2">
            <span className="font-semibold text-ink">Admin password</span>
            <input
              name="password"
              type="password"
              className="rounded-xl border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-trust focus:ring-4 focus:ring-[#A855F7]/15"
            />
          </label>
          <button className="rounded-full bg-trust px-5 py-3 font-bold text-white transition hover:bg-trust-dark">
            Open blog admin
          </button>
        </form>
      </div>
    );
  }

  const [blogs, autoDraftLogs] = await Promise.all([
    getAdminBlogs(password),
    getAdminBlogAutoDraftLogs(password)
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-10 sm:px-6 lg:px-10">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Blog admin</h1>
        <p className="mt-3 leading-7 text-muted">Create drafts, publish articles and manage Furniture Brand Reviews blog content.</p>
      </div>
      <AdminBlogManager blogs={blogs} autoDraftLogs={autoDraftLogs} password={password} />
    </div>
  );
}
