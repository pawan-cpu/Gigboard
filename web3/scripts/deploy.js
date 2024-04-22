async function main() {
  const contractFactory = await ethers.getContractFactory('TasksV1');
  const contract = await contractFactory.deploy();
  await contract.deployed();

  console.log("Contract deployed to: ", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
const runMain = async() => {
  try {
    await main();
    process.exit(0);
  } catch(error) {
    console.log(error);
    process.exit(1);
  }
}

runMain();