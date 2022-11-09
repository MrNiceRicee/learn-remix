import { Form, useActionData, useTransition } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { createPost } from "~/models/post.server";
import invariant from "tiny-invariant";

type ActionError =
  | {
      title: null | string;
      markdown: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request }) => {
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

  await createPost({
    title,
    markdown,
  });
  return redirect("/posts/admin");
};

const ErrorComponent = ({ error }: { error: string }) => (
  <div className="my-2 rounded-lg bg-[hsl(0,100%,70%)] p-0.5 pl-2">
    {/* <div className="h-full w-full rounded-md bg-stone-100/80 px-2"> */}
    <p className="text-md flex gap-1 font-sans font-light text-white">
      {error}
    </p>
    {/* </div> */}
  </div>
);

export default function NewPostRoute() {
  const errorData = useActionData<ActionError>();

  const transition = useTransition();

  const isCreating = Boolean(transition.submission);

  return (
    <Form method="post" key="new">
      <p>
        <label>
          Post Title:
          <input
            type="text"
            name="title"
            style={{
              boxShadow: `
              inset 0 1px 4px 0 hsl(0 0% 85%),
              inset 0 1px 0px 0px hsl(0 0% 50%),
              inset 0 -1px 0px 0px hsl(0 0% 95%)
            `,
            }}
            className="block w-full rounded-md border border-gray-300 bg-stone-50 px-4 py-1 shadow-sm focus:border-gray-600 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </label>
      </p>
      {errorData?.title && <ErrorComponent error={errorData.title} />}
      <p>
        <label htmlFor="markdown">Markdown:</label>
        <textarea
          id="markdown"
          name="markdown"
          rows={10}
          style={{
            boxShadow: `
              inset 0 1px 4px 0 hsl(0 0% 85%),
              inset 0 1px 0px 0px hsl(0 0% 50%),
              inset 0 -1px 0px 0px hsl(0 0% 95%)
            `,
          }}
          className="block w-full rounded-md border border-gray-300 bg-stone-50 px-4 py-1 font-mono focus:border-gray-600 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </p>

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
          <span>
            {isCreating ? "Creating..." : "Create Post"}
          </span>
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
