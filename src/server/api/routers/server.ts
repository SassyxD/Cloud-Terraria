import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { callLambda } from "~/server/aws/lambdaClient";
import type { LambdaResponse } from "~/server/aws/lambdaClient";

export const serverRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      return await ctx.db.serverInstance.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    }),

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

  const out = (await callLambda({ action: "START", userId: userId, ...input })) as LambdaResponse | null;
  const instanceId = typeof out?.instanceId === "string" ? out.instanceId : undefined;
  if (out?.ok && instanceId) {
        await ctx.db.serverInstance.update({
          where: { id: rec.id },
          data: { instanceId, state: "running" },
        });
        return { id: rec.id, instanceId, message: "Server created successfully" };
      }

      await ctx.db.serverInstance.update({ where: { id: rec.id }, data: { state: "ERROR" } });
      const errorMessage = typeof out?.error === "string" ? out.error : String(out?.error ?? "Lambda START failed");
      throw new Error(errorMessage);
    }),

  start: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const server = await ctx.db.serverInstance.findFirst({
        where: { id: input.id, userId },
      });
      
      if (!server) {
        throw new Error("Server not found");
      }

      const out = await callLambda({ 
        action: "START", 
        instanceId: server.instanceId 
      }) as LambdaResponse | null;

      if (out?.ok) {
        await ctx.db.serverInstance.update({
          where: { id: input.id },
          data: { state: "running" },
        });
        return { success: true, message: "Server started" };
      }

      throw new Error(out?.error ?? "Failed to start server");
    }),

  stop: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const server = await ctx.db.serverInstance.findFirst({
        where: { id: input.id, userId },
      });
      
      if (!server) {
        throw new Error("Server not found");
      }

      const out = await callLambda({ 
        action: "STOP", 
        instanceId: server.instanceId 
      }) as LambdaResponse | null;

      if (out?.ok) {
        await ctx.db.serverInstance.update({
          where: { id: input.id },
          data: { state: "stopped" },
        });
        return { success: true, message: "Server stopped" };
      }

      throw new Error(out?.error ?? "Failed to stop server");
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const server = await ctx.db.serverInstance.findFirst({
        where: { id: input.id, userId },
      });
      
      if (!server) {
        throw new Error("Server not found");
      }

      // Stop the instance first if it's running
      if (server.state === "running") {
        await callLambda({ 
          action: "STOP", 
          instanceId: server.instanceId 
        });
      }

      // Delete from database
      await ctx.db.serverInstance.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Server deleted" };
    }),
});
