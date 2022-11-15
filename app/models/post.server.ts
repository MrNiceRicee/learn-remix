import { Post } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getPostListings() {
  return prisma.post.findMany({
    select: {
      slug: true,
      title: true,
    },
  });
}

export async function getPosts() {
  return prisma.post.findMany();
}

export async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: {
      slug,
    },
    select: {
      title: true,
      markdown: true,
      slug: true,
    },
  });
}

export async function createPost({
  title,
  markdown,
}: Pick<Post, "title" | "markdown">) {
  return prisma.post.create({
    data: {
      markdown,
      title,
      slug: title.toLowerCase().replace(/ /g, "-"),
    },
  });
}

export async function updatePost(
  slug: string,
  { title, markdown }: Pick<Post, "title" | "markdown">
) {
  return prisma.post.update({
    where: {
      slug,
    },
    data: {
      markdown,
      title,
      slug: title.toLowerCase().replace(/ /g, "-"),
      updatedAt: new Date(),
    },
  });
}

export async function deletePost(slug: string) {
  return prisma.post.delete({
    where: {
      slug,
    },
  });
}
