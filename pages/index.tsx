import React, { useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import dynamic from 'next/dynamic';

import * as Q from 'src/types/graphql';

const query = gql`
  query stores($category: String) {
    stores(category: $category) {
      totalCount
      categories
      nodes {
        id
        name
        category
        address
        location {
          lat
          lng
        }
      }
    }
  }
`;

const LeafletMap = dynamic(() => import('components/LeafletMap'), {
  ssr: false,
});

export default () => {
  const [fetch, { data }] = useLazyQuery<Q.StoresQuery, Q.QueryStoresArgs>(
    query
  );

  useEffect(() => {
    fetch({
      variables: {
        // category: '飲食店',
      },
    });
  }, []);

  const stores = data?.stores?.nodes || [];

  return (
    <div>
      <LeafletMap stores={stores} />
    </div>
  );
};
