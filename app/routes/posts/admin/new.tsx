import { Form, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import type { ZodFormattedError } from "zod";
import { z } from "zod";
import { createPost } from "~/models/post.server";

const formatError = (
  error: ZodFormattedError<{
    title: string;
    markdown: string;
  }>
) => {
  if (!error) {
    return null;
  }
  return Object.entries(error)
    .map(([name, value]) => {
      if (value && "_errors" in value) {
        // return `${name}: ${}`;
        return [name, value._errors.join(", ")];
      }
    })
    .filter(Boolean);
};

type ActionError = {
  error: ReturnType<typeof formatError>;
  message: string;
  status: number;
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const title = data.get("title");
  const markdown = data.get("markdown");
  const postSchema = z.object({
    title: z.string().min(1, "Title must contain atleast 1 character").trim(),
    markdown: z
      .string()
      .min(1, "Markdown must contain atleast 1 character")
      .trim(),
  });
  const post = postSchema.safeParse({ title, markdown });
  if (!post.success) {
    const errorObject = formatError(post.error.format());
    return json(
      { error: errorObject, message: "Bad Request", status: 400 },
      { status: 400 }
    );
  }
  await createPost({
    title: post.data.title,
    markdown: post.data.markdown,
  });
  return redirect("/posts/admin");
};

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
            className="block w-full rounded-md border border-gray-300 px-4 py-1 shadow-sm focus:border-gray-600 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>
        <textarea
          id="markdown"
          name="markdown"
          rows={10}
          className="block w-full rounded-md border border-gray-300 px-4 py-1 font-mono shadow-sm focus:border-gray-600 focus:outline-none focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </p>
      {
        // If there is an error, show it
        errorData?.error && (
          <div className="my-2 rounded-lg bg-red-500 p-0.5 pl-2">
            <div className="h-full w-full rounded-md bg-stone-100/50 px-2">
              <p className="flex gap-1 font-light text-lg border-b border-stone-900/20">
                <strong className="text-black/80 font-medium">{errorData.status}</strong>
                {errorData.message}
              </p>
              <ul>
                {Object.entries(errorData.error).map(([key, value]) => {
                  if (!value || value.length < 0) {
                    return null;
                  }
                  return (
                    <>
                      {key !== "_errors" && (
                        <li key={key}>
                          <p className="flex gap-1 font-light">
                            <strong className="font-medium">{value[0]}:</strong>
                            {value[1]}
                          </p>
                        </li>
                      )}
                    </>
                  );
                })}
              </ul>
            </div>
          </div>
        )
      }
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
