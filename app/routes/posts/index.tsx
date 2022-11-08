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
    <main>
      <h1>Posts</h1>
      <Link
        to="admin"
        className="relative inline-block rounded-md border-2 border-gray-200 bg-blue-100 p-2 text-sm font-medium text-gray-700 transition duration-300  ease-in-out hover:border-gray-300 hover:bg-blue-300 hover:text-gray-900"
      >
        Admin
      </Link>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={post.slug} className="text-blue-500 underline">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
