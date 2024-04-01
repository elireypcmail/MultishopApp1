import '@s/_index.scss'
import type { AppProps } from "next/app";
import {NextUIProvider} from "@nextui-org/react";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { store } from '@g/redux/store'

export default function App({ Component, pageProps }: AppProps) {
  const persistor = persistStore(store)
  
  return (
    <>
      <NextUIProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Component {...pageProps} />
          </PersistGate>
        </Provider>
      </NextUIProvider>
    </>
  );
}
