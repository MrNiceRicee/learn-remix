import { Form, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { createPost } from "~/models/post.server";

type ActionError = {
  title?: string;
  markdown?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const title = data.get("title");
  const markdown = data.get("markdown");

  const errors = {
    title: title ? null : "Title is required",
    markdown: markdown ? null : "Markdown is required",
  };
  // if (errors.title || errors.markdown) {
  //   return json(errors, { status: 400 });
  // }
  const hasErrors = Object.values(errors).some((error) => error);
  if (hasErrors) {
    return json(errors, { status: 400 });
  }

  await createPost({
    title: title as string,
    markdown: markdown as string,
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

  console.log(errorData);

  return (
    <Form method="post" key="new">
      <p>
        <label>
          Post Title:
          <input
            type="text"
            name="title"
            required
            min={1}
            className="block w-full rounded-md border border-gray-300 px-4 py-1 shadow-sm focus:border-gray-600 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
          required
          minLength={1}
          className="block w-full rounded-md border border-gray-300 px-4 py-1 font-mono shadow-sm focus:border-gray-600 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </p>
      <p className="pt-2 text-right">
        <button
          type="submit"
          className="relative inline-block rounded-md border-2 border-gray-200 bg-stone-100 p-2 text-sm font-medium text-gray-700 transition duration-300  ease-in-out hover:border-gray-300 hover:bg-blue-200 hover:text-gray-900"
        >
          Create Post
        </button>
      </p>
    </Form>
  );
}
