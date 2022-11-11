import { Form, useActionData, useTransition } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/server-runtime/dist/router";
import { createPost } from "~/models/post.server";
import invariant from "tiny-invariant";
import { requireAdminUser } from "~/session.server";

type ActionError =
  | {
      title: null | string;
      markdown: null | string;
    }
  | undefined;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUser(request);
  const { slug } = params;
  if (!slug || typeof slug !== "string") {
    throw new Error("slug is required");
  }
  if (slug === "new") {
    return json({});
  }
  return json({
    post: null
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  const data = await request.formData();
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
  if (slug === "new") {
    await createPost({
      title,
      markdown,
    });
  } else {
    // TODO: update post
  }

  return redirect("/posts/admin");
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

  const transition = useTransition();

  const isCreating = Boolean(transition.submission);

  return (
    <Form method="post" key="new">
      <p className="font-sans text-sm font-light text-gray-600">
        <label className="">
          Post Title:
          <input
            type="text"
            name="title"
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
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="submit"
          className={`flex gap-2 rounded-md border
          border-gray-300 bg-gray-50
          px-2 py-2
          shadow-sm hover:bg-gray-100
          focus:border-gray-600
          focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50
          ${isCreating ? "cursor-not-allowed opacity-50" : ""}
          `}
          disabled={isCreating}
        >
          <span>{isCreating ? "Creating..." : "Create Post"}</span>
          {isCreating && (
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
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v1a7 7 0 00-7 7h1z"
              ></path>
            </svg>
          )}
        </button>
      </div>
    </Form>
  );
}
