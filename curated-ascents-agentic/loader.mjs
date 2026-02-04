import { resolve as resolveTs } from 'ts-node/esm';
import * as tsConfigPaths from 'tsconfig-paths';
import { pathToFileURL } from 'url';

export { load, transformSource } from 'ts-node/esm';

export async function resolve(specifier, context, defaultResolve) {
  const mappedSpecifier = tsConfigPaths.createMatchPath()(specifier);
  if (mappedSpecifier) {
    specifier = pathToFileURL(`${mappedSpecifier}`).href;
  }
  return resolveTs(specifier, context, defaultResolve);
}