/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { callLambda } from "~/server/aws/lambdaClient";

export const serverRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      worldName: z.string().default("MyWorld"),
      version: z.string().default("latest"),
      port: z.number().default(7777),
    }))
    .mutation(async ({ ctx, input }) => {
      // `protectedProcedure` guarantees `ctx.session.user` exists
      const userId = ctx.session.user.id as string;

      const rec = await ctx.db.serverInstance.create({
        data: { userId, ...input },
      });

      const out = await callLambda({ action: "CREATE", userId: userId, ...input });
      if (out?.ok && out.instanceId) {
        await ctx.db.serverInstance.update({
          where: { id: rec.id },
          data: { instanceId: out.instanceId, state: "PENDING" },
        });
        return { id: rec.id };
      }

      await ctx.db.serverInstance.update({ where: { id: rec.id }, data: { state: "ERROR" } });
      throw new Error(out?.error ?? "Lambda CREATE failed");
    }),
});
