import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Appbar, Divider, Portal, Text} from 'react-native-paper';

import AccountInfo from '../components/AccountInfo';
import MintTokenButton from '../components/MintTokenButton';
import NFTGrid from '../components/NFTGrid';
import useAuthorization from '../utils/useAuthorization';

export default function MainScreen() {
  const {accounts, onChangeAccount, selectedAccount} = useAuthorization();

  return (
    <>
      <Appbar.Header elevated mode="center-aligned">
        <Appbar.Content title="React Native dApp" />
      </Appbar.Header>
      <Portal.Host>
        <ScrollView contentContainerStyle={styles.container}>

          <Text variant="bodyLarge">
            Welcome to my awesome candy machine
          </Text>
          <Divider style={styles.spacer} />
          <MintTokenButton />
          <Divider style={styles.spacer} />
          <NFTGrid />

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
