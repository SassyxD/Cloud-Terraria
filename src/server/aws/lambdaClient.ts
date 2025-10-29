import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export type LambdaResponse = {
  ok: boolean;
  instanceId?: string;
  state?: string;
  publicIp?: string;
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
    
    // Enhanced mock responses for testing UI
    const action = (payload as any)?.action;
    const mockInstanceId = "i-mock1234567890abc";
    const mockPublicIp = "203.0.113.42"; // Example IP from RFC 5737
    
    switch (action) {
      case "START":
        console.log("[MOCK] Starting server instance...");
        return { 
          ok: true, 
          instanceId: mockInstanceId, 
          state: "running",
          publicIp: mockPublicIp,
          message: "Mock server started successfully (AWS not configured)"
        };
      
      case "STOP":
        console.log("[MOCK] Stopping server instance...");
        return { 
          ok: true, 
          instanceId: mockInstanceId, 
          state: "stopped",
          message: "Mock server stopped successfully"
        };
      
      case "STATUS":
        console.log("[MOCK] Getting server status...");
        return { 
          ok: true, 
          instanceId: mockInstanceId, 
          state: "running",
          publicIp: mockPublicIp,
          exists: true
        };
      
      default:
        return { ok: false, error: "lambda-not-configured" };
    }
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
      state: typeof (parsed as any).state === "string" ? (parsed as any).state : undefined,
      publicIp: typeof (parsed as any).publicIp === "string" ? (parsed as any).publicIp : undefined,
      error: typeof (parsed as any).error === "string" ? (parsed as any).error : undefined,
      ...parsed,
    };
    return out;
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// Export helper function for easier use
export async function invokeLambda(payload: unknown): Promise<LambdaResponse> {
  const result = await callLambda(payload);
  return result ?? { ok: false, error: "No response from Lambda" };
}
