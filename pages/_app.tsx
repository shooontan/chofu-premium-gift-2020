import {
  AppPropsType,
  AppContextType,
  NextComponentType,
} from 'next/dist/next-server/lib/utils';
import { ApolloProvider } from '@apollo/client';

import { useApollo } from 'hooks/useApollo';
import 'styles/global.css';
import 'leaflet/dist/leaflet.css';

type Props = {};

const App: NextComponentType<AppContextType, Props, AppPropsType> = ({
  Component,
  pageProps,
}) => {
  const apolloClient = useApollo(pageProps.initialApolloState);
  return (
    <>
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    </>
  );
};

export default App;
