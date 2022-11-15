const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame');
    const gameContract = await gameContractFactory.deploy(                     
      ["Naruto", "Shanks", "Vegeta"],       
      ["https://staticg.sportskeeda.com/editor/2021/09/08bf8-16321313916558-800.jpg", 
      "https://cdn-www.comingsoon.net/assets/uploads/2022/07/one-piece-ep-489-shanks.jpg", 
      "https://wallpaperaccess.com/full/7179539.jpg"],
      [1000, 780, 800],                    
      [60, 90, 80],                       
      "Madara Uchiha",
      "https://static.wikia.nocookie.net/caa0de7c-fbc8-49a2-be7a-068d6532eae8/scale-to-width/370",
      10000,
      120
    );
    await gameContract.deployed();
    console.log("Contract deployed to:", gameContract.address);
    
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