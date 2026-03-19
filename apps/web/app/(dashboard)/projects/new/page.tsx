"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchAPI } from "../../../../lib/api";

interface ProjectResponse {
  id: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [logline, setLogline] = useState("");
  const [idea, setIdea] = useState("");

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
        onClick={() => router.push("/projects")}
        className="mb-4 text-sm text-gray-400 transition-colors hover:text-white"
      >
        &larr; Back to Projects
      </button>

      <h1 className="mb-6 text-2xl font-bold">New Project</h1>

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
