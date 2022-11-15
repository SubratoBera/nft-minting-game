const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory("MyEpicGame");
  const gameContract = await gameContractFactory.deploy(
    ["Naruto", "Shanks", "Vegeta"],
    [
      "https://staticg.sportskeeda.com/editor/2021/09/08bf8-16321313916558-800.jpg",
      "https://cdn-www.comingsoon.net/assets/uploads/2022/07/one-piece-ep-489-shanks.jpg",
      "https://wallpaperaccess.com/full/7179539.jpg",
    ],
    [1000, 780, 800],
    [60, 90, 80],
    "Madara Uchiha",
    "https://i.pinimg.com/originals/1c/19/29/1c192913a411e02c3433551ee6c49be0.jpg",
    10000,
    150
  );
  await gameContract.deployed();
  console.log("Contract deployed to:", gameContract.address);

  let txn;
  txn = await gameContract.mintCharacterNFT(0);
  await txn.wait();
  console.log("Minted NFT #1");

  txn = await gameContract.mintCharacterNFT(1);
  await txn.wait();
  console.log("Minted NFT #2");

  txn = await gameContract.mintCharacterNFT(2);
  await txn.wait();
  console.log("Minted NFT #3");

  txn = await gameContract.mintCharacterNFT(1);
  await txn.wait();
  console.log("Minted NFT #4");

  console.log("Done deploying and minting!");

  txn = await gameContract.mintCharacterNFT(2);
  await txn.wait();

  txn = await gameContract.attackBoss();
  await txn.wait();

  txn = await gameContract.attackBoss();
  await txn.wait();
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
