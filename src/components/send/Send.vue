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
  <v-layout
    row
    pb-2
    mt-4
  >
    <v-container
      fluid
      pa-0
      ma-0
    >
      <v-layout
        row
        wrap
      >
        <v-flex xs12>
          <Errors />
          <v-card
            v-if="wallet.wallets.length > 0
              && wallet.activeWallet"
            style="height: auto;padding:0 !important"
            class="card--flex-toolbar"
          >
            <v-toolbar
              card
              prominent
            />
            <v-card-text>
              <p class="mb-4 mt-4">
                Current Node:
                <a
                  :href="activeWallet.node"
                  target="_new"
                >{{ activeWallet.node }}</a>
                (Cow)
              </p>
              <v-flex xs12>
                <v-form lazy-validation>
                  <v-text-field
                    v-model="txRecipient"
                    placeholder="ex. SB2JNF-UZ4MQP-BBDEQ2-C4QW2U-56PPVK-KMAMDU-77IE"
                    required
                    solo
                    reverse
                  >
                    <template slot="append">
                      <v-subheader>Recipient</v-subheader>
                    </template>
                  </v-text-field>

                  <v-text-field
                    v-model="txAmount"
                    placeholder="ex. 10"
                    type="number"
                    reverse
                    solo
                  >
                    <template slot="append">
                      <v-subheader>Amount (Network Currency / XEM)</v-subheader>
                    </template>
                  </v-text-field>

                  <v-text-field
                    v-model="txMaxFee"
                    placeholder="ex. 10"
                    type="number"
                    reverse
                    solo
                  >
                    <template slot="append">
                      <v-subheader>Max Fee (Network Currency / XEM)</v-subheader>
                    </template>
                  </v-text-field>

                  <v-checkbox
                    v-model="checkbox"
                    label="Sending other assets?"
                  />
                  <v-flex
                    v-if="checkbox"
                    sm
                    class="ma-4"
                  >
                    <v-select
                      v-if="wallet.activeWallet && assets.assets[wallet.activeWallet.name].length>0"
                      v-model="currentMosaicName"
                      :items="assets.assets[wallet.activeWallet.name].map(({id})=>id)"
                      label="Chose an asset"
                      solo
                    />

                    <v-text-field
                      v-if="!wallet.activeWallet
                        || assets.assets[wallet.activeWallet.name].length===0"
                      v-model="currentMosaicName"
                      label="Enter a mosaic ID"
                      solo
                    />

                    <v-layout row>
                      <v-flex xs-11>
                        <v-text-field
                          v-model="currentMosaicAmount"
                          label="Asset Amount"
                          placeholder="ex. 10"
                          solo
                        />
                      </v-flex>

                      <v-flex xs-1>
                        <v-btn
                          :disabled="currentMosaicName === ''"
                          color="primary"
                          @click="addMosaic"
                        >
                          <v-icon>add</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-layout>
                    <template v-for="(mosaic, index) in mosaics">
                      <v-list
                        :key="index"
                        two-line
                      >
                        <v-list-tile v-if="!(mosaic.id.toHex() == '85bbea6cc462b244')">
                          <v-list-tile-action>
                            <v-icon>group_work</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-content>
                            {{ mosaic.id.toHex() }}
                            <v-subheader>
                              Amount: {{ mosaic.amount.compact() }}
                            </v-subheader>
                          </v-list-tile-content>
                          <v-btn
                            fab
                            small
                            color="error"
                            @click="removeMosaic(index)"
                          >
                            <v-icon>remove</v-icon>
                          </v-btn>
                        </v-list-tile>
                      </v-list>
                    </template>
                  </v-flex>
                  <v-spacer />

                  <v-text-field
                    v-model="txMessage"
                    placeholder="Here is your XEM, Bob! - Alice"
                    solo
                    reverse
                  >
                    <template slot="append">
                      <v-subheader>Message</v-subheader>
                    </template>
                  </v-text-field>

                  <v-text-field
                    v-model="userPrivateKey"
                    label=""
                    class="mt-3 mb-3"
                    :counter="64"
                    required
                    solo
                    reverse
                  >
                    <template slot="append">
                      <v-subheader>Private Key</v-subheader>
                    </template>

                    <template slot="prepend-inner">
                      <v-btn
                        v-if="userPrivateKey == ''"
                        small
                        color="primary"
                        @click="fillPrivateKeyField"
                      >
                        Use my wallet's private key
                      </v-btn>
                    </template>
                  </v-text-field>

                  <v-flex
                    v-if="txRecipient == '' || userPrivateKey == ''"
                    xs12
                  >
                    <v-alert
                      :value="true"
                      type="info"
                    >
                      A private key, recipient address, and amount&nbsp;
                      are required in order to send a transaction.
                    </v-alert>
                  </v-flex>
                </v-form>
              </v-flex>
              <v-card-actions>
                <v-btn
                  :disabled="txRecipient == '' || userPrivateKey == ''"
                  color="primary mx-0"
                  @click="dialog = true"
                >
                  Send
                </v-btn>
              </v-card-actions>
              <div class="mt-4">
                <SendConfirmation
                  :tx-hash="txHash"
                  :tx-recipient="txRecipient"
                  :node-u-r-l="activeWallet.node"
                />
              </div>

              <v-dialog
                v-model="dialog"
                max-width="500"
              >
                <v-card>
                  <v-card-title class="headline">
                    Send this transaction?
                  </v-card-title>
                  <v-card-text>
                    Are you sure you that you want to send a transaction with the following details?
                    <v-list>
                      <v-list-tile>
                        <v-list-tile-action>
                          <v-icon>person_outline</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          <v-list-tile-title>Recipient: {{ txRecipient }}</v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>

                      <v-list-tile>
                        <v-list-tile-action>
                          <v-icon>monetization_on</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          <v-list-tile-title>Amount: {{ txAmount }} XEM</v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>

                      <v-list-tile>
                        <v-list-tile-action>
                          <v-icon>message</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          <v-list-tile-title>Message: {{ txMessage }}</v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
                    <template v-for="(mosaic) in mosaics">
                      <v-list :key="mosaic.id.toHex()">
                        <v-list-tile v-if="!(mosaic.id.toHex() == '85bbea6cc462b244')">
                          <v-list-tile-action>
                            <v-icon>group_work</v-icon>
                          </v-list-tile-action>
                          <v-list-tile-content>
                            <v-list-tile-title>
                              Asset Attached: {{ mosaic.id.toHex() }}
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
                    </template>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer />

                    <v-btn
                      color="info"
                      @click="dialog = false"
                    >
                      Cancel
                    </v-btn>

                    <v-btn
                      color="info"
                      @click="transmitTransaction"
                    >
                      Yes, send it!
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout
        row
        wrap
        style="margin-top: 30px !important;"
      >
        <v-flex
          xs12
        >
          <v-card
            v-if="wallet.wallets.length > 0
              && wallet.activeWallet
              && !application.error"
          >
            <v-toolbar
              card
              prominent
            >
              <v-toolbar-title>My assets</v-toolbar-title>
            </v-toolbar>
            <v-spacer />
            <v-card-text>
              <AssetList class="my-2" />
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-layout>
</template>

<script>
import {
  NetworkType,
  Account,
  TransferTransaction,
  Deadline,
  Address,
  PlainMessage,
  NetworkCurrencyMosaic,
  UInt64,
  TransactionHttp,
  MosaicId,
  Mosaic,
} from 'nem2-sdk';
import { mapState } from 'vuex';
import store from '../../store/index';
import SendConfirmation from './SendConfirmation.vue';
import Errors from '../Errors.vue';
import AssetList from '../asset/AssetList.vue';

export default {
  components: {
    SendConfirmation,
    Errors,
    AssetList,
  },
  store,
  data() {
    return {
      txMessage: '',
      txAmount: 0,
      txMaxFee: 0,
      txRecipient: '',
      userPrivateKey: '',
      signedTx: null,
      transferTx: null,
      dialog: false,
      checkbox: false,
      mosaics: [],
      currentMosaicName: '',
      currentMosaicAmount: '',
      txHash: '',
    };
  },
  computed: {
    ...mapState([
      'wallet',
      'application',
      'assets',
    ]),
    activeWallet() {
      return this.$store.getters['wallet/GET_ACTIVE_WALLET'];
    },
    transactionHttp() {
      return new TransactionHttp(this.activeWallet.node);
    },
  },
  methods: {
    createTransferTransaction() {
      const recipientAddr = Address.createFromRawAddress(this.txRecipient);
      const nativeCurrency = NetworkCurrencyMosaic.createRelative(
        UInt64.fromUint(this.txAmount),
      );

      if (this.txAmount > 0) {
        this.mosaics.unshift(nativeCurrency);
      }

      this.transferTx = TransferTransaction.create(
        Deadline.create(),
        recipientAddr,
        this.mosaics,
        PlainMessage.create(this.txMessage),
        NetworkType.MIJIN_TEST,
        UInt64.fromUint(this.txMaxFee),
      );
    },

    transmitTransaction() {
      this.createTransferTransaction();

      const signerAccount = Account.createFromPrivateKey(
        this.userPrivateKey,
        NetworkType.MIJIN_TEST,
      );

      if (this.transferTx) {
        this.signedTx = signerAccount.sign(this.transferTx);
        this.dialog = false;
        if (this.signedTx) {
          this.transactionHttp.announce(this.signedTx).subscribe(
            (txAnnouncmentResponse) => {
              if (
                txAnnouncmentResponse.message
                === 'packet 9 was pushed to the network via /transaction'
              ) {
                this.txHash = this.signedTx.hash;
                this.mosaics = [];
              }
            },
            // eslint-disable-next-line no-console
            err => console.log(err),
          );
        }
      }
    },

    addMosaic() {
      const mosaicHex = this.currentMosaicName.toUpperCase();
      const mosaic = new Mosaic(
        new MosaicId(mosaicHex),
        UInt64.fromUint(this.currentMosaicAmount),
      );
      this.mosaics.push(mosaic);
    },

    removeMosaic(index) {
      this.mosaics.splice(index, 1);
    },

    fillPrivateKeyField() {
      this.userPrivateKey = this.activeWallet.account.privateKey;
    },
  },
};
</script>
