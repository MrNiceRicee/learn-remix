import { useEffect, useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/server-runtime/dist/router";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";
import invariant from "tiny-invariant";
import { requireAdminUser } from "~/session.server";
import { marked } from "marked";

type ActionError =
  | {
      title: null | string;
      markdown: null | string;
    }
  | undefined;

interface LoaderData {
  post: Awaited<ReturnType<typeof getPost>>;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request);
  const { slug } = params;
  invariant(slug, "slug is required");
  if (slug === "new") {
    return json({});
  }
  const post = await getPost(slug);
  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }
  return json({
    post,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  invariant(params.slug, "slug is required");
  const data = await request.formData();

  const intent = data.get("intent");
  if (intent === "delete") {
    await deletePost(params.slug || "");
    return redirect("/posts/admin");
  }

  const title = data.get("title");
  const markdown = data.get("markdown");

  const errors: ActionError = {
    title: title ? null : "Title is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some((error) => error);
  if (hasErrors) {
    return json<ActionError>(errors, { status: 400 });
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  const { slug } = params;
  invariant(typeof slug === "string", "slug must be a string");
  if (slug === "new") {
    await createPost({
      title,
      markdown,
    });
    return redirect("/posts/admin");
  } else {
    // TODO: update post
    await updatePost(slug, {
      title,
      markdown,
    });
  }
  return json({
    nice: "job",
  });
};

const ErrorComponent = ({ error }: { error?: null | string }) => (
  <div
    className={`my-2 w-fit min-w-[5rem]
     rounded-lg bg-[hsl(0,100%,70%)] p-1 px-3 ${
       error ? "origin-top rotate-0 scale-100" : "scale-y-0"
     }
    overflow-hidden transition-transform
    duration-300 ease-in
    `}
  >
    <p
      className={`text-md flex gap-1 font-sans font-light text-white
      ${error ? "translate-x-0" : "translate-y-full"}
      transition-transform duration-500 ease-out
    `}
    >
      {error}
    </p>
  </div>
);

export default function NewPostRoute() {
  const errorData = useActionData<ActionError>();
  const postData = useLoaderData<LoaderData>();
  const [preview, setPreview] = useState<{
    title: string | null;
    markdown: string | null;
  }>(
    postData.post
      ? { title: postData.post.title, markdown: postData.post.markdown }
      : { title: null, markdown: null }
  );

  const transition = useTransition();

  // const isMutating = Boolean(transition.submission);
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";

  const displayText = () => {
    if (isCreating || isUpdating) {
      return postData.post ? "updating..." : "creating...";
    }
    return postData.post ? "update" : "create";
  };

  useEffect(() => {
    if (postData.post) {
      setPreview({
        title: postData.post.title,
        markdown: postData.post.markdown,
      });
    }
  }, [postData.post, postData.post?.slug]);

  // change preview when title or markdown changes
  const handleChange = (event: React.ChangeEvent<HTMLFormElement>) => {
    const { name, value } = event.target;
    setPreview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const html = marked(preview.markdown || "");

  return (
    <div>
      <Form
        method="post"
        key={postData.post?.title ?? "new"}
        onChange={handleChange}
      >
        <p className="font-sans text-sm font-light text-gray-600">
          <label className="">
            Post Title:
            <input
              type="text"
              name="title"
              defaultValue={postData.post?.title}
              style={{
                boxShadow: `
              inset 0 1px 4px 0 hsl(0 0% 70%),
              inset 0 1px 0px 0px hsl(0 0% 50%),
              inset 0 -1px 0px 0px hsl(0 0% 80%)
            `,
              }}
              className="block w-full rounded-md border border-none bg-gradient-to-b from-zinc-100 to-zinc-50 px-4 py-1 font-mono focus:ring-1"
            />
          </label>
        </p>
        <ErrorComponent error={errorData?.title} />
        <p className="font-sans text-sm font-light text-gray-600">
          <label htmlFor="markdown">Markdown:</label>
          <textarea
            id="markdown"
            name="markdown"
            rows={10}
            defaultValue={postData.post?.markdown}
            style={{
              boxShadow: `
              inset 0 1px 4px 0 hsl(0 0% 70%),
              inset 0 1px 0px 0px hsl(0 0% 50%),
              inset 0 -1px 0px 0px hsl(0 0% 90%)
            `,
            }}
            className="block w-full rounded-md border border-none bg-gradient-to-b from-zinc-100 to-zinc-50 px-4 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </p>
        <ErrorComponent error={errorData?.markdown} />
        <div className="mt-2 flex justify-between gap-2">
          {postData.post ? (
            <button
              type="submit"
              className={`flex gap-2 rounded-md border
              border-gray-300 bg-gray-50
              px-2 py-2
              shadow-sm transition-colors duration-300
              ease-in-out hover:border-red-400
              hover:bg-red-100 focus:border-gray-600 focus:bg-red-100 focus:outline-none
              focus:ring focus:ring-red-200 focus:ring-opacity-50
          ${isDeleting ? "cursor-not-allowed bg-red-100 opacity-50" : ""}
          `}
              disabled={isDeleting}
              value="delete"
              name="intent"
            >
              {isDeleting && (
                <svg
                  className="h-5 w-5 animate-spin text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="text-red-500"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v3a7 7 0 00-7 7h-1z"
                  ></path>
                </svg>
              )}
              <p className="font-sans text-sm font-light text-gray-600">
                delete
              </p>
            </button>
          ) : null}
          <div className="flex gap-2">
            <Link
              to="/posts/admin"
              className="flex gap-2 rounded-md border border-gray-300 bg-gray-50 px-2 py-2 shadow-sm transition-colors duration-300 ease-in-out hover:bg-gray-100 focus:border-gray-600 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <p className="font-sans text-sm font-light text-gray-600">
                cancel
              </p>
            </Link>
            <button
              type="submit"
              className={`flex gap-2 rounded-md border
              border-gray-300 bg-gray-50
              px-2 py-2
              shadow-sm transition-colors duration-300
              ease-in-out
              hover:border-sky-400 hover:bg-sky-100 focus:border-gray-600 focus:outline-none
              focus:ring focus:ring-blue-200 focus:ring-opacity-50
              ${isCreating || isUpdating ? "cursor-not-allowed opacity-50" : ""}
              `}
              value={postData.post ? "update" : "create"}
              name="intent"
              disabled={isCreating || isUpdating}
            >
              {isCreating && isUpdating && (
                <svg
                  className="h-5 w-5 animate-spin text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="text-fuchsia-500"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v3a7 7 0 00-7 7h-1z"
                  ></path>
                </svg>
              )}
              <p className="font-sans text-sm font-light text-gray-600">
                {displayText()}
              </p>
            </button>
          </div>
        </div>
      </Form>
      {/* preview */}
      <div>
        <h2 className="mb-3 font-sans text-2xl font-light text-gray-600">
          Preview
        </h2>
        <h1 className="my-6 w-full border-b-2 text-center text-4xl font-bold">
          {preview.title ?? "Title"}
        </h1>
        <div
          className="prose prose-sm prose-zinc grow lg:prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  if (caught.status === 404) {
    return (
      <div className="rounded-md bg-gradient-to-r from-orange-500 to-orange-300 p-1">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-sm bg-zinc-50/95 p-3">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-xl">Post not found</p>
          <article className="prose prose-sm prose-zinc text-zinc-500">
            <p>
              The post you are looking for does not exist. It may have been
              deleted or you may have mistyped the URL.
            </p>
          </article>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-md bg-gradient-to-r from-orange-500 to-orange-300 p-1">
      <div className="flex h-full w-full flex-col items-center justify-center rounded-sm bg-zinc-50/95 p-3">
        <h1 className="text-4xl font-bold">Error</h1>
        <p className="text-xl">Unknown error</p>
        <article className="prose prose-sm prose-zinc text-zinc-500">
          <p>An unknown error has occurred. Please try again later.</p>
          <p>Unsupported status code: {caught.status}</p>
        </article>
      </div>
    </div>
  );
}
