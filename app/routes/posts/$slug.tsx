// import { marked } from "marked";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import { getPost } from "~/models/post.server";

type LoaderData = {
  title: string;
  html: string;
  slug: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { slug } = params;
  if (!slug || typeof slug !== "string") {
    throw new Error("slug is required");
  }
  const post = await getPost(slug);
  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }
  const html = marked(post?.markdown);

  return json<LoaderData>({ title: post.title || "", html, slug: post.slug });
};

export default function PostRoute() {
  const { title, html } = useLoaderData() as LoaderData;
  return (
    <main className="mx-auto max-w-2xl">
      <div className="relative flex items-center justify-center">
        <Link to="/posts" className="group absolute left-0 flex">
          <svg
            className="h-6 w-6 origin-center text-gray-500 transition-transform duration-200 ease-in hover:text-gray-700 group-hover:-translate-x-1/4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-light text-zinc-700 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-2 group-hover:opacity-100">
            Back
          </span>
        </Link>
        <h1 className="my-6 w-full border-b-2 text-center text-4xl font-bold">
          {title}
        </h1>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="prose prose-sm prose-zinc grow lg:prose"
      />
    </main>
  );
}
