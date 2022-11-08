import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getPostListings } from "~/models/post.server";

export const loader = async () => {
  const posts = await getPostListings();
  return json({ posts });
};

export default function PostRoute() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="my-6 border-b-2 text-center text-4xl font-bold">Posts</h1>

      <div className="flex justify-between">
        <ul className="basis-1/4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to={post.slug}
                className="text-stone-500 transition-colors duration-300 hover:text-sky-500 hover:underline"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className="basis-3/4 flex h-fit gap-2">
          <Link
            to="/"
            className="relative inline-block rounded-md border-2 border-gray-200 bg-stone-100 p-2 text-sm font-medium text-gray-700 transition duration-300  ease-in-out hover:border-gray-300 hover:bg-blue-200 hover:text-gray-900"
          >
            back
          </Link>
          <Link
            to="admin"
            className="relative inline-block w-full rounded-md border-2 border-gray-200 bg-blue-100 p-2 text-center text-sm font-medium text-gray-700 transition duration-300  ease-in-out hover:border-gray-300 hover:bg-blue-300 hover:text-gray-900"
          >
            Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
