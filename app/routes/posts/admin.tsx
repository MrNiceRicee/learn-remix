import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getPostListings } from "~/models/post.server";

export const loader = async () => {
  return json({
    posts: await getPostListings(),
  });
};

export default function AdminRoute() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="my-6 border-b-2 text-center text-4xl font-bold">Admin</h1>
      <Outlet />
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
