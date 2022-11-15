import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getPostListings } from "~/models/post.server";
import { requireAdminUser } from "~/session.server";
import type { LoaderFunctionArgs } from "@remix-run/server-runtime/dist/router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminUser(request);
  return json({
    posts: await getPostListings(),
  });
};

export default function AdminRoute() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-2xl">
      {/* back button */}
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
          Admin
        </h1>
      </div>
      <div className="flex justify-between">
        <ul className="basis-1/4">
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Link
                to={post.slug}
                className="text-stone-500 transition-colors duration-300 hover:text-sky-500 hover:underline"
              >
                {index + 1}. {post.title}
              </Link>
            </li>
          ))}
        </ul>
        <div className="basis-3/4">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
