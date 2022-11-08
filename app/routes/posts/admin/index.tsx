import { Link } from "@remix-run/react";

export default function AdminIndexRoute() {
  return (
    <Link to="new">
      <button className="relative inline-block rounded-md border-2 border-gray-200 bg-blue-100 p-2 text-sm font-medium text-gray-700 transition duration-300  ease-in-out hover:border-gray-300 hover:bg-blue-300 hover:text-gray-900">
        New Post
      </button>
    </Link>
  );
}
