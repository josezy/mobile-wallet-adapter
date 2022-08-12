import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';
import {useConnection} from '@solana/wallet-adapter-react';
import {
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import React, {useContext, useState} from 'react';
import {Linking, StyleSheet, View} from 'react-native';
import {Button, Dialog, Paragraph, Portal} from 'react-native-paper';
import {TextEncoder} from 'text-encoding';

import useAuthorization from '../utils/useAuthorization';
import useGuardedCallback from '../utils/useGuardedCallback';
import {SnackbarContext} from './SnackbarProvider';

import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { getCandyMachineState, mintOneToken } from '../cmui/candy-machine';

// import * as anchor from '../anchor/dist/browser/index'

type Props = Readonly<{
  children?: React.ReactNode;
}>;

const candyMachineId = new PublicKey("2JuHo7foN4ybZRUssESKmTBhVPhCa95v6odG7T1UDMWU")

export default function MintTokenButton({children}: Props) {
  const {authorizeSession, selectedAccount} = useAuthorization();
  const {connection} = useConnection();
  // const setSnackbarProps = useContext(SnackbarContext);
  // const [recordMessageTutorialOpen, setRecordMessageTutorialOpen] = useState(false);
  // const [recordingInProgress, setRecordingInProgress] = useState(false);
  const mintTokenGuarded = useGuardedCallback(
    // async (): Promise<[string, RpcResponseAndContext<SignatureResult>]> => {
    async (): Promise<void> => {
      const chucha = await transact(async (wallet: Web3MobileWallet) => {
        const [freshAccount, latestBlockhash] = await Promise.all([
          authorizeSession(wallet),
          connection.getLatestBlockhash(),
        ]);

        const lePK = selectedAccount?.publicKey ?? freshAccount.publicKey
        const anchorWallet = {
          publicKey: lePK,
          // signAllTransactions: wallet.signAllTransactions,
          // signTransaction: wallet.signTransaction,
          signAllTransactions: async (txs: Transaction[]) => await wallet.signTransactions({transactions: txs}),
          signTransaction: async (tx: Transaction) => (await wallet.signTransactions({transactions: [tx]}))[0],
        } as any // Intentional, to remind you about the anchor version mismatch

        console.log("el hijo", anchorWallet)
        console.log("gonorrea", candyMachineId)

        const candyMachine = await getCandyMachineState(
          anchorWallet,
          candyMachineId,
          connection
        );

        console.log("wallet.publicKey", wallet.publicKey)

        const mintResult = await mintOneToken(
          candyMachine,
          lePK,
          // beforeTransactions,
          // afterTransactions,
          // setupMint ?? setupTxn
        );

        console.log("mintResult", mintResult)

        return "5678"
      })
      console.log("1234", chucha)
      // const [signature] = await transact(async wallet => {
      //   console.log("hehehe", wallet)
      //   // const [freshAccount, latestBlockhash] = await Promise.all([
      //   //   authorizeSession(wallet),
      //   //   connection.getLatestBlockhash(),
      //   // ]);
      //   // const memoProgramTransaction = new Transaction({
      //   //   ...latestBlockhash,
      //   //   feePayer:
      //   //     // Either the public key that was already selected when this method was called...
      //   //     selectedAccount?.publicKey ??
      //   //     // ...or the newly authorized public key.
      //   //     freshAccount.publicKey,
      //   // }).add(
      //   //   new TransactionInstruction({
      //   //     data: messageBuffer,
      //   //     keys: [],
      //   //     programId: new PublicKey(
      //   //       'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
      //   //     ),
      //   //   }),
      //   // );
      //   // return await wallet.signAndSendTransactions({
      //   //   connection,
      //   //   transactions: [memoProgramTransaction],
      //   // });
      //   return ["signature"]
      // });
      // return [signature, await connection.confirmTransaction(signature)];
    },
    [authorizeSession, connection, selectedAccount],
  );

  return (
    <>
      <View style={styles.buttonGroup}>
        <Button
          onPress={async () => {
            const result = await mintTokenGuarded();
          }}
          mode="contained"
          style={styles.actionButton}>
          My pinche btn
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
