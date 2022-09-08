const { ethers } = require("hardhat");
require("dotenv").config({path:".env"});

async function main(){
  //URL w我们可以从中提取一个LW3Punk的元数据
  const metadataURL = "ipfs://QmSATch89KkMo6yLMzJY7BeuqqHs8bUxiEbNGTCgAv9y9o/";
  /*
  在ether.js中的ContractFactory是一个用于部署新的智能合约的抽象，
  所有在这里的lw3PunksContract是我们LW3Punks合约实例的工厂 
  */
  const lw3PunksContract = await ethers.getContractFactory("LW3Punks");
  const deployedLW3PunksContract = await lw3PunksContract.deploy(metadataURL);
  
  //部署合约
  await deployedLW3PunksContract.deployed();

  //打印合约
  console.log("LW3Punks Contract Address:", deployedLW3PunksContract.address);
}

main()
  .then(() => process.exit(0))
  .catch(() => {
    console.error(error);
    process.exit(1);
  });
