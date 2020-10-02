import { ApolloError } from 'apollo-server-micro';

type Args = {
  category?: string;
};

export async function stores(_parent: unknown, args: Args) {
  const { category } = args;
  const categories: string[] = [];

  try {
    let stores = (await import('static/all.json')).default;

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
