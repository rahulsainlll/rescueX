import Image from "next/image";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { User as PrismaUser } from "@prisma/client";

export default async function Home() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated) {
    redirect("/login");
  }

  const user = await getUser();
  const username = user.given_name;

  console.log("Authenticated user:", user);
  console.log("User picture URL:", user.picture);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { twitterId: user.id },
    });

    if (!existingUser) {
      console.log("Creating new user in the database");

      const pictureUrl = user.picture || "/fallbackAvatar.png"; 

      const newUser = await prisma.user.create({
        data: {
          twitterId: user.id,
          username: username || "Default Username",
          pfpUrl: pictureUrl,
        },
      });

      console.log("User created successfully");
    } else {
      console.log("User already exists:", existingUser);
    }
  } catch (error) {
    console.error("Error creating user:", error);
  }

  // Fetch all users for the canvas
  // let users: PrismaUser[] = [];
  // try {
  //   users = await prisma.user.findMany({
  //     include: {
  //       votesReceived: true,
  //     },
  //   });
  // } catch (error) {
  //   console.error("Error fetching users:", error);
  // }

  return (
    <div>
      
      <h1>Hey {username}, sup?</h1>
    </div>
  );
}