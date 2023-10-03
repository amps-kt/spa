import { auth, clerkClient } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const dataSchema = z.object({
  isStudent: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await req.json();
  const result = dataSchema.safeParse(data);

  if (!result.success) {
    return NextResponse.json({ status: 400 });
  }

  const typedData: z.infer<typeof dataSchema> = data;

  await clerkClient.users
    .updateUserMetadata(userId, {
      publicMetadata: {
        isStudent: typedData.isStudent,
      },
    })
    .then(() =>
      console.log(
        `you are ${!typedData.isStudent ? "not " : ""}a student ${
          !typedData.isStudent ? ":((" : ":))"
        }`,
      ),
    );

  return NextResponse.json({ status: 200, data: "success" });
}
