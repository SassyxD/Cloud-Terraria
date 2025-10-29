import { NextResponse } from "next/server";
import { auth } from "~/server/auth/index";
import { invokeLambda } from "~/server/aws/lambdaClient";

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { instanceId } = await request.json();

    if (!instanceId) {
      return NextResponse.json({ error: "Instance ID required" }, { status: 400 });
    }

    const result = await invokeLambda({
      action: "STATUS",
      instanceId,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Failed to get status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      state: result.state,
      publicIp: result.publicIp,
    });
  } catch (error) {
    console.error("Error getting server status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}