/*!
 * Crypto-JS v1.1.0
 * http://code.google.com/p/crypto-js/
 * Copyright (c) 2009, Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */

import { util } from "@/utils/uploadFilesOss/crypto";

// Shortcut
export default function (hasher: any, message: string, key: any, options: any) {
  // Allow arbitrary length keys
  key =
    key.length > hasher._blocksize * 4
      ? hasher(key, { asBytes: true })
      : util.stringToBytes(key);
  // XOR keys with pad constants
  let okey = key,
    ikey = key.slice(0);
  for (let i = 0; i < hasher._blocksize * 4; i++) {
    okey[i] ^= 0x5c;
    ikey[i] ^= 0x36;
  }
  let hmacbytes = hasher(
    util.bytesToString(okey) +
      hasher(util.bytesToString(ikey) + message, { asString: true }),
    { asBytes: true }
  );
  return options && options.asBytes
    ? hmacbytes
    : options && options.asString
    ? util.bytesToString(hmacbytes)
    : util.bytesToHex(hmacbytes);
}
