module.exports = function (web3) {
  var module = {}

  module.getStatus = async function () {

    var promise = new Promise((resolve, reject) => {
      try {
        web3.eth.getAccounts((err, accounts) => {
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
