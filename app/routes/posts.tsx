import { Outlet } from "@remix-run/react";

export default function PostsRoute() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="rounded-md bg-gradient-to-r from-red-500 to-red-300 p-1">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-sm bg-zinc-50/95 p-3">
          <h1 className="bg-gradient-to-b from-red-500 to-red-300 bg-clip-text text-4xl font-bold text-transparent">
            {error.name ?? "Error"}
          </h1>
          <p className="text-xl text-zinc-500">
            Uh oh! Something happened, here is why
          </p>
          <article className="prose prose-sm prose-zinc py-2 text-zinc-500">
            <p className="text-red-500">{error.message}</p>
          </article>
        </div>
      </div>
    </div>
  );
}
