import { marked } from "marked";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getPost } from "~/models/post.server";

type LoaderData = {
  title: string;
  html: string;
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

  return json<LoaderData>({ title: post?.title || "", html });
};

export default function PostRoute() {
  const { title, html } = useLoaderData() as LoaderData;
  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="my-6 border-b-2 text-center text-4xl font-bold">
        {title}
      </h1>
      {/* grid column one is 1/4th, 2nd column is 3/4 */}
      <div
        className="flex justify-between gap-2"
      >
        <Link
          to="/posts"
          className="group flex w-fit h-fit items-center justify-center rounded-md bg-gray-200 py-2 pl-1 pr-5  font-light"
        >
          <svg
            className="inline-block h-4 w-4 -translate-x-1/4 text-gray-400 transition-transform duration-200 ease-in-out group-hover:translate-x-0 group-hover:text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="origin-right translate-x-1/4 scale-x-0 opacity-0 transition-all duration-200 ease-out group-hover:origin-left group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100"
            />
            <path
              d="M12 5L5 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="origin-center scale-y-0 opacity-0 transition-all duration-200 ease-in group-hover:scale-y-100 group-hover:opacity-100"
            />
          </svg>
          <span className="transform transition-transform duration-200 ease-out group-hover:translate-x-1">
            Back to posts
          </span>
        </Link>
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="grow prose prose-sm lg:prose prose-zinc"
        />
      </div>
    </main>
  );
}
