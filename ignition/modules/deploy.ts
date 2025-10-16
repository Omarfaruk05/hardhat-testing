import hre from 'hardhat';




const main = async ()=>{
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;


    const lockedAmount = hre.ethers.parseEther("1.0");
    console.log("Unlock time: ", unlockTime);
    console.log('One year in seconds: ', ONE_YEAR_IN_SECS);
    console.log("Current timestamp: ", currentTimestampInSeconds)
    console.log("Locked amount: ", lockedAmount);


    const MyTest = await hre.ethers.getContractFactory("MyTest");
    const myTest = await MyTest.deploy(unlockTime, {value: lockedAmount});

    await myTest.waitForDeployment()
    console.log("MyTest deployed to: ", await myTest.getAddress());
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1
})