import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { callLambda } from "~/server/aws/lambdaClient";
import type { LambdaResponse } from "~/server/aws/lambdaClient";

export const serverRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      worldName: z.string().default("MyWorld"),
      version: z.string().default("latest"),
      port: z.number().default(7777),
    }))
    .mutation(async ({ ctx, input }) => {
  // `protectedProcedure` guarantees `ctx.session.user` exists
  const userId = ctx.session.user.id;

      const rec = await ctx.db.serverInstance.create({
        data: { userId, ...input },
      });

  const out = (await callLambda({ action: "CREATE", userId: userId, ...input })) as LambdaResponse | null;
  const instanceId = typeof out?.instanceId === "string" ? out.instanceId : undefined;
  if (out?.ok && instanceId) {
        await ctx.db.serverInstance.update({
          where: { id: rec.id },
          data: { instanceId, state: "PENDING" },
        });
        return { id: rec.id };
      }

      await ctx.db.serverInstance.update({ where: { id: rec.id }, data: { state: "ERROR" } });
      const errorMessage = typeof out?.error === "string" ? out.error : String(out?.error ?? "Lambda CREATE failed");
      throw new Error(errorMessage);
    }),
});
