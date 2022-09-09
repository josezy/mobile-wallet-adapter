import bs58 from 'bs58';
import axios from 'axios';

import { useConnection } from '@solana/wallet-adapter-react';
import { SignatureResult, Transaction, RpcResponseAndContext } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import React, { useContext, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

import useAuthorization from '../utils/useAuthorization';
import useGuardedCallback from '../utils/useGuardedCallback';
import { SnackbarContext } from './SnackbarProvider';

import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { BASE_ENDPOINT } from '../utils/constants';

type Props = Readonly<{
  children?: React.ReactNode;
}>;

export default function MintTokenButton({ children }: Props) {
  const { authorizeSession, selectedAccount } = useAuthorization();
  const { connection } = useConnection();
  const setSnackbarProps = useContext(SnackbarContext);
  const [loading, setLoading] = useState<boolean>(false);

  const mintTokenGuarded = useGuardedCallback(
    async (): Promise<string> => {
      const [signature] = await transact(async (wallet: Web3MobileWallet) => {
        const owner = selectedAccount?.publicKey ?? (await authorizeSession(wallet)).publicKey

        const res = await axios.get(`${BASE_ENDPOINT}/api/mint-nft`, {
          params: { owner: owner.toString() }
        })
        const transaction = Transaction.from(bs58.decode(res.data.data.transaction))
        return await wallet.signAndSendTransactions({
          transactions: [transaction],
        });
      })

      await connection.confirmTransaction(signature)
      return signature
    },
    [authorizeSession, connection, selectedAccount],
  );

  return (
    <>
      <View style={styles.buttonGroup}>
        <Button
          onPress={async () => {
            if (loading) return
            setLoading(true)
            const signature = await mintTokenGuarded();
            if (signature) {
              setSnackbarProps({
                action: {
                  label: 'View txn',
                  onPress() {
                    const explorerUrl =
                      `https://explorer.solana.com/tx/${signature}?cluster=devnet`
                    Linking.openURL(explorerUrl);
                  },
                },
                children: 'NFT minted!',
              });
            }
            setLoading(false)
          }}
          mode="contained"
          style={styles.actionButton}
          loading={loading}
        >
          Mint NFT
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    marginEnd: 8,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
});
