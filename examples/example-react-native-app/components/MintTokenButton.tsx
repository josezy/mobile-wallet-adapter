import {useConnection} from '@solana/wallet-adapter-react';
import { PublicKey, SignatureResult, Transaction, RpcResponseAndContext } from '@solana/web3.js';
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import React, {useContext, useState} from 'react';
import {Linking, StyleSheet, View} from 'react-native';
import {Button, Dialog, Paragraph, Portal} from 'react-native-paper';

import useAuthorization from '../utils/useAuthorization';
import useGuardedCallback from '../utils/useGuardedCallback';
import {SnackbarContext} from './SnackbarProvider';

import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import axios from 'axios';
import bs58 from 'bs58';

type Props = Readonly<{
  children?: React.ReactNode;
}>;

const HELPER_API = 'http://192.168.1.58:3000/api/mint-nft'

export default function MintTokenButton({children}: Props) {
  const {authorizeSession, selectedAccount} = useAuthorization();
  const {connection} = useConnection();
  // const setSnackbarProps = useContext(SnackbarContext);
  // const [recordMessageTutorialOpen, setRecordMessageTutorialOpen] = useState(false);
  // const [recordingInProgress, setRecordingInProgress] = useState(false);

  const mintTokenGuarded = useGuardedCallback(
    async (): Promise<[string, RpcResponseAndContext<SignatureResult>]> => {
      const [signature] = await transact(async (wallet: Web3MobileWallet) => {
        const freshAccount = await authorizeSession(wallet)
        const owner = selectedAccount?.publicKey ?? freshAccount.publicKey

        const res = await axios.get(HELPER_API, {
          params: { owner: owner.toString() }
        })
        const transaction = Transaction.from(bs58.decode(res.data.data.transaction))
        console.log("transaction", transaction)

        return await wallet.signAndSendTransactions({
          transactions: [transaction],
        });
      })
      console.log("signature", signature)
      return [signature, await connection.confirmTransaction(signature)]
    },
    [authorizeSession, connection, selectedAccount],
  );

  return (
    <>
      <View style={styles.buttonGroup}>
        <Button
          onPress={async () => {
            const result = await mintTokenGuarded();
            console.log("result", result)
          }}
          mode="contained"
          style={styles.actionButton}
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
