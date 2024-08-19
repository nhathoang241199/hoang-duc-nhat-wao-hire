import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getPosts } from "~/models/post.server";
import { Tooltip, Button } from "flowbite-react";

export const loader = async () => {
  return json({ posts: await getPosts() });
};

export default function Posts() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <div className="w-full flex justify-center  min-h-[100vh] ">
      <div className="w-full md:w-[1000px] bg-white min-h-[100vh] flex items-center flex-col py-10 relative">
        <h1 className=" text-[32px] font-bold">Our Blog</h1>
        <p className="text-gray-600 w-[80%] md:w-[600px] text-center mt-4">
          We use an agile approach to test assumptions and connect with the
          needs of your audience early and often.
        </p>
        <div className="flex flex-col mt-6 w-full md:w-[800px]">
          {posts.map((post) => (
            <Link style={{ width: "100%" }} to={`/posts/${post.slug}`}>
              <div
                className="flex flex-col items-center justify-center gap-2 py-10 border-b-solid border-b-[0.5px] border-b-gray-300 min-w-full md:min-w-[600px] hover:bg-gray-100"
                key={post.slug}
              >
                <p className="text-[24px] font-semibold">{post.title}</p>
                <p>
                  {post.slug} -{" "}
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className=" fixed bottom-4 right-4 md:right-4 md:top-4 md:bottom-0">
          <Link to="/posts/admin" className="text-red-600">
            <Button>Admin</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
