<template>
<v-layout column>
    <v-flex xs12>
      <h5 class="headline mb-4">Send A Transfer Transaction</h5>
    </v-flex>
    <p class="mb-4">
        Current Node: 
        <a :href="nodeURL">{{ nodeURL }}</a>
        (Cow)
    </p>
    <v-flex xs12>
    <v-form lazy-validation>
    <v-text-field
        placeholder="ex. SB2JNF-UZ4MQP-BBDEQ2-C4QW2U-56PPVK-KMAMDU-77IE"
        required
        v-model="txRecipient" 
        solo
        reverse>
        <template slot="append">
          <v-subheader>Recipient</v-subheader>
        </template>
        </v-text-field>

        <v-text-field
        placeholder="ex. 10"
        type="number"
        v-model="txAmount" 
        reverse
        solo>
        <template slot="append">
          <v-subheader>Amount (Network Currency / XEM)</v-subheader>
        </template>
        </v-text-field>

         <v-checkbox
       v-model="checkbox"
       label="Sending other assets?">   
      </v-checkbox>
        <v-flex sm class="ma-4" v-if="checkbox">
         <v-text-field
        label="Attach Mosaic Hex"
        placeholder="Mosaic ID Here"
        v-model="currentMosaicName" solo>
        <template slot="append">
             <v-btn :disabled="currentMosaicName == ''" @click="addMosaic" fab small color="primary">
               <v-icon>add</v-icon>
             </v-btn>
        </template>
        </v-text-field>

        <v-text-field
        label="Asset Amount"
        placeholder="ex. 10"
        v-model="currentMosaicAmount" solo>
        </v-text-field>

        <template v-for="(mosaic, index) in mosaics">
          <v-list two-line :key="index">
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
              <v-btn @click="removeMosaic(index)" fab small color="error">
               <v-icon>remove</v-icon>
             </v-btn>
          </v-list-tile>
        </v-list>
        </template>
        </v-flex>
      <v-spacer />

         <v-text-field
        placeholder="Here is your XEM, Bob! - Alice"
        v-model="txMessage" solo reverse>
        <template slot="append">
          <v-subheader>Message</v-subheader>
        </template>
      </v-text-field>

        <v-text-field
        label=""
        class="mt-3 mb-3"
        :counter="64"
        required
        v-model="userPrivateKey" solo reverse>
        <template slot="append">
          <v-subheader>Private Key</v-subheader>
        </template>
        
        <template slot="prepend-inner">
          <v-btn v-if="userPrivateKey == ''" small color="primary" @click="fillPrivateKeyField">
               Use my wallet's private key
             </v-btn>
        </template> 
        </v-text-field>

     <v-flex xs12 v-if="txRecipient == '' || userPrivateKey == ''">
      <v-alert :value="true" type="info">
        A private key, recipient address, and amount is required in order to send a transaction.
      </v-alert>
    </v-flex>

    </v-form>
    </v-flex>
    <v-card-actions>
      <v-btn 
        v-on:click="dialog = true"
        :disabled="txRecipient == '' || userPrivateKey == ''"
        color="primary mx-0">Send</v-btn>
    </v-card-actions>
<div class="mt-4">
  <SendConfirmation :txHash="txHash" :txRecipient="txRecipient" :nodeURL="nodeURL" />
</div>

<v-dialog
      v-model="dialog"
      max-width="500">
      <v-card>
        <v-card-title class="headline">Send this transaction?</v-card-title>
        <v-card-text>
          Are you sure you want to send the the transaction with the following details?
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
          <v-spacer></v-spacer>

          <v-btn
            color="info"
            @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn
            color="info"
            @click="transmitTransaction">
            Yes, send it!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  Mosaic
} from "nem2-sdk";

import SendConfirmation from "./SendConfirmation.vue";
import StateRespository from "../../infrastructure/StateRepository.js";

export default {
  components: {
    SendConfirmation
  },

  data: function() {
    return {
      sharedState: StateRespository.state,
      txMessage: "",
      txAmount: 0,
      txRecipient: "",
      userPrivateKey: "",
      signedTx: null,
      transferTx: null,
      dialog: false,
      checkbox: false,
      mosaics: [],
      currentMosaicName: "",
      currentMosaicAmount: "",
      nodeURL: StateRespository.state.activeWallet.node,
      transactionHttp: new TransactionHttp(
        StateRespository.state.activeWallet.node
      ),
      txHash: "",
      noWallets: StateRespository.wallets().length == 0
    };
  },
  methods: {
    createTransferTransaction: function() {
      const recipientAddr = Address.createFromRawAddress(this.txRecipient);
      const nativeCurrency = NetworkCurrencyMosaic.createRelative(
        UInt64.fromUint(this.txAmount)
      );

      if (this.txAmount > 0) {
        this.mosaics.unshift(nativeCurrency);
      }

      this.transferTx = TransferTransaction.create(
        Deadline.create(),
        recipientAddr,
        this.mosaics,
        PlainMessage.create(this.txMessage),
        NetworkType.MIJIN_TEST
      );
    },

    transmitTransaction: function() {
      this.createTransferTransaction();

      const signerAccount = Account.createFromPrivateKey(
        this.userPrivateKey,
        NetworkType.MIJIN_TEST
      );

      if (this.transferTx) {
        this.signedTx = signerAccount.sign(this.transferTx);
        this.dialog = false;
        if (this.signedTx) {
          this.transactionHttp.announce(this.signedTx).subscribe(
            txAnnouncmentResponse => {
              if (
                txAnnouncmentResponse.message ==
                "packet 9 was pushed to the network via /transaction"
              ) {
                this.txHash = this.signedTx.hash;
                this.mosaics = [];
              }
            },
            err => console.log(err)
          );
        }
      }
    },

    addMosaic: function() {
      const mosaicHex = this.currentMosaicName.toUpperCase();
      const mosaic = new Mosaic(
        new MosaicId(mosaicHex),
        UInt64.fromUint(this.currentMosaicAmount)
      );
      this.mosaics.push(mosaic);
    },

    removeMosaic: function(index) {
      this.mosaics.splice(index, 1);
    },

    fillPrivateKeyField: function() {
      this.userPrivateKey = this.getActiveWallet.privateKey;
    }
  },

  computed: {
    getActiveWallet: function() {
      return this.sharedState.activeWallet.account;
    }
  }
};
</script>
<style scoped>
</style>