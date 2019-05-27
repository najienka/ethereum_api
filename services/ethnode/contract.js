const config = require('../../config')
const Tx = require('ethereumjs-tx')

module.exports = function (web3) {
  var module = {}

  /**
   * Returns the ABI of a given Contract name
   * @param {string} contractName Name of the Contract to look up in configuration files
   */
  module.getContractAbi = function (contractName) {
    var contractAbi
    try {
      var abiPath = config.contract[contractName].abi_file
      abiPath = '../../' + abiPath
      contractAbi = require(abiPath)
    } catch (err) {
      console.log('Contact ABI load error.')
      console.log(err)
      throw err
    }
    return contractAbi.abi
  }

  /**
   * Call a Contract method
   * @param {string} contractName Name of the Contract
   * @param {stirng} contractAddress Address of the Contract
   * @param {string} method Method to call
   * @param {array} args Arguments of the method to be called
   */
  module.call = async function (contractName, contractAddress, callerAddress, method, args) {
    var promise = new Promise((resolve, reject) => {
      //var result = {}
      var contractAbi = module.getContractAbi(contractName)
      try {
        var contractInstance = new web3.eth.Contract(contractAbi, contractAddress)
        // call view function
        contractInstance.methods[method].apply(this, Object.values(args)).call({from: callerAddress}, (error, result) => {
          if(error){
            return reject(error);
          } else {
            return resolve({ value: result })
          }
        })

      } catch (err) {
        console.log('Contract call error.')
        console.log(err)
        return reject(err)
      }
    })
    return promise
  }


  module.getEvent = function (contractName, contractAddress, from_block) {
    var promise = new Promise((resolve, reject) => {
      var result = {}
      //using another async function in the same module
      var contractAbi = module.getContractAbi(contractName) 
      try {
        // var Contract = new web3.eth.contract(contractAbi, contractAddress)
        // initiate contract for an address
        var contractInstance = new web3.eth.Contract(contractAbi, contractAddress)

        /* contractInstance.getPastEvents('allEvents', {
          fromBlock: 0,
          toBlock: 'latest'
      }, function(error, events){ console.log(events); })
      .then(function(events){
          console.log(events) // same results as the optional callback above
      }); */
      
        contractInstance.getPastEvents('allEvents', {
          fromBlock: from_block,
          toBlock: 'latest',
        }, (error, events) => {
          if (events && Array.isArray(events) && events.length) {
            const result = {
              contract: {
                name: contractName,
                address: contractAddress,
              },
              from_block: from_block,
              last_block: events[events.length - 1].blockNumber,
              events,
            };
            return resolve(result);
          } else {
            const result = {
              contract: {
                name: contractName,
                address: contractAddress,
              },
              from_block: from_block,
              last_block: from_block,
              events: [],
            };
            return resolve(result);
          }
        });
      } catch (err) {
        console.log('Contract call error.')
        console.log(err)
        return reject(err)
      }
    })
    return promise
    
  }

  /**
   * Transact with a Contract (broadcasted and impacted in the blockchain)
   * @param {string} contractName Name of the Contract
   * @param {string} contractAddress Address of the Contract
   * @param {string} method Method to call for the transaction
   * @param {string} callerAddress Address of the caller of the transaction
   * @param {string} privateKey Private key of the caller of the transaction, corresponding to the callerAddress
   * @param {array} args Arguments of the method to be called
   */
  module.transact = async function (contractName, contractAddress, method, callerAddress, privateKey, args) {
    var promise = new Promise((resolve, reject) => {
      var result = {} // result inside promise in async function

      try {
        var contractAbi = module.getContractAbi(contractName)

        var contractInstance = new web3.eth.Contract(contractAbi, contractAddress)
        // get the reference to the contract method, with the corresponding parameters
        const contractFunction = contractInstance.methods[method].apply(this, Object.values(args)).encodeABI();
        var privateKeyBuff = Buffer.from(privateKey, 'hex')

        // get the current gas price, either from config or from the node
        var gasPrice = config.eth.gas_price
        if (gasPrice === 'auto') {
          gasPrice = web3.eth.gasPrice
        }

        // get the gas limit from the config (if exists). Otherwise leave "auto"
        var gasLimit = 'auto'
        if (config.eth.gas_limit !== 'auto') {
          // gasLimit = new BigNumber(config.eth.gas_limit);
          gasLimit = web3.utils.toHex(config.eth.gas_limit)
        }

        // prepare the Tx parameters
        var rawTx = {
          //nonce: web3.utils.toHex(web3.eth.getTransactionCount(callerAddress, 'pending')),
          nonce: web3.utils.toHex(2),
          from: callerAddress,
          to: contractAddress,
          gasPrice: gasPrice.toString(10),
          gasLimit: gasLimit, // default gas limit to send ether
          chainId: config.eth.chain_id,
          data: contractFunction
        }
        // create the Tx
        var tx = new Tx(rawTx)
        // estimate the fees required for the Tx
        if (gasLimit === 'auto') {
          console.log('Auto calculating gas limit...')
          //var block = web3.eth.getBlock("latest");
          gasLimit = web3.utils.toHex(41000)
          console.log('Estimated gas: ' + gasLimit)
          //console.log('Estimated gas: ' + block.gasLimit)
          //tx.gasLimit = block.gasLimit
          tx.gasLimit = gasLimit
        }
        // sign the transaction
        tx.sign(privateKeyBuff)
        var serializedTx = tx.serialize()
        var raw = '0x' + serializedTx.toString('hex')
      } catch (err) {
        console.log('Error preparing the Contract transact Tx.')
        console.log(err)
        return reject(err)
      }

      try {
        // send the signed serialized transaction to the node
        web3.eth.sendSignedTransaction(raw, (err, txHash) => {
          if (err) {
            return reject(err)
          } else {
            result.tx_hash = txHash
            return resolve(result)
          }
        })
      } catch (err) {
        console.log('Contract transact error.')
        console.log(err)
        return reject(err)
      }
    })

    return promise
  }

  return module
}