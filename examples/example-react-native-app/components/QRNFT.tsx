import React, { useContext, useState } from 'react';
import { Image, Linking, StyleSheet, TouchableHighlight, View } from 'react-native';
import { Button, Dialog, Paragraph, Portal, Text } from 'react-native-paper';
// import { TextEncoder } from 'text-encoding';
import QRCode from 'react-native-qrcode-svg';
import { INFT } from './NFTGrid';

import useAuthorization from '../utils/useAuthorization';
import useGuardedCallback from '../utils/useGuardedCallback';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { fromUint8Array, toUint8Array } from 'js-base64';

// import { SnackbarContext } from './SnackbarProvider';


type Props = Readonly<{
  children?: React.ReactNode;
  nft: INFT,
}>;

export default function QRNFT({ children, nft }: Props) {
  const { authorizeSession, selectedAccount } = useAuthorization();

  const [showDialog, setShowDialog] = useState(false);
  const [qrString, setQrString] = useState('');

  const generateQrString = useGuardedCallback(
    async (): Promise<string> => {
      const [signature, message] = await transact(async (wallet): Promise<[string, string]> => {

        const freshAccount = await authorizeSession(wallet);
        const lePK = selectedAccount?.publicKey ?? freshAccount.publicKey
        const message = `${lePK.toString()}:${nft.mint}`

        const [signature] = await wallet.signMessages({
          addresses: [selectedAccount?.address ?? freshAccount.address],
          payloads: [toUint8Array(message)],
        })
        return [fromUint8Array(signature.slice(-64)), message]
      });

      return `${signature}:${message}`
    },
    [authorizeSession, selectedAccount],
  );

  return (
    <>
      <View style={styles.nftContainer}>
        <TouchableHighlight
          onPress={async () => {
            const generatedQrString = await generateQrString()
            if (generatedQrString) {
              setQrString(generatedQrString as string)
              setShowDialog(true)
            }
          }}
          style={{ borderRadius: 10 }}
        >
          <Image
            style={styles.nft_image}
            source={{ uri: nft.image }}
          />
        </TouchableHighlight>
      </View>

      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
        >
          <Dialog.Content style={{ height: 400 }}>
            <QRCode value={qrString} size={290} quietZone={10} />
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
