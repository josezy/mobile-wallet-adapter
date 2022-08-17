import axios from 'axios'
import bs58 from 'bs58'
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
import {Button, Dialog, Paragraph, Portal, Text} from 'react-native-paper';
import {TextEncoder} from 'text-encoding';

import useAuthorization from '../utils/useAuthorization';
import useGuardedCallback from '../utils/useGuardedCallback';
import {SnackbarContext} from './SnackbarProvider';


type Props = Readonly<{
  children?: React.ReactNode;
  mint: PublicKey,
}>;

export default function VerifyNFTOwnershipButton({children, mint}: Props) {
  const {authorizeSession, selectedAccount} = useAuthorization();
  const {connection} = useConnection();
  const setSnackbarProps = useContext(SnackbarContext);
  const [recordMessageTutorialOpen, setRecordMessageTutorialOpen] = useState(false);
  const [ownsNft, setOwnsNft] = useState(false);

  const guardedCallback = useGuardedCallback(
    async (): Promise<boolean> => {
      const signedTx = await transact(async wallet => {
        const [freshAccount, latestBlockhash] = await Promise.all([
          authorizeSession(wallet),
          connection.getLatestBlockhash(),
        ]);

        // const lePK = selectedAccount?.publicKey ?? freshAccount.publicKey
        // const res = await axios.get(
        //   `http://192.168.195.225:3000/api/hello?wallet=${lePK.toString()}`
        // )
        // const { encodedTx } = res.data
        // const tx = Transaction.from(bs58.decode(encodedTx))

        const tx = new Transaction({
          ...latestBlockhash,
          feePayer: selectedAccount?.publicKey ?? freshAccount.publicKey
        }).add(
          new TransactionInstruction({
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            keys: [],
            data: new TextEncoder().encode(mint.toString()) as Buffer,
          })
        )

        return (await wallet.signTransactions({
          transactions: [tx],
        }))[0];
      });

      const encodedTx = bs58.encode(signedTx.serialize())
      const res = await axios.post('http://192.168.195.225:3000/api/nft', {params: { encodedTx, mint: mint.toString() }})
      return res.data.success
    },
    [authorizeSession, connection, selectedAccount],
  );

  return (
    <>
      <View style={styles.buttonGroup}>
        <Button
          onPress={async () => {
            const result = await guardedCallback();
            setOwnsNft(result as boolean)
            setRecordMessageTutorialOpen(true)
          }}
          mode="contained"
          style={styles.actionButton}>
          My pinche bigbutton
        </Button>
      </View>

      <Portal>
        <Dialog
          visible={recordMessageTutorialOpen}
          onDismiss={() => {
            setRecordMessageTutorialOpen(false);
          }}>
          <Dialog.Content>
            <Paragraph>
              <Text>
                {ownsNft ? "CHECK" : "Bullshit"}
              </Text>
            </Paragraph>
            <Dialog.Actions>
              <Button
                onPress={() => {
                  setRecordMessageTutorialOpen(false);
                }}>
                Neat!
              </Button>
            </Dialog.Actions>
          </Dialog.Content>
        </Dialog>
      </Portal>
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
