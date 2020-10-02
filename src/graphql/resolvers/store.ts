import path from 'path';
import fs from 'fs';
import getConfig from 'next/config';
import { ApolloError } from 'apollo-server-micro';

import { Store } from 'src/types/graphql';

const { serverRuntimeConfig } = getConfig();

const storesDir = path.resolve(
  serverRuntimeConfig.APP_ROOT,
  'static',
  'stores'
);

type Args = {
  storeId: string;
};

export async function store(_parent: unknown, args: Args) {
  const { storeId } = args;
  try {
    const store: Store = JSON.parse(
      fs.readFileSync(path.resolve(storesDir, `${storeId}.json`), 'utf8')
    );
    return {
      ...store,
      location: {
        lat: store.location?.lat || 0.0,
        lng: store.location?.lng || 0.0,
      },
    };
  } catch (error) {
    throw new ApolloError(error);
  }
}
