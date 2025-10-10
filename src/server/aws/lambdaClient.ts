/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({ region: process.env.AWS_REGION! });
const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME!;

export async function callLambda(payload: unknown) {
  const cmd = new InvokeCommand({
    FunctionName: functionName,
    Payload: Buffer.from(JSON.stringify(payload)),
  });
  const res = await lambda.send(cmd);
  return res.Payload ? JSON.parse(Buffer.from(res.Payload as Uint8Array).toString()) : null;
}
