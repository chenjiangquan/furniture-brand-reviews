"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Edit3, FileText, Trash2 } from "lucide-react";
import { deleteBlogPost, saveBlogPost, type BlogActionState } from "@/lib/blog-actions";
import { formatBlogDate, slugifyBlogTitle, type BlogPost } from "@/lib/blogs";

const initialState: BlogActionState = { ok: false, message: "" };
const inputClass =
  "w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-200";
const textareaClass =
  "w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-200";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-purple-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50";

function SaveButton({ label, name, value }: { label: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={primaryButtonClass}>
      {pending ? "Saving..." : label}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
      <Trash2 size={15} />
      {pending ? "Deleting..." : "Delete blog"}
    </button>
  );
}

function ResultBox({ state }: { state: BlogActionState }) {
  if (!state.message) return null;
  return (
    <div className={`rounded-xl p-4 text-sm font-semibold ${state.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
      {state.message}
    </div>
  );
}

export function AdminBlogManager({ blogs, password }: { blogs: BlogPost[]; password: string }) {
  const [saveState, saveAction] = useFormState(saveBlogPost, initialState);
  const [deleteState, deleteAction] = useFormState(deleteBlogPost, initialState);
  const [selectedId, setSelectedId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const selectedBlog = useMemo(() => blogs.find((blog) => blog.id === selectedId) ?? null, [blogs, selectedId]);

  function selectBlog(blog: BlogPost) {
    setSelectedId(blog.id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setSlugEdited(true);
  }

  function createNewBlog() {
    setSelectedId("");
    setTitle("");
    setSlug("");
    setSlugEdited(false);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugifyBlogTitle(value));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-ink">Blog posts</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Create, edit and publish Furniture Brand Reviews blog articles.</p>
          </div>
          <button type="button" onClick={createNewBlog} className={secondaryButtonClass}>
            New post
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-purple-50 text-ink">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{blog.title}</div>
                    {(blog.generated_by === "blog-auto-draft" || blog.needs_review) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {blog.generated_by === "blog-auto-draft" && (
                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-trust-dark">AI Draft</span>
                        )}
                        {blog.needs_review && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Needs review</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{blog.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${blog.status === "published" ? "bg-green-50 text-green-700" : "bg-purple-50 text-trust-dark"}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatBlogDate(blog.updated_at)}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => selectBlog(blog)} className={secondaryButtonClass}>
                      <Edit3 size={15} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No blog posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-purple-50 text-trust-dark">
            <FileText size={18} />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-ink">{selectedBlog ? "Edit blog" : "Create blog"}</h2>
            <p className="text-sm text-muted">Markdown content is supported.</p>
          </div>
        </div>

        <form key={selectedBlog?.id ?? "new-blog"} action={saveAction} className="mt-6 grid gap-4">
          <input type="hidden" name="password" value={password} />
          <input type="hidden" name="id" value={selectedBlog?.id ?? ""} />
          <input type="hidden" name="published_at" value={selectedBlog?.published_at ?? ""} />

          {selectedBlog?.generated_by === "blog-auto-draft" && (
            <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4 text-sm text-slate-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-trust-dark">AI Draft</span>
                {selectedBlog.needs_review && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Needs editorial review</span>}
              </div>
              <p className="mt-2">
                Topic: <span className="font-semibold text-ink">{selectedBlog.generation_topic ?? "Auto draft"}</span>
              </p>
              {selectedBlog.generation_notes && <p className="mt-1 whitespace-pre-line text-xs leading-5 text-muted">{selectedBlog.generation_notes}</p>}
            </div>
          )}

          <label className="grid gap-2">
            <span className="font-semibold text-ink">Title</span>
            <input name="title" required value={title} onChange={(event) => handleTitleChange(event.target.value)} className={inputClass} />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-ink">Slug</span>
            <input
              name="slug"
              required
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugEdited(true);
              }}
              className={inputClass}
            />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-ink">Excerpt</span>
            <textarea name="excerpt" rows={3} defaultValue={selectedBlog?.excerpt ?? ""} className={textareaClass} />
            <span className="text-xs font-medium text-muted">Leave blank to automatically generate an excerpt from the article content.</span>
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-ink">SEO Title</span>
            <input
              name="seo_title"
              defaultValue={selectedBlog?.seo_title ?? ""}
              placeholder={title ? `${title} | Furniture Brand Reviews` : "Defaults to title"}
              className={inputClass}
            />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-ink">SEO Description</span>
            <textarea
              name="seo_description"
              rows={3}
              defaultValue={selectedBlog?.seo_description ?? ""}
              placeholder="Defaults to excerpt, trimmed to 160 characters"
              className={textareaClass}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-semibold text-ink">Category</span>
              <input name="category" defaultValue={selectedBlog?.category ?? ""} className={inputClass} />
            </label>
            <label className="grid gap-2">
              <span className="font-semibold text-ink">Status</span>
              <select name="status" defaultValue={selectedBlog?.status ?? "draft"} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="font-semibold text-ink">Cover Image URL</span>
            <input name="cover_image_url" type="url" defaultValue={selectedBlog?.cover_image_url ?? ""} className={inputClass} />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-ink">Cover Image Alt Text</span>
            <input
              name="cover_image_alt"
              defaultValue={selectedBlog?.cover_image_alt ?? ""}
              placeholder="Defaults to the article title"
              className={inputClass}
            />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-ink">Content</span>
            <textarea name="content" rows={14} defaultValue={selectedBlog?.content ?? ""} className={`${textareaClass} font-mono`} />
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-purple-100 bg-purple-50/40 p-4 text-sm text-slate-700">
            <input
              name="allow_index"
              type="checkbox"
              defaultChecked={Boolean(selectedBlog?.allow_index)}
              className="mt-1 h-4 w-4 rounded border-purple-200 text-purple-700 focus:ring-purple-300"
            />
            <span>
              <span className="block font-semibold text-ink">Allow indexing for short article</span>
              Articles under 500 words are noindexed by default unless this is checked.
            </span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" name="intent" value="draft" className={secondaryButtonClass}>
              Save draft
            </button>
            <SaveButton label="Publish" name="intent" value="publish" />
          </div>
        </form>

        {selectedBlog?.status === "published" && (
          <form action={saveAction} className="mt-3">
            <input type="hidden" name="password" value={password} />
            <input type="hidden" name="id" value={selectedBlog.id} />
            <input type="hidden" name="title" value={selectedBlog.title} />
            <input type="hidden" name="slug" value={selectedBlog.slug} />
            <input type="hidden" name="excerpt" value={selectedBlog.excerpt ?? ""} />
            <input type="hidden" name="seo_title" value={selectedBlog.seo_title ?? ""} />
            <input type="hidden" name="seo_description" value={selectedBlog.seo_description ?? ""} />
            <input type="hidden" name="category" value={selectedBlog.category ?? ""} />
            <input type="hidden" name="cover_image_url" value={selectedBlog.cover_image_url ?? ""} />
            <input type="hidden" name="cover_image_alt" value={selectedBlog.cover_image_alt ?? ""} />
            <input type="hidden" name="content" value={selectedBlog.content ?? ""} />
            {selectedBlog.allow_index ? <input type="hidden" name="allow_index" value="on" /> : null}
            <button type="submit" name="intent" value="unpublish" className={secondaryButtonClass}>
              Unpublish
            </button>
          </form>
        )}

        {selectedBlog && (
          <form
            action={deleteAction}
            className="mt-3"
            onSubmit={(event) => {
              if (!window.confirm(`Delete "${selectedBlog.title}"? This cannot be undone.`)) event.preventDefault();
            }}
          >
            <input type="hidden" name="password" value={password} />
            <input type="hidden" name="id" value={selectedBlog.id} />
            <DeleteButton />
          </form>
        )}

        <div className="mt-4 grid gap-3">
          <ResultBox state={saveState} />
          <ResultBox state={deleteState} />
        </div>
      </section>
    </div>
  );
}
