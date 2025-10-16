import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";
import { expect } from "chai";



describe("MyTest", function () {
    async function runEveryTime() {
        const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
        const CONST_ONE_GWEI = 1000000000;
        const lockedAmount = CONST_ONE_GWEI;

        const unlockedTime = (await time.latest()) + ONE_YEAR_IN_SECS;

        const [owner, otherAccount] = await ethers.getSigners();


        const MyTest = await ethers.getContractFactory("MyTest");
        const myTest = await MyTest.deploy(unlockedTime, { value: lockedAmount });

        return { myTest, unlockedTime, lockedAmount, owner, otherAccount };
    }

    describe("Deployment", function () {

        // check lock time
        it("Should check unlock time", async function () {
            const { myTest, unlockedTime } = await loadFixture(runEveryTime);

            expect(await myTest.unlockedTime()).to.equal(unlockedTime);
        })

        // checking owner
        it('Should set the right owner', async function () {
            const { myTest, owner } = await loadFixture(runEveryTime);

            expect(await myTest.owner()).to.equal(owner.address);
        })

        // checking the balance
        it('Should receive and store the funds to MyTest', async function () {
            const { myTest, lockedAmount } = await loadFixture(runEveryTime);

            expect(await ethers.provider.getBalance(myTest.target)).to.equal(lockedAmount);
        })

        // connection check
        it('Should fail if the unlockTime is not in the future', async function () {
            // We don't use the fixture here because we want a different deployment
            const latestTime = await time.latest();
            const MyTest = await ethers.getContractFactory("MyTest");
            await expect(MyTest.deploy(latestTime, { value: 1 })).to.be.revertedWith(
                "Unlock time should be in the future"
            );
        })

    })

    describe("Withdrawals", function () {
        describe("Validations", function () {
            // time check for withdraw
            it("Should revert with the right error if called too soon", async function () {
                const { myTest } = await loadFixture(runEveryTime);

                await expect(myTest.withdraw()).to.be.revertedWith(
                    "You can't withdraw yet"
                );
            })

            // owner check for withdraw
            it("Should revert with the right error if called from another account", async function () {
                const { myTest, unlockedTime, otherAccount } = await loadFixture(runEveryTime);

                // We can increase the time in Hardhat Network
                await time.increaseTo(unlockedTime);

                // We use lock.connect() to send a transaction from another account
                await expect(myTest.connect(otherAccount).withdraw()).to.be.revertedWith(
                    "You aren't the owner"
                );
            })

            // withdraw check
            it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
                const { myTest, unlockedTime } = await loadFixture(runEveryTime);

                // Transactions are sent using the first signer by default
                await time.increaseTo(unlockedTime);

                await expect(myTest.withdraw()).not.to.be.reverted;
            })
        })
        describe("Events", function () {
            // event check
            it("Should emit an event on withdrawals", async function () {
                const { myTest, unlockedTime, lockedAmount } = await loadFixture(runEveryTime);

                await time.increaseTo(unlockedTime);

                await expect(myTest.withdraw())
                    .to.emit(myTest, "Withdrawal")
                    .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
            })
        })

        describe("Transfers", function () {
            // transfer check
            it("Should transfer the funds to the owner", async function () {
                const { myTest, unlockedTime, lockedAmount, owner } = await loadFixture(runEveryTime);

                await time.increaseTo(unlockedTime);

                await expect(myTest.withdraw()).to.changeEtherBalances(
                    [owner, myTest],
                    [lockedAmount, -lockedAmount]
                );
            })
        })
    })

    runEveryTime();
})