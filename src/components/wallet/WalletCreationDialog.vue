// Copyright (C) 2019 Contributors as noted in the AUTHORS file
//
// This file is part of nem2-wallet-browserextension.
//
// nem2-wallet-browserextension is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// nem2-wallet-browserextension is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with nem2-wallet-browserextension.  If not, see http://www.gnu.org/licenses/.

<template>
  <v-dialog
    v-model="show"
    max-width="680px"
  >
    <v-card>
      <v-toolbar card>
        <v-card-title primary-title>
          <h3 class="headline mb-3">
            Generate a new wallet
          </h3>
        </v-card-title>
        <v-spacer />
        <v-btn
          icon
          @click.stop="regenerateAccount()"
        >
          <v-icon>refresh</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text />
      <v-card-text>
        <v-text-field
          v-model="node"
          class="ma-0 pa-0"
          label="NEM2 node URL"
        />

        <v-text-field
          v-model="walletName"
          class="ma-0 pa-0"
          label="Wallet name"
        />

        <v-divider class="mt-4" />

        <v-text-field
          :value="account ? account.address.pretty() : ''"
          class="mt-4 pt-4 monospaced"
          label="Main wallet"
          readonly
        />

        <v-text-field
          :value="account ? account.publicKey : ''"
          class="ma-0 pa-0 monospaced"
          label="Main wallet"
          readonly
        />

        <v-text-field
          :value="account ? account.privateKey : ''"
          class="ma-0 pa-0 monospaced"
          label="Main wallet"
          readonly
        />

      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          flat
          @click.stop="$emit('close')"
        >
          close
        </v-btn>
        <v-btn
          :disabled="node == '' || walletName == ''"
          color="primary mx-0"
          @click="save"
        >
          Create Wallet
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { NetworkType, Account } from 'nem2-sdk';

import store from '../../store/index';


export default {
  name: 'WalletCreationDialog',
  store,

  props: {
    visible: Boolean,
  },
  data: () => ({
    account: Account.generateNewAccount(NetworkType.MIJIN_TEST),
    node: '',
    walletName: '',
  }),

  computed: {
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit('close');
        }
      },
    },
  },
  methods: {
    regenerateAccount() {
      this.account = Account.generateNewAccount(NetworkType.MIJIN_TEST);
    },
    save() {
      const newWallet = {
        name: this.walletName,
        account: this.account,
        node: this.node,
      };
      this.$store.dispatch('wallet/ADD_WALLET', newWallet);
    },
  },
};
</script>
