import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getCurrentPromptLibrary, refreshPromptLibrary } from "./promptLibrary";
import { clearTeamAccessCookie, createTeamAccessSession, hasTeamAccess, teamAccessCookie, verifyTeamAccessCode } from "./teamAccess";

function teamProcedure() {
  return publicProcedure.use(({ ctx, next }) => {
    if (!hasTeamAccess(ctx.req)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Team access is required." });
    return next();
  });
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  teamAccess: router({
    status: publicProcedure.query(({ ctx }) => ({ hasAccess: hasTeamAccess(ctx.req) })),
    verify: publicProcedure.input(z.object({ code: z.string().min(1).max(256) })).mutation(({ ctx, input }) => {
      if (!verifyTeamAccessCode(input.code)) throw new TRPCError({ code: "UNAUTHORIZED", message: "That access code is not recognized." });
      ctx.res.setHeader("Set-Cookie", teamAccessCookie(createTeamAccessSession()));
      return { hasAccess: true };
    }),
    signOut: publicProcedure.mutation(({ ctx }) => {
      ctx.res.setHeader("Set-Cookie", clearTeamAccessCookie());
      return { hasAccess: false };
    }),
  }),
  promptLibrary: router({
    get: teamProcedure().query(() => getCurrentPromptLibrary()),
    refresh: teamProcedure().mutation(() => refreshPromptLibrary()),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
