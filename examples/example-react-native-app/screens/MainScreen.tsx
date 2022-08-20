import React, {useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Appbar, Divider, Portal, Text, TextInput} from 'react-native-paper';

import AccountInfo from '../components/AccountInfo';
import VerifyNFTOwnershipButton from '../components/VerifyNFTOwnershipButton';
import RecordMessageButton from '../components/RecordMessageButton';
import SignMessageButton from '../components/SignMessageButton';
import useAuthorization from '../utils/useAuthorization';
import { PublicKey } from '@solana/web3.js';

import QRNFT from '../components/QRNFT';

const mints = [
  'D4m5hGUs95bA6FCw1CqRRY3cMEkN6MLiSyyfiieJSgtj',
  '6UkPUUDVyEp7bVa6XnubdgMcQ9fPGV2kj8x4H113MvBu',
].map(m => new PublicKey(m))

export default function MainScreen() {
  const {accounts, onChangeAccount, selectedAccount} = useAuthorization();
  const [memoText, setMemoText] = useState('');
  return (
    <>
      <Appbar.Header elevated mode="center-aligned">
        <Appbar.Content title="React Native dApp" />
      </Appbar.Header>
      <Portal.Host>
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant="bodyLarge">
            Tap the NFT you wanna use as ticket
          </Text>
          {/* <Divider style={styles.spacer} /> */}
          {/* <TextInput
            label="What's on your mind?"
            onChangeText={text => {
              setMemoText(text);
            }}
            style={styles.textInput}
            value={memoText}
          /> */}
          {/* <Divider style={styles.spacer} /> */}
          {/* <RecordMessageButton message={memoText}>
            Record Message
          </RecordMessageButton> */}
          {/* <Divider style={styles.spacer} /> */}
          {/* <SignMessageButton message={memoText}>Sign Message</SignMessageButton> */}

          {/* <Divider style={styles.spacer} /> */}
          {/* <VerifyNFTOwnershipButton mint={new PublicKey(0)} /> */}

          {mints.map((mint: PublicKey, idx: number) => <QRNFT key={idx} mint={mint} />)}

        </ScrollView>
        {accounts && selectedAccount ? (
          <AccountInfo
            accounts={accounts}
            onChange={onChangeAccount}
            selectedAccount={selectedAccount}
          />
        ) : null}
      </Portal.Host>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  shell: {
    height: '100%',
  },
  spacer: {
    marginVertical: 16,
    width: '100%',
  },
  textInput: {
    width: '100%',
  },
});
