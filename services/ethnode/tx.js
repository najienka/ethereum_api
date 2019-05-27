const config = require('../../config')
const Tx = require('ethereumjs-tx')

module.exports = function (web3) {
  var module = {}

  module.get = async function (txhash) {
    var promise = new Promise((resolve, reject) => {
/* 
      if (!serializedTx.startsWith('0x')) {
        serializedTx = '0x' + serializedTx
      }
 */
      web3.eth.getTransaction(txhash, (err, result) => {
        if (err) {
          return reject(err)
        } else {
          return resolve(result)
        }
      })
    })
    return promise
  }

  module.getTransactionReceipt = async function (txhash) {
    var promise = new Promise((resolve, reject) => {
      /* 
            if (!serializedTx.startsWith('0x')) {
              serializedTx = '0x' + serializedTx
            }
       */
            web3.eth.getTransactionReceipt(txhash, (err, result) => {
              if (err) {
                return reject(err)
              } else {
                return resolve(result)
              }
            })
          })
          return promise
  }

  module.getLastBlock = async function () {
    var promise = new Promise((resolve, reject) => {
      /* 
            if (!serializedTx.startsWith('0x')) {
              serializedTx = '0x' + serializedTx
            }
       */
            web3.eth.getBlock("latest", (err, result) => {
              if (err) {
                return reject(err)
              } else {
                return resolve(result)
              }
            })
          })
          return promise
  }

  module.getBlock = async function (blockNumber) {

    var promise = new Promise((resolve, reject) => {
      /* 
            if (!serializedTx.startsWith('0x')) {
              serializedTx = '0x' + serializedTx
            }
       */
            web3.eth.getBlock(blockNumber, (err, result) => {
              if (err) {
                return reject(err)
              } else {
                return resolve(result)
              }
            })
          })
          return promise
  }

  module.getGasLimit = async function () {
    var promise = new Promise((resolve, reject) => {
      /* 
            if (!serializedTx.startsWith('0x')) {
              serializedTx = '0x' + serializedTx
            }
       */
            web3.eth.getBlock("latest", (err, result) => {
              if (err) {
                return reject(err)
              } else {
                return resolve(result.gasLimit)
              }
            })
          })
          return promise
  }
  
 
  /**
   * Send ether (wei) from an account to another
   * @param {string} from Address of the sender
   * @param {string} fromKey Private key of the caller of the transaction, corresponding to the from
   * @param {string} to Address of the recipient
   * @param {string} wei Ether to be sent, in wei
   * @param {string} gasPrice Gas price for the Tx
   */
  module.send = async function (from, fromKey, to, wei, gasPrice, gasLimit) {
    var promise = new Promise((resolve, reject) => {
      var result = {}

      var privateKey = Buffer.from(fromKey, 'hex')

      // get the current gas price, either from config or from the node
      if (typeof gasPrice === 'undefined' || gasPrice == null) {
        gasPrice = config.eth.gas_price
      }
      if (gasPrice === 'auto') {
        gasPrice = web3.eth.gasPrice
        gasPrice = gasPrice.toString(10)
      }

      // get the gas limit from the config (if exists). Otherwise leave "auto"
      if (typeof gasLimit === 'undefined' || gasLimit == null) {
        gasLimit = config.eth.gas_limit
      }
      if (gasLimit !== 'auto') {
        gasLimit = web3.utils.toHex(config.eth.gas_limit)
      }

      // calculate nonce
      //var nonce = web3.utils.toHex(web3.eth.getTransactionCount(from, 'pending')),

      // prepare the Tx parameters
      var rawTx = {
        nonce: web3.utils.toHex(3),
        from: from,
        to: to,
        value: web3.utils.toHex(wei), // .toString(10),
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: gasLimit,
        chainId: config.eth.chain_id
      }

      // create and sign the Tx
      var tx = new Tx(rawTx)
      // see the fees required for the Tx
      if (gasLimit === 'auto') {
        //console.log('Auto calculating gas limit...')
        //gasLimit = web3.eth.estimateGas(rawTx)
        //console.log('Estimated gas: ' + gasLimit)
        //tx.gasLimit = web3.utils.toHex(gasLimit)

        console.log('Auto calculating gas limit...')
          //var block = web3.eth.getBlock("latest");
          gasLimit = web3.utils.toHex(41000)
          console.log('Estimated gas: ' + gasLimit)
          //console.log('Estimated gas: ' + block.gasLimit)
          //tx.gasLimit = block.gasLimit
          tx.gasLimit = gasLimit
      }
      tx.sign(privateKey)

      var serializedTx = tx.serialize()

      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, txHash) => {
        if (err) {
          return reject(err)
        } else {
          result.tx_hash = txHash
          return resolve(result)
        }
      })
    })

    return promise
  }

  /**
   * Send a Transaction, passed in serialized and signed
   * @param {string} serializedTx Tx serialized in HEX format
   */
  module.sendRaw = async function (serializedTx) {
    var promise = new Promise((resolve, reject) => {
      var result = {}

      if (!serializedTx.startsWith('0x')) {
        serializedTx = '0x' + serializedTx
      }

      web3.eth.sendRawTransaction(serializedTx, (err, txHash) => {
        if (err) {
          return reject(err)
        } else {
          result.tx_hash = txHash
          return resolve(result)
        }
      })
    })

    return promise
  }

  return module
}
