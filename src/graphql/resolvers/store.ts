import { ApolloError } from 'apollo-server-micro';

type Args = {
  storeId: string;
};

export async function store(_parent: unknown, args: Args) {
  const { storeId } = args;
  try {
    const store = (await import(`static/stores/${storeId}.json`)).default;
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
