import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { getPost, updatePost, deletePost } from "~/models/post.server";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const post = await getPost(params.slug || "");

  return json({ post });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { slug } = params;

  if (!slug) {
    throw new Error("Slug is required");
  }

  // TODO: remove me
  await new Promise((res) => setTimeout(res, 1000));
  const formData = await request.formData();

  const method = formData.get("_method");

  if (method === "delete") {
    await deletePost(slug?.toString() || "");
    return redirect("/posts/admin");
  }

  const title = formData.get("title");
  const markdown = formData.get("markdown");

  const errors = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  await updatePost(slug, { title, markdown });

  return redirect("/posts/admin");
};

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

const EditPost = () => {
  const errors = useActionData<typeof action>();
  const navigation = useNavigation();
  const isCreating = Boolean(navigation.state === "submitting");
  const { post } = useLoaderData<typeof loader>();

  return (
    <Form method="post">
      <input type="hidden" name="_method" value="update" />
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            defaultValue={post?.title}
            type="text"
            name="title"
            className={inputClassName}
          />
        </label>
      </p>
      <p
        style={{
          visibility: "hidden",
        }}
      >
        <label>
          <input
            type="text"
            defaultValue={post?.slug}
            name="slug"
            className={inputClassName}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown: </label>
        <br />
        <textarea
          defaultValue={post?.markdown}
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
        />
      </p>
      <div
        style={{
          display: "flex",
          gap: 4,
          width: "100%",
          justifyContent: "flex-end",
        }}
        className="text-right"
      >
        <p className="text-right">
          <Form method="post">
            <input type="hidden" name="_method" value="delete" />
            <button
              type="submit"
              disabled={isCreating}
              className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
              onClick={(e) => {
                if (!confirm("Are you sure you want to delete this post?")) {
                  e.preventDefault();
                }
              }}
            >
              {isCreating ? "Deleting..." : "Delete"}
            </button>
          </Form>
        </p>
        <p className="text-right">
          <button
            disabled={isCreating}
            type="submit"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          >
            {isCreating ? "Updating..." : "Update Post"}
          </button>
        </p>
      </div>
    </Form>
  );
};

export default EditPost;
