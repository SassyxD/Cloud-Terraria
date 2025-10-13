import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export type LambdaResponse = {
  ok: boolean;
  instanceId?: string;
  error?: string;
  [key: string]: unknown;
};

const lambda = new LambdaClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;

export async function callLambda(payload: unknown): Promise<LambdaResponse | null> {
  // Demo-friendly guard: if a Lambda function name is not configured, return a mock
  // response instead of attempting a remote invocation. This makes local demos safe
  // when AWS credentials or a real lambda are not available.
  if (!functionName) {
    console.warn("AWS_LAMBDA_FUNCTION_NAME not set — returning mock lambda response for demo");
    return { ok: false, error: "lambda-not-configured" };
  }

  const cmd = new InvokeCommand({
    FunctionName: functionName,
    Payload: Buffer.from(JSON.stringify(payload)),
  });
  const res = await lambda.send(cmd);
  if (!res.Payload) return null;
  try {
    const parsed = JSON.parse(Buffer.from(res.Payload as Uint8Array).toString());
    // Ensure the parsed value matches expected shape enough for runtime use
    const out: LambdaResponse = {
      ok: Boolean((parsed as any).ok),
      instanceId: typeof (parsed as any).instanceId === "string" ? (parsed as any).instanceId : undefined,
      error: typeof (parsed as any).error === "string" ? (parsed as any).error : undefined,
      ...parsed,
    };
    return out;
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
