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
      {/* back button */}

      <h1 className="my-6 border-b-2 text-center text-4xl font-bold">Admin</h1>
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
