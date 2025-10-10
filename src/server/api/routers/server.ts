create: protectedProcedure
  .input(z.object({
    worldName: z.string().default("MyWorld"),
    version: z.string().default("latest"),
    port: z.number().default(7777),
  }))
  .mutation(async ({ ctx, input }) => {
    const rec = await prisma.serverInstance.create({
      data: { userId: ctx.userId, ...input }
    });

    const out = await callLambda({ action: "CREATE", userId: ctx.userId, ...input });
    if (out?.ok && out.instanceId) {
      await prisma.serverInstance.update({
        where: { id: rec.id },
        data: { instanceId: out.instanceId, state: "PENDING" }
      });
      return { id: rec.id };
    }
    await prisma.serverInstance.update({ where: { id: rec.id }, data: { state: "ERROR" }});
    throw new Error(out?.error ?? "Lambda CREATE failed");
  }),
