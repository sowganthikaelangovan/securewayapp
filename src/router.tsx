import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  const ensureCompat = () => {
    if (!(router as any).looseRoutesById) {
      Object.defineProperty(router, "looseRoutesById", {
        get() {
          return (this as any).routesById;
        },
        configurable: true,
        enumerable: true,
      });
    }

    if (router.stores && !(router.stores as any).matchesId && (router.stores as any).ids) {
      Object.defineProperty(router.stores, "matchesId", {
        get() {
          return (this as any).ids;
        },
        configurable: true,
        enumerable: true,
      });
    }
  };

  ensureCompat();

  const originalMatchRoutes = router.matchRoutes.bind(router);
  router.matchRoutes = ((...args: [any, any?]) => {
    const matches = (originalMatchRoutes as any)(...args);
    if (Array.isArray(matches)) {
      for (const match of matches) {
        if (match && typeof match === "object" && !(match as any)._nonReactive) {
          (match as any)._nonReactive = {};
        }
      }
    }
    return matches;
  }) as typeof router.matchRoutes;

  const originalUpdate = router.update.bind(router);
  router.update = (newOptions: any) => {
    const res = originalUpdate(newOptions);
    ensureCompat();
    return res;
  };

  return router;
};
