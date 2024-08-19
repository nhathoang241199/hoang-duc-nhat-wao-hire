/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Post } from "@prisma/client";
import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { Button, Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import {
  createPost,
  deletePost,
  getPosts,
  updatePost,
} from "~/models/post.server";

enum EAction {
  create = "create",
  delete = "delete",
  edit = "edit",
}

export const action = async ({ request }: ActionFunctionArgs) => {
  // TODO: remove me
  await new Promise((res) => setTimeout(res, 1000));
  const formData = await request.formData();
  const method = formData.get("_method");

  const slug = formData.get("slug");
  // handle delete
  if (method === "delete" && slug) {
    const result = await deletePost(slug.toString() || "");
    return result;
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

  // handle edit
  if (method === "edit" && slug) {
    const result = await updatePost(slug.toString() || "", { title, markdown });
    return result;
  }

  // hanlde create
  try {
    const result = await createPost({ title, slug, markdown });

    return result;
  } catch (error) {
    return json({ slug: "Slug existed!" });
  }
};

export const loader = async () => {
  return json({ posts: await getPosts() });
};

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function AdminPosts() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | undefined>();
  const [actionType, setActionType] = useState<EAction | undefined>();
  const [localErrors, setLocalErrors] = useState<typeof actionData | null>(
    null
  );
  const { posts } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData();
  const isCreating = Boolean(navigation.state === "submitting");

  // call submit create a new post
  const handleFormSubmit = async () => {
    setActionType(EAction.create);
    const form = document.getElementById("post-form");
    if (form) {
      submit(form as any);
    }
  };

  // select post to edit
  const handleSelectPost = (post: any) => {
    setSelectedPost(post);
  };

  // call submit delete post
  const handleDeletePost = () => {
    setActionType(EAction.delete);
    const form = document.getElementById("delete-post");
    if (form) {
      submit(form as any);
    }
  };

  // call submit edit post
  const handleEditPost = () => {
    setActionType(EAction.edit);
    const form = document.getElementById("edit-post-form");
    if (form) {
      submit(form as any);
    }
  };

  // handle close modal
  const handleOnCloseModal = () => {
    setOpenModal(false);
    setSelectedPost(undefined);
    setLocalErrors(null);
    setActionType(undefined);
  };

  // close modal after submit
  useEffect(() => {
    if ((errors as any)?.updatedAt) {
      handleOnCloseModal();
    } else {
      setLocalErrors(errors);
    }
  }, [actionData, errors]);

  return (
    <div className="w-full flex justify-center  min-h-[100vh] ">
      <div className="w-full md:w-[1000px] bg-white min-h-[100vh] flex items-center flex-col py-10 relative">
        <h1 className=" text-[32px] font-bold">Manage blog</h1>
        <p className="text-gray-600 w-[80%] md:w-[600px] text-center mt-4">
          Click blog to edit or delete, click create blog to add new blog
        </p>
        <div className="flex flex-col mt-6 w-full md:w-[800px]">
          {posts.map((post) => (
            <div
              onClick={() => handleSelectPost(post)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSelectPost(post);
                  e.preventDefault();
                }
              }}
              tabIndex={0}
              role="button"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 py-10 border-b-solid border-b-[0.5px] border-b-gray-300 min-w-full md:min-w-[600px] hover:bg-gray-100"
              key={post.slug}
            >
              <p className="text-[24px] font-semibold">{post.title}</p>
              <p>
                {post.slug} -{" "}
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
        <div className=" fixed bottom-4 right-4 md:right-4 md:top-4 md:bottom-0">
          <Button onClick={() => setOpenModal(true)}>Create blog</Button>
        </div>
        <div className=" fixed top-4 left-4 md:left-4 md:top-4">
          <Link to="/">
            <Button>Back</Button>
          </Link>
        </div>
      </div>
      <Modal show={openModal} onClose={() => handleOnCloseModal()}>
        <Modal.Header>Create Post</Modal.Header>
        <Modal.Body>
          <Form method="post" id="post-form">
            <input type="hidden" name="_method" value="create" />
            <p>
              <label>
                Post Title:{" "}
                {(localErrors as any)?.title ? (
                  <em className="text-red-600">{(localErrors as any).title}</em>
                ) : null}
                <input type="text" name="title" className={inputClassName} />
              </label>
            </p>
            <p>
              <label>
                Post Slug:{" "}
                {(localErrors as any)?.slug ? (
                  <em className="text-red-600">{(localErrors as any).slug}</em>
                ) : null}
                <input type="text" name="slug" className={inputClassName} />
              </label>
            </p>
            <p>
              <label htmlFor="markdown">Markdown: </label>
              {(localErrors as any)?.markdown ? (
                <em className="text-red-600">
                  {(localErrors as any).markdown}
                </em>
              ) : null}
              <br />
              <textarea
                id="markdown"
                rows={15}
                name="markdown"
                className={`${inputClassName} font-mono`}
              />
            </p>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex gap-2 w-full justify-end">
            <Button
              className="w-[80px]"
              type="button"
              onClick={handleFormSubmit}
            >
              {isCreating && actionType === EAction.create ? (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <p>Create</p>
              )}
            </Button>
            <Button color="gray" onClick={() => handleOnCloseModal()}>
              Cancle
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <Modal
        show={!!selectedPost === true}
        onClose={() => handleOnCloseModal()}
      >
        <Modal.Header>Edit post: {selectedPost?.slug}</Modal.Header>
        <Modal.Body>
          <Form method="post" id="edit-post-form">
            <input type="hidden" name="_method" value="edit" />
            <input
              type="hidden"
              name="slug"
              defaultValue={selectedPost?.slug}
            />
            <p>
              <label>
                Post Title:{" "}
                {(localErrors as any)?.title ? (
                  <em className="text-red-600">{(localErrors as any).title}</em>
                ) : null}
                <input
                  defaultValue={selectedPost?.title}
                  type="text"
                  name="title"
                  className={inputClassName}
                />
              </label>
            </p>
            <p>
              <label htmlFor="markdown">Markdown: </label>
              {(localErrors as any)?.markdown ? (
                <em className="text-red-600">
                  {(localErrors as any).markdown}
                </em>
              ) : null}
              <br />
              <textarea
                defaultValue={selectedPost?.markdown}
                id="markdown"
                rows={15}
                name="markdown"
                className={`${inputClassName} font-mono`}
              />
            </p>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex gap-2 w-full justify-end">
            <Form method="post" id="delete-post">
              <input type="hidden" name="_method" value="delete" />
              <input
                type="hidden"
                name="slug"
                defaultValue={selectedPost?.slug}
              />
              <Button
                className="w-[80px]"
                color="failure"
                type="button"
                onClick={handleDeletePost}
              >
                {isCreating && actionType === EAction.delete ? (
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-red-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  <p>Delete</p>
                )}
              </Button>
            </Form>
            <Button className="w-[80px]" type="button" onClick={handleEditPost}>
              {isCreating && actionType === EAction.edit ? (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <p>Edit</p>
              )}
            </Button>
            <Button color="gray" onClick={() => handleOnCloseModal()}>
              Cancle
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
