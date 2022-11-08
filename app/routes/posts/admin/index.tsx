import { Link } from "@remix-run/react";

export default function AdminIndexRoute() {
  return (
    <div className="flex h-fit  basis-3/4 gap-2">
      <Link
        to="/posts"
        className="relative inline-block rounded-md border-2 border-gray-200 bg-stone-100 p-2 text-sm font-medium text-gray-700 transition duration-300  ease-in-out hover:border-gray-300 hover:bg-blue-200 hover:text-gray-900"
      >
        back
      </Link>
      <Link
        to="new"
        className="relative inline-block w-full rounded-md border-2 border-gray-200 bg-blue-100 p-2 text-center text-sm font-medium text-gray-700 transition duration-300  ease-in-out hover:border-gray-300 hover:bg-blue-300 hover:text-gray-900"
      >
        New Post
      </Link>
    </div>
  );
}
