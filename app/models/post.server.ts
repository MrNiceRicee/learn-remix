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
    },
  });
}

export async function createPost({
  title,
  markdown,
}: {
  title: string;
  markdown: string;
}) {
  return prisma.post.create({
    data: {
      markdown,
      title,
      slug: title.toLowerCase().replace(/ /g, "-"),
    },
  });
}
