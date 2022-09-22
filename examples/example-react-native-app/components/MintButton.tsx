import * as anchor from "@project-serum/anchor";

import { useConnection } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  Transaction,
} from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import React, { useContext, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

import useAuthorization from '../utils/useAuthorization';
import useGuardedCallback from '../utils/useGuardedCallback';
import { getCandyMachineState, mintOneToken } from "../utils/candy-machine";
import { SnackbarContext } from "./SnackbarProvider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

type Props = Readonly<{
  children?: React.ReactNode;
}>;

const candyMachineId = new PublicKey('4muNoMvUbLFi8btqE8QV2YnsFYF2qUQ6tb9xVyHSUPFj')

export default function MintButton({ children }: Props) {
  const { authorizeSession, selectedAccount } = useAuthorization();
  const { connection } = useConnection();
  const setSnackbarProps = useContext(SnackbarContext);

  const [mintingInProcess, setMintingInProcess] = useState(false);

  const mintTokenGuarded = useGuardedCallback(
    async (): Promise<[string, RpcResponseAndContext<SignatureResult>]> => {

      const [signature] = await transact(async wallet => {
        const [freshAccount, latestBlockhash] = await Promise.all([
          authorizeSession(wallet),
          connection.getLatestBlockhash(),
        ]);

        const lePK = freshAccount.publicKey

        const anchorWallet = {
          publicKey: lePK,
        } as anchor.Wallet

        const candyMachine = await getCandyMachineState(
          anchorWallet,
          candyMachineId,
          connection
        );

        const [instructions, signers] = await mintOneToken(candyMachine, lePK);

        const transaction = new Transaction();
        instructions.forEach((instruction) => transaction.add(instruction));

        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = lePK

        transaction.partialSign(...signers)

        return await wallet.signAndSendTransactions({
          transactions: [transaction],
        });
      });

      return [signature, await connection.confirmTransaction(signature)];
    },
    [authorizeSession, connection],
  );
  return (
    <>
      <View style={styles.buttonGroup}>
        <Button
          disabled={!selectedAccount}
          loading={mintingInProcess}
          onPress={async () => {
            if (mintingInProcess) {
              return;
            }
            setMintingInProcess(true);
            try {
              const result = await mintTokenGuarded();
              if (result) {
                const [signature, response] = result;
                const {
                  value: { err },
                } = response;
                if (err) {
                  setSnackbarProps({
                    children:
                      'Failed to mint:' +
                      (err instanceof Error ? err.message : err),
                  });
                } else {
                  setSnackbarProps({
                    action: {
                      label: 'View tx',
                      onPress() {
                        const explorerUrl =
                          'https://explorer.solana.com/tx/' +
                          signature +
                          '?cluster=' +
                          WalletAdapterNetwork.Devnet;
                        Linking.openURL(explorerUrl);
                      },
                    },
                    children: 'NFT minted',
                  });
                }
              }
            } finally {
              setMintingInProcess(false);
            }
          }}
          mode="contained"
          style={styles.actionButton}>
          {children}
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
  infoButton: {
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
});
