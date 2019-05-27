module.exports = function (web3) {
  var module = {}

  module.getStatus = async function () {

    /* web3.eth.getAccounts((error, accounts) => {
      console.log(accounts)
    }) */

    /* web3.eth.getBalance(accounts[0], 'pending').then((balance) => {
        conosle.log(balance)
    } */

    var promise = new Promise((resolve, reject) => {
    try {
      web3.eth.getAccounts( (err, accounts) => {
        if (err) {
          return reject(err)
        } else {
          //console.log(accounts)
          return resolve({ value: accounts })
        }
      })
    } catch (err) {
      console.log('getAccounts from node error.')
      console.log(err)
      return reject(err)
    }
  })
  return promise
  }


  return module
}
