var Logistics = artifacts.require("D:/Мисис/blockchain_kr/contracts/Logistics.sol");

module.exports = function(deployer) {
  deployer.deploy(Logistics);
};