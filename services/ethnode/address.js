module.exports = function (web3) {
  var module = {}

  module.getBalance = async function (address) {
    var promise = new Promise((resolve, reject) => {
      try {
        web3.eth.getBalance(address, (err, balance) => {
          if (err) {
            return reject(err)
          } else {
            return resolve({ value: balance })
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
