// import axios from 'axios'
// import bs58 from 'bs58'
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import { useConnection } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  // RpcResponseAndContext,
  // SignatureResult,
  // Transaction,
  // TransactionInstruction,
} from '@solana/web3.js';
// import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import React, { useContext, useState } from 'react';
import { Image, Linking, StyleSheet, TouchableHighlight, View } from 'react-native';
import { Button, Dialog, Paragraph, Portal, Text } from 'react-native-paper';
// import { TextEncoder } from 'text-encoding';
import QRCode from 'react-native-qrcode-svg';

// import useAuthorization from '../utils/useAuthorization';
// import useGuardedCallback from '../utils/useGuardedCallback';
// import { SnackbarContext } from './SnackbarProvider';


type Props = Readonly<{
  children?: React.ReactNode;
  mint: PublicKey,
}>;

export default function QRNFT({ children, mint }: Props) {
  // const { authorizeSession, selectedAccount } = useAuthorization();
  // const { connection } = useConnection();
  // const setSnackbarProps = useContext(SnackbarContext);
  const [showDialog, setShowDialog] = useState(false);
  // const [qrImage, setQrImage] = useState('');

  // const guardedCallback = useGuardedCallback(
  //   async (): Promise<boolean> => {
  //     const signedTx = await transact(async wallet => {
  //       const [freshAccount, latestBlockhash] = await Promise.all([
  //         authorizeSession(wallet),
  //         connection.getLatestBlockhash(),
  //       ]);

  //       // const lePK = selectedAccount?.publicKey ?? freshAccount.publicKey
  //       // const res = await axios.get(
  //       //   `http://192.168.195.225:3000/api/hello?wallet=${lePK.toString()}`
  //       // )
  //       // const { encodedTx } = res.data
  //       // const tx = Transaction.from(bs58.decode(encodedTx))

  //       const tx = new Transaction({
  //         ...latestBlockhash,
  //         feePayer: selectedAccount?.publicKey ?? freshAccount.publicKey
  //       }).add(
  //         new TransactionInstruction({
  //           programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
  //           keys: [],
  //           data: new TextEncoder().encode(mint.toString()) as Buffer,
  //         })
  //       )

  //       return (await wallet.signTransactions({
  //         transactions: [tx],
  //       }))[0];
  //     });

  //     const encodedTx = bs58.encode(signedTx.serialize())
  //     const res = await axios.post('http://192.168.195.225:3000/api/nft', { params: { encodedTx, mint: mint.toString() } })
  //     return res.data.success
  //   },
  //   [authorizeSession, connection, selectedAccount],
  // );

  return (
    <>
      <View style={styles.nftContainer}>
        <TouchableHighlight
          onPress={async () => {
            // TODO: generate QR
            // setQrImage('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png')
            setShowDialog(true)
          }}
          style={{ borderRadius: 10 }}
        >
          <Image
            style={styles.nft_image}
            source={{
              uri: 'https://arweave.net/WK2BBHga5vjvllMuosAPJBFRm1xdS6SAxqmi2_atj7M?ext=png',
            }}
          />
        </TouchableHighlight>
      </View>

      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
        >
          <Dialog.Content>
            <QRCode value={mint.toString()} size={280} />
            <Dialog.Actions>
              <Button onPress={() => setShowDialog(false)}>
                Close
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
  nftContainer: {
    width: '50%',
    padding: 5,
  },
  nft_image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
  },
});
