Ethereum Blockchain and Smart Contract Interaction API
========================================================


This module provides an API for an Ethereum node by using [web3](https://github.com/ethereum/web3.js/)
[web3 documentation](https://web3js.readthedocs.io/en/1.0/index.html)

Install
-------
Clone the repo and then install dependencies:
```bash
$ npm install
```

The install process creates a new `config.js` file in the root directory, based on the `config.js.default` file. There you can set up the parameters for running your instance including the path (in the project root folder) of the full smart contract .json file gotten from `truffle deploy --network <network name>` which includes the smart contract abi e.g., `var/contracts/MetaCoin.json`


HTTP RESTful API
----------------
In order to start the HTTP API service you just need to run:
```bash
$ npm start
```
or
```bash
$ node api
```
You'll see a message indicating that the service is already running.

### Endpoints

* GET `/node/status`

  Get the status of the server and the network/connection
  
* GET `/node/address/:address/balance`

  Get the ether balance of an account 

* GET `/node/tx/:txhash`

  Get the details of a transaction hash

* GET `/node/tx/receipt/:txhash`

  Get the full receipt of a transaction
  
* POST `/node/tx/`

  Send ether (wei) from one account to another address

* GET `/node/contract/:name/:address/call/:method`

  Make a call to a smart contracts view function that does not require gas or transaction signing

* POST `/node/contract/:name/:address/transact/:method`

  Make a call to a smart contracts SEND function that requires gas and transaction signing as it changes the state of the blockchain

* GET `/node/gasLimit`

  Get the gas limit used in the last mined/approved block

* GET `/node/latestBlock`

  Get the details of the latest mined/approved block

* GET `/node/block/:blockNumber`

  Get the details of a specified mined/approved block with the block number

* GET `/node/event/:contractName/:address/:fromBlock`

  Get all past events from a specified smart contract