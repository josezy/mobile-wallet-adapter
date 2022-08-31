import axios from 'axios'

import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import useAuthorization from '../utils/useAuthorization';
import QRNFT from './QRNFT';
// import useAuthorization from '../utils/useAuthorization';
// import useGuardedCallback from '../utils/useGuardedCallback';
// import { SnackbarContext } from './SnackbarProvider';

export interface INFT {
  mint: string,
  image: string,
}

type Props = Readonly<{
  children?: React.ReactNode;
}>;

const HELPER_API = 'http://192.168.1.58:3000/api/metaplex'

export default function NFTGrid({ children }: Props) {
  const { authorizeSession, selectedAccount } = useAuthorization();
  const [nfts, setNfts] = useState<INFT[]>([]);

  useEffect(() => {
    transact(async wallet => {
      const owner = selectedAccount?.publicKey ?? (await authorizeSession(wallet)).publicKey
      console.log("Owner", owner.toString())
      const res = await axios.get(HELPER_API, {
        params: { owner: owner.toString() }
      })
      if (res.data.success) setNfts(res.data.data)
      console.log("NFTs", res.data.data)
    });
  }, [authorizeSession, selectedAccount]);

  return (
    <>
      <View style={styles.mintsContainer}>
        {nfts.map((nft: INFT, idx: number) => <QRNFT key={idx} nft={nft} />)}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mintsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
});
