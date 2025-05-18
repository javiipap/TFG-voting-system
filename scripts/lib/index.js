const nativeBinding = require('./server_utilities.linux-x64-gnu.node');
if (!nativeBinding) {
  throw Error("Couldn't load binary lib");
}

const {
  encryptVote,
  generateElgamalKeypair,
  verifyVote,
  decryptResult,
  eccEncrypt,
  eccDecrypt,
  generateRsaKeypair,
  sign,
  verify,
} = nativeBinding;

module.exports.encryptVote = encryptVote;
module.exports.generateElgamalKeypair = generateElgamalKeypair;
module.exports.verifyVote = verifyVote;
module.exports.decryptResult = decryptResult;
module.exports.eccEncrypt = eccEncrypt;
module.exports.eccDecrypt = eccDecrypt;
module.exports.generateRsaKeypair = generateRsaKeypair;
module.exports.sign = sign;
module.exports.verify = verify;
