"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_ec2_1 = require("@aws-sdk/client-ec2");
const REGION = process.env.AWS_REGION ?? "ap-southeast-1";
const AMI_ID = process.env.AMI_ID;
const INSTANCE_TYPE = process.env.INSTANCE_TYPE ?? "t3.small";
const SECURITY_GROUP_ID = process.env.SECURITY_GROUP_ID;
const SUBNET_ID = process.env.SUBNET_ID;
const KEY_NAME = process.env.KEY_NAME || "";
const INSTANCE_PROFILE = process.env.INSTANCE_PROFILE;
const ec2 = new client_ec2_1.EC2Client({ region: REGION });
const handler = async (event) => {
    console.log("Lambda invoked with event:", JSON.stringify(event, null, 2));
    const body = typeof event.body === "string" ? JSON.parse(event.body) : (event.body ?? event);
    console.log("Parsed body:", JSON.stringify(body, null, 2));
    const action = body.action;
    const instanceId = body.instanceId;
    const userId = body.userId;
    const worldName = body.worldName ?? "MyWorld";
    const version = body.version ?? "latest";
    const serverPort = Number(body.port ?? 7777);
    console.log(`Action: ${action}, InstanceId: ${instanceId}, UserId: ${userId}`);
    try {
        // START action creates a new instance if instanceId is not provided
        if (action === "START") {
            // If instanceId is provided, start existing instance
            if (instanceId) {
                await ec2.send(new client_ec2_1.StartInstancesCommand({ InstanceIds: [instanceId] }));
                // Get instance info after starting
                const d = await ec2.send(new client_ec2_1.DescribeInstancesCommand({ InstanceIds: [instanceId] }));
                const res = d.Reservations?.[0]?.Instances?.[0];
                return {
                    ok: true,
                    instanceId,
                    state: res?.State?.Name ?? "pending",
                    publicIp: res?.PublicIpAddress
                };
            }
            // Otherwise, create new instance
            const userData = Buffer.from(`#!/bin/bash
apt-get update -y
apt-get install -y docker.io
systemctl enable docker
systemctl start docker
docker run -d --restart always --name terraria -p ${serverPort}:7777 -e WORLD_NAME=${worldName} --volume /opt/terraria:/root/.local/share/Terraria tccr/terraria-server:${version}
`).toString("base64");
            const run = await ec2.send(new client_ec2_1.RunInstancesCommand({
                ImageId: AMI_ID,
                InstanceType: INSTANCE_TYPE,
                MinCount: 1,
                MaxCount: 1,
                KeyName: KEY_NAME || undefined,
                SecurityGroupIds: SECURITY_GROUP_ID ? [SECURITY_GROUP_ID] : undefined,
                SubnetId: SUBNET_ID,
                UserData: userData,
                IamInstanceProfile: INSTANCE_PROFILE ? { Name: INSTANCE_PROFILE } : undefined,
                TagSpecifications: [{
                        ResourceType: "instance",
                        Tags: [
                            { Key: "Project", Value: "Terrakit" },
                            { Key: "OwnerUserId", Value: userId ?? "unknown" },
                            { Key: "Service", Value: "Terraria" },
                            { Key: "WorldName", Value: worldName }
                        ]
                    }]
            }));
            const newInstanceId = run.Instances?.[0]?.InstanceId;
            const publicIp = run.Instances?.[0]?.PublicIpAddress;
            return {
                ok: true,
                instanceId: newInstanceId,
                state: "pending",
                publicIp
            };
        }
        if (!instanceId)
            return { ok: false, error: "instanceId required" };
        if (action === "STOP") {
            await ec2.send(new client_ec2_1.StopInstancesCommand({ InstanceIds: [instanceId] }));
            return { ok: true, state: "stopping" };
        }
        if (action === "TERMINATE") {
            await ec2.send(new client_ec2_1.TerminateInstancesCommand({ InstanceIds: [instanceId] }));
            return { ok: true, state: "terminating" };
        }
        if (action === "STATUS") {
            const d = await ec2.send(new client_ec2_1.DescribeInstancesCommand({ InstanceIds: [instanceId] }));
            const res = d.Reservations?.[0]?.Instances?.[0];
            return { ok: true, state: res?.State?.Name, publicIp: res?.PublicIpAddress };
        }
        return { ok: false, error: "unknown action" };
    }
    catch (e) {
        console.error(e);
        const errMsg = e?.message ?? String(e ?? "error");
        return { ok: false, error: errMsg };
    }
};
exports.handler = handler;
