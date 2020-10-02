import { store } from './store';
import { stores } from './stores';

export const resolvers = {
  Query: {
    store,
    stores,
  },
};
