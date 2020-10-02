import path from 'path';
import fs from 'fs';
import getConfig from 'next/config';
import { ApolloError } from 'apollo-server-micro';

import { Store } from 'src/types/graphql';

type Args = {
  category?: string;
};

const { serverRuntimeConfig } = getConfig();
const allPath = path.resolve(
  serverRuntimeConfig.APP_ROOT,
  'static',
  'all.json'
);

export async function stores(_parent: unknown, args: Args) {
  const { category } = args;
  const categories: string[] = [];

  try {
    let stores: Store[] = JSON.parse(fs.readFileSync(allPath, 'utf8'));

    // category filter
    if (category) {
      stores = stores.filter((store) => store.category === category);
    }

    stores.forEach((store) => {
      if (!categories.includes(store.category)) {
        categories.push(store.category);
      }
    });

    return {
      totalCount: stores.length,
      categories,
      nodes: stores,
    };
  } catch (error) {
    throw new ApolloError(error);
  }
}
