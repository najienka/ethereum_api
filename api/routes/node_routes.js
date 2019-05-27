module.exports = function (app, web3) {
  const generalSrv = require('../../services/ethnode/general')(web3)
  const addressSrv = require('../../services/ethnode/address')(web3)
  const txSrv = require('../../services/ethnode/tx')(web3)
  const contractSrv = require('../../services/ethnode/contract')(web3)

  // general
  app.get('/node/status', (req, res) => {
    // get the geth node or ethereum blockchain client status
    // curl http://localhost:3000/node/status
    generalSrv.getStatus()
      .then(function (output) {
        var response = {
          data: {
            result: output
          }
        }
        res.send(response)
      }, function (err) {
        res.send({ error: err.message })
      })
  })

  app.get('/node/event/:contractName/:address/:fromBlock', (req, res) => {
    var contract_name = req.params.contractName;
    var address = req.params.address;
    var from_block = req.params.fromBlock;


    contractSrv.getEvent(contract_name, address, from_block)
      .then(function (result) {
        var response = {
          data: {
            contract: contract_name,
            address: address,
            result: result
          }
        }
        res.send(response)
      }, function (err) {
        res.send({ error: err.message })
      })
  })

  app.get('/node/gasLimit', (req, res) => {

    txSrv.getGasLimit()
      .then(function (txResult) {
        res.send({ data: txResult })
      }, function (err) {
        res.send({ error: err })
      })
  })

  app.get('/node/latestBlock', (req, res) => {

    txSrv.getLastBlock()
      .then(function (latestBlock) {
        res.send({ data: latestBlock })
      }, function (err) {
        res.send({ error: err })
      })

  })

  app.get('/node/block/:blockNumber', (req, res) => {
    var blockNumber = req.params.blockNumber

    txSrv.getBlock(blockNumber)
      .then(function (block) {
        res.send({ data: block })
      }, function (err) {
        res.send({ error: err })
      })
  })

  // address
  app.get('/node/address/:address/balance', (req, res) => {
    // get the ether balance of an address
    // curl http://localhost:3000/node/address/0x5dde6118d4b7a810e388e3926e77e5039765acf2/balance
    var address = req.params.address

    addressSrv.getBalance(address)
      .then(function (result) {
        res.send({
          data:
            { balance: result.value }
        })
      }, function (err) {
        res.send({ error: err })
      })
  })

  // transactions
  app.get('/node/tx/:txhash', (req, res) => {
    // get the details/properties of a transaction hash 
    // i.e., hash, nonce, blockHash, blockNumber, transactionIndex, from, to, value, gas, gasPrice, input
    // e.g., https://medium.com/blockchannel/life-cycle-of-an-ethereum-transaction-e5c66bae0f6e
    // curl http://localhost:3000/node/tx/0x04ac096854ef6184c2de252ef24bad264429b72535f2283d8012dea6f6288c40
    var txhash = req.params.txhash
    txSrv.get(txhash)
      .then(function (txResult) {
        res.send({ data: txResult })
      }, function (err) {
        res.send({ error: err })
      })

  })

  app.get('/node/tx/receipt/:txhash', (req, res) => {
    // get a transaction receipt with the hash
    // e.g., curl http://localhost:3000/node/tx/receipt/0x86b1f328eb5e79fe3ebaa6a42f8931d99b0182683287893a70460fcd8894fc88
    var txhash = req.params.txhash
    txSrv.getTransactionReceipt(txhash)
      .then(function (txReceipt) {
        res.send({ data: txReceipt })
      }, function (err) {
        res.send({ error: err })
      })
  })

  app.post('/node/tx/', (req, res) => {
    var rawTx = req.body.raw
    // send ether from one address to another or send tx signed offline
    /** e.g,
     * curl --header "Content-Type: application/json" \
      --request POST \
      --data '{"from": "0x59f6b3e21c3d568f5c5efc8ca1a099c7d51cd43c","private_key": "c23c38aff5bfbfa86fa6ac19b4730626b4d6b96440c90e4300f385d65853643e","to": "0x0821532dab2bdca2ab0e7062491135add99ab3eb","wei": "10000000000000000000","gas_price": "100000000000"}' \
      http://localhost:3000/node/tx/
     */
    if (typeof rawTx === 'undefined') {
      // separated-fields type of Tx
      var from = req.body.from
      var fromKey = req.body.private_key
      var to = req.body.to
      var wei = req.body.wei
      var gasPrice = req.body.gas_price

      txSrv.send(from, fromKey, to, wei, gasPrice)
        .then(function (result) {
          res.send({ data: result })
        }, function (err) {
          res.send({ error: err.message })
        })
    } else {
      // raw and signed type of Tx
      txSrv.sendRaw(rawTx)
        .then(function (result) {
          res.send({ data: result })
        }, function (err) {
          res.send({ error: err.message })
        })
    }
  })

  // contracts
  app.get('/node/contract/:name/:address/:caller/call/:method', (req, res) => {
    // make a call to a smart contract CALL/VIEW function that does not require gas or tx signing
    // e.g.., MetaCoin.sol getBalance(address addr) function
    // curl http://localhost:3000/node/contract/MetaCoin/0x47afd36a08b14defaa95911481dd52ebde5d1f4b/call/getBalance?addr="0x881cf81171bf16a7cfc8fcb15a152613530b4efc"
    // or multiple arguments getBalance?addr=0x0&accountId=user22
    var address = req.params.address
    var method = req.params.method
    var contractName = req.params.name
    var caller = req.params.caller

    contractSrv.call(contractName, address, caller, method, req.query)
      .then(function (result) {
        var response = {
          data: {
            contract: contractName,
            method: method,
            args: req.query,
            result: result.value
          }
        }
        res.send(response)
      }, function (err) {
        res.send({ error: err.message })
      })
  })

  app.post('/node/contract/:name/:address/transact/:method', (req, res) => {
    //make a call to a smart contract SEND function that requires gas and tx signing
    /** e.g, MetaCoin.sol sendCoin(address receiver, uint amount) function
     * curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"caller_address": "0x881cf81171bf16a7cfc8fcb15a152613530b4efc","private_key": "c259d27faa6472f8313fd60c257d6e03a4b3b3d18138b7bdb0691b2eb77d5473","args": {"receiver": "0x59f6b3e21c3d568f5c5efc8ca1a099c7d51cd43c", "amount":"50"}}' \
  http://localhost:3000/node/contract/MetaCoin/0x47afd36a08b14defaa95911481dd52ebde5d1f4b/transact/sendCoin
     */
    var contractAddress = req.params.address
    var method = req.params.method
    var contractName = req.params.name

    var privateKey = req.body.private_key
    var callerAddress = req.body.caller_address
    var args = req.body.args

    contractSrv.transact(contractName, contractAddress, method, callerAddress, privateKey, args)
      .then(function (result) {
        var response = {
          data: {
            contract: contractName,
            method: method,
            args: args,
            tx_hash: result.tx_hash
          }
        }
        res.send(response)
      }, function (err) {
        console.log(err)
        res.send({ error: err.message })
      })
  })
}
