var Marketplace = artifacts.require("./Marketplace.sol");
var MemoryToken = artifacts.require('./MemoryToken.sol');
module.exports = function(deployer){

  deployer.deploy(MemoryToken);
  deployer.then(async () => {
    
    try {
      await deployer.deploy(Marketplace, "Marketplace", "FT");
      
	
    } catch (err) {
      console.log(('Failed to Deploy new Contract', err))
    }
  })

}
