/**
 * Copyright (C) 2019 Contributors as noted in the AUTHORS file
 *
 * This file is part of nem2-wallet-browserextension.
 *
 * nem2-wallet-browserextension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * nem2-wallet-browserextension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with nem2-wallet-browserextension.  If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-disable indent */
import { flatMap, toArray, map } from 'rxjs/operators';
import {
  MosaicService,
  AccountHttp,
  MosaicHttp,
  BlockchainHttp,
} from 'nem2-sdk';
import { formatMosaics, sortMosaics } from './formatMosaics';

const getMosaicsByAddress = async wallet => new Promise(async (resolve, reject) => {
    try {
      const { address } = wallet.isWatchOnly
        ? wallet.publicAccount : wallet.account;
      const endpoint = wallet.node;
      const mosaicService = new MosaicService(
        new AccountHttp(endpoint),
        new MosaicHttp(endpoint),
      );

      // @TODO: BlockHeight at a higher level, sync with the network
      const blockChainHttp = new BlockchainHttp(endpoint);
      const blockHeight = (await blockChainHttp
        .getBlockchainHeight()
        .toPromise()).compact();

      mosaicService
        .mosaicsAmountViewFromAddress(address)
        .pipe(
          flatMap(x => x),
          map(mosaic => formatMosaics(mosaic, blockHeight)),
          toArray(),
        )
        .subscribe(
          (x) => {
            if (x.length !== 0) {
              resolve(sortMosaics(x));
            } else {
              resolve([]);
            }
          },
          err => reject(err),
        );
    } catch (error) {
      reject(error);
    }
  });

export default getMosaicsByAddress;
