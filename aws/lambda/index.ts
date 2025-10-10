import {
  EC2Client, RunInstancesCommand, StartInstancesCommand, StopInstancesCommand,
  TerminateInstancesCommand, DescribeInstancesCommand
} from "@aws-sdk/client-ec2";

const REGION = process.env.AWS_REGION ?? "ap-southeast-1";
const AMI_ID = process.env.AMI_ID;
const INSTANCE_TYPE = process.env.INSTANCE_TYPE ?? "t3.small";
const SECURITY_GROUP_ID = process.env.SECURITY_GROUP_ID;
const SUBNET_ID = process.env.SUBNET_ID;
const KEY_NAME = process.env.KEY_NAME || "";

const ec2 = new EC2Client({ region: REGION });

export const handler = async (event: any) => {
  const body = typeof event.body === "string" ? JSON.parse(event.body) : (event.body ?? event);
  const action = body.action;
  const instanceId = body.instanceId;
  const userId = body.userId;
  const worldName = body.worldName ?? "MyWorld";
  const version = body.version ?? "latest";
  const serverPort = Number(body.port ?? 7777);

  try {
    if (action === "CREATE") {
      const userData = Buffer.from(`#cloud-config
runcmd:
  - apt-get update -y
  - apt-get install -y docker.io
  - systemctl enable docker
  - systemctl start docker
  - docker run -d --restart always --name terraria -p ${serverPort}:7777 -e WORLD_NAME=${worldName} --volume /opt/terraria:/root/.local/share/Terraria tccr/terraria-server:${version}
`).toString("base64");

      const run = await ec2.send(new RunInstancesCommand({
        ImageId: AMI_ID,
        InstanceType: INSTANCE_TYPE,
        MinCount: 1,
        MaxCount: 1,
        KeyName: KEY_NAME || undefined,
        SecurityGroupIds: [SECURITY_GROUP_ID],
        SubnetId: SUBNET_ID,
        UserData: userData,
        TagSpecifications: [{
          ResourceType: "instance",
          Tags: [
            { Key: "Project", Value: "Terrakit" },
            { Key: "OwnerUserId", Value: userId },
            { Key: "Service", Value: "Terraria" }
          ]
        }]
      }));
      return { ok: true, instanceId: run.Instances?.[0]?.InstanceId };
    }

    if (!instanceId) return { ok: false, error: "instanceId required" };

    if (action === "START")      { await ec2.send(new StartInstancesCommand({ InstanceIds: [instanceId] })); return { ok: true }; }
    if (action === "STOP")       { await ec2.send(new StopInstancesCommand({ InstanceIds: [instanceId] }));  return { ok: true }; }
    if (action === "TERMINATE")  { await ec2.send(new TerminateInstancesCommand({ InstanceIds: [instanceId] })); return { ok: true }; }

    if (action === "STATUS") {
      const d = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
      const res = d.Reservations?.[0]?.Instances?.[0];
      return { ok: true, state: res?.State?.Name, publicIp: res?.PublicIpAddress };
    }

    return { ok: false, error: "unknown action" };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e?.message ?? "error" };
  }
};
