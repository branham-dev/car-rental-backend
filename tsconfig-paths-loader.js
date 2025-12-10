// import { resolve } from "node:path";
// import { fileURLToPath } from "node:url";
// import { loadConfig, createMatchPath } from "tsconfig-paths";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = resolve(__filename, '..');

// const configResult = loadConfig(__dirname);

// if (configResult.resultType === 'failed') {
//   throw new Error(configResult.message);
// };

// const matchPath = createMatchPath(
//   configResult.absoluteBaseUrl,
//   configResult.paths,
// );

// export function resolveHook(specifier, context, nextResolve) {
//   const mapped = matchPath(specifier);

//   if (mapped) {
//     return nextResolve(mapped, context);
//   };

//   return nextResolve(specifier, context);
// };

// export const useResolve = resolveHook;

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, createMatchPath } from "tsconfig-paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configResult = loadConfig(__dirname);

if (configResult.resultType === "failed") {
  throw new Error(configResult.message);
}

const matchPath = createMatchPath(
  configResult.absoluteBaseUrl,
  configResult.paths
);

// THIS IS THE HOOK NODE RECOGNIZES
export async function resolve(specifier, context, nextResolve) {
  const mapped = matchPath(specifier);

  if (mapped) {
    return nextResolve(mapped, context);
  }

  return nextResolve(specifier, context);
}
