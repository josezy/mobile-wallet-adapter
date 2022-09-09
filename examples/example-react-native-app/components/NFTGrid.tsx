import axios from 'axios'

import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import useAuthorization from '../utils/useAuthorization';
import QRNFT from './QRNFT';
import { Button } from 'react-native-paper';
import { BASE_ENDPOINT } from '../utils/constants';

export interface INFT {
  mint: string,
  image: string,
}

type Props = Readonly<{
  children?: React.ReactNode;
}>;

export default function NFTGrid({ children }: Props) {
  const { authorizeSession, selectedAccount } = useAuthorization();
  const [nfts, setNfts] = useState<INFT[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const refreshNfts = async () => transact(async wallet => {
    if (refreshing) return
    setRefreshing(true)
    const owner = selectedAccount?.publicKey ?? (await authorizeSession(wallet)).publicKey
    console.log("Owner", owner.toString())
    axios.get(`${BASE_ENDPOINT}/api/metaplex`, {
      params: { owner: owner.toString() }
    }).then((res) => {
      if (res.data.success) setNfts(res.data.data)
      console.log("NFTs", res.data.data)
      setRefreshing(false)
    })
  });

  useEffect(() => {
    refreshNfts()
  }, [authorizeSession, selectedAccount]);

  return (
    <>
      <View style={styles.buttonGroup}>
        <Button
          onPress={refreshNfts}
          mode="contained"
          style={styles.actionButton}
          loading={refreshing}
        >
          Refresh
        </Button>
      </View>
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
  buttonGroup: {
    width: '100%',
  },
  actionButton: {
    width: '100%',
    backgroundColor: 'black',
  },
});
