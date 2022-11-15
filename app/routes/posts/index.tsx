import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getPostListings } from "~/models/post.server";
import { useOptionalAdminUser } from "~/utils";

export const loader = async () => {
  const posts = await getPostListings();
  return json({ posts });
};

export default function PostRoute() {
  const { posts } = useLoaderData<typeof loader>();
  const adminUser = useOptionalAdminUser();

  return (
    <main className="mx-auto max-w-2xl font-light text-gray-700">
      <h1 className="my-6 border-b-2 text-center text-4xl font-bold">Posts</h1>

      <div className="flex justify-between">
        <ul className="">
          {adminUser ? (
            <li>
              <Link
                to="admin"
                className="group flex items-center justify-center rounded-md bg-gray-200 py-2 px-4"
              >
                <span className="transform transition-transform duration-200 ease-out group-hover:-translate-x-1">
                  Admin
                </span>
                <svg
                  className="ml-2 inline-block h-4 w-4 text-gray-400 transition-transform duration-200 ease-in-out group-hover:translate-x-0 group-hover:text-gray-500"
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
                    className="origin-left scale-x-0 opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100"
                  />
                  <path
                    d="M12 5L19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="origin-center scale-y-0 opacity-0 transition-all duration-200 ease-in group-hover:scale-y-100 group-hover:opacity-100"
                  />
                </svg>
              </Link>
            </li>
          ) : null}
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Link
                prefetch="intent"
                to={post.slug}
                className="prose flex justify-between gap-1 text-stone-500 transition-colors duration-300 hover:text-sky-500 hover:underline md:prose-lg"
              >
                <span>
                  {index + 1}. {post.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
