/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;

export async function callLambda(payload: unknown) {
  // Demo-friendly guard: if a Lambda function name is not configured, return a mock
  // response instead of attempting a remote invocation. This makes local demos safe
  // when AWS credentials or a real lambda are not available.
  if (!functionName) {
    console.warn("AWS_LAMBDA_FUNCTION_NAME not set — returning mock lambda response for demo");
    return { ok: false, error: "lambda-not-configured" } as any;
  }

  const cmd = new InvokeCommand({
    FunctionName: functionName,
    Payload: Buffer.from(JSON.stringify(payload)),
  });
  const res = await lambda.send(cmd);
  return res.Payload ? JSON.parse(Buffer.from(res.Payload as Uint8Array).toString()) : null;
}
