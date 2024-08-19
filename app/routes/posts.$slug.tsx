import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getPost } from "~/models/post.server";
import { marked } from "marked";
import { Button } from "flowbite-react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const post = await getPost(params.slug || "");

  const html = marked(post?.markdown || "");

  return json({ html, post });
};

export default function PostSlug() {
  const { post, html } = useLoaderData<typeof loader>();
  return (
    <div className="w-full flex justify-center  min-h-[100vh] ">
      <div className="  w-full md:w-[1000px]  min-h-[100vh] flex items-center flex-col py-10 relative">
        <h1 className=" text-[32px] font-bold border-b-solid border-b-[0.5px] border-b-gray-300 py-4 px-8">
          {post?.title || "Not found post"}
        </h1>
        <p className="text-gray-600 w-[80%] md:w-[600px] text-center mt-4">
          {new Date(post?.createdAt || "").toLocaleDateString("vi-VN")}
        </p>
        <div className="p-4 mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className="  fixed top-4 left-4 md:left-4 md:top-4 w-[80%] md:w-[600px]">
        <Link to="/">
          <Button>Back</Button>
        </Link>
      </div>
    </div>
  );
}
