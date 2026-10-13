// Worker bindings come from worker-configuration.d.ts (`pnpm cf-typegen`, generated without runtime types so
// they do not clash with the DOM types used by client scripts). Declare the one runtime export the action uses.
declare module "cloudflare:workers" {
  export const env: Cloudflare.Env;
}

// @barba/core 2.10.3 points "types" at a folder with no index; re-export its real declarations.
declare module "@barba/core" {
  import barba from "@barba/core/dist/core/src/src/index";
  export default barba;
}
