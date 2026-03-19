"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { fetchAPI } from "../../../../lib/api";

interface ProjectResponse {
  id: string;
}

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromBrainstorm = searchParams.has("title");
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [logline, setLogline] = useState(searchParams.get("logline") || "");
  const [idea, setIdea] = useState(searchParams.get("idea") || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const project = await fetchAPI<ProjectResponse>("/api/projects", {
        method: "POST",
        body: JSON.stringify({ title, genre, logline, idea }),
      });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => router.push(fromBrainstorm ? "/projects/brainstorm" : "/projects")}
        className="mb-4 text-sm text-gray-400 transition-colors hover:text-white"
      >
        &larr; {fromBrainstorm ? "브레인스토밍으로 돌아가기" : "프로젝트 목록으로"}
      </button>

      <h1 className="mb-6 text-2xl font-bold">새 프로젝트 생성</h1>

      {fromBrainstorm && (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          ✨ 브레인스토밍에서 생성된 컨셉이 자동 입력되었습니다. 확인 후 프로젝트를 생성하세요.
        </div>
      )}

      {!fromBrainstorm && (
        <Link
          href="/projects/brainstorm"
          className="mb-6 block rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm transition hover:border-amber-500/50 hover:bg-amber-500/10"
        >
          <span className="flex items-center gap-2">
            <span>💡</span>
            <span>아이디어가 없으신가요? <span className="text-amber-400 font-medium">브레인스토밍으로 시작하기 →</span></span>
          </span>
        </Link>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="My AI Film"
          />
        </div>

        <div>
          <label htmlFor="genre" className="mb-1.5 block text-sm font-medium">
            Genre
          </label>
          <input
            id="genre"
            type="text"
            required
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="Sci-Fi, Drama, Comedy..."
          />
        </div>

        <div>
          <label htmlFor="logline" className="mb-1.5 block text-sm font-medium">
            Logline
          </label>
          <input
            id="logline"
            type="text"
            value={logline}
            onChange={(e) => setLogline(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="A brief one-line description of the story"
          />
        </div>

        <div>
          <label htmlFor="idea" className="mb-1.5 block text-sm font-medium">
            Idea
          </label>
          <textarea
            id="idea"
            rows={5}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="Describe your film idea in detail..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="rounded-lg border border-gray-800 px-6 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>}>
      <NewProjectForm />
    </Suspense>
  );
}
