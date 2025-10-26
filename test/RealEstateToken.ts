import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { RealEstateToken } from "../typechain-types";

describe("RealEstateToken", function () {
    let realEstateToken: RealEstateToken;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;
    let tokenId: number;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const RealEstateTokenFactory = await ethers.getContractFactory("RealEstateToken");
        realEstateToken = await RealEstateTokenFactory.deploy(owner.address);

        // // Mint the first property
        // const tx = await realEstateToken.mintProperty(
        //     user1.address,
        //     "https://example.com/token/1",
        //     "123 Main St",
        //     150,
        //     ethers.parseEther("500000"),
        //     "residential",
        //     2020
        // );
        // const receipt = await tx.wait();

        // // Extract tokenId from event
        // const event = receipt?.logs
        //     .map((log: any) => {
        //         try {
        //             return realEstateToken.interface.parseLog(log);
        //         } catch {
        //             return null;
        //         }
        //     })
        //     .find((parsed: any) => parsed && parsed.name === "PropertyMinted");

        // tokenId = event?.args?.tokenId ? Number(event.args.tokenId) : 1;

        tokenId = Number(await realEstateToken.mintProperty(
            user1.address,
            "https://example.com/token/1",
            "123 Main St",
            150,
            ethers.parseEther("500000"),
            "residential",
            2020
        ))
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await realEstateToken.owner()).to.equal(owner.address);
        });

        it("Should have correct name and symbol", async function () {
            expect(await realEstateToken.name()).to.equal("RealEstateToken");
            expect(await realEstateToken.symbol()).to.equal("RET");
        });
    });

    describe("Minting Properties", function () {
        it("Should mint a new property", async function () {
            const tokenURI = "https://example.com/token/2";
            const location = "123 Main St, New York";
            const area = 150;
            const value = ethers.parseEther("500000");
            const propertyType = "residential";
            const yearBuilt = 2020;

           const tx = await realEstateToken.mintProperty(
                    user1.address,
                    tokenURI,
                    location,
                    area,
                    value,
                    propertyType,
                    yearBuilt   
            );
            await expect(tx).to.emit(realEstateToken, "PropertyMinted");

            const newTokenId = Number(await realEstateToken.nextTokenId())-1;
            const property = await realEstateToken.properties(newTokenId); // second minted property

            expect(property.location).to.equal(location);
            expect(property.area).to.equal(area);
            expect(property.value).to.equal(value);
            expect(property.propertyType).to.equal(propertyType);
            expect(property.yearBuilt).to.equal(yearBuilt);
            expect(property.currentOwner).to.equal(user1.address);
            expect(property.isForSale).to.equal(false);
        });

        it("Should not mint with duplicate token URI", async function () {
            const tokenURI = "https://example.com/token/1";
            await expect(
                realEstateToken.mintProperty(
                    user2.address,
                    tokenURI,
                    "Location 2",
                    200,
                    ethers.parseEther("200000"),
                    "commercial",
                    2021
                )
            ).to.be.revertedWith("Token URI already exists");
        });

        it("Should not mint with invalid area", async function () {
            await expect(
                realEstateToken.mintProperty(
                    user1.address,
                    "https://example.com/token/3",
                    "Location",
                    0,
                    ethers.parseEther("100000"),
                    "residential",
                    2020
                )
            ).to.be.revertedWith("Area must be greater than 0");
        });

        it("Should not mint with invalid value", async function () {
            await expect(
                realEstateToken.mintProperty(
                    user1.address,
                    "https://example.com/token/4",
                    "Location",
                    100,
                    0,
                    "residential",
                    2020
                )
            ).to.be.revertedWith("Value must be greater than 0");
        });
    });

    describe("Property Management", function () {
        it("Should update property value", async function () {
            const newValue = ethers.parseEther("550000");

            await expect(
                realEstateToken.connect(user1).updatePropertyValue(tokenId, newValue)
            ).to.emit(realEstateToken, "PropertyUpdated");

            const property = await realEstateToken.properties(tokenId);
            expect(property.value).to.equal(newValue);
        });

        it("Should toggle for sale status", async function () {
            await realEstateToken.connect(user1).toggleForSale(tokenId);

            let property = await realEstateToken.properties(tokenId);
            expect(property.isForSale).to.equal(true);

            await realEstateToken.connect(user1).toggleForSale(tokenId);

            property = await realEstateToken.properties(tokenId);
            expect(property.isForSale).to.equal(false);
        });

        it("Should not allow non-owner to update property", async function () {
            await expect(
                realEstateToken.connect(user2).updatePropertyValue(tokenId, ethers.parseEther("600000"))
            ).to.be.revertedWith("Not authorized");
        });
    });

    describe("Property Queries", function () {
        let secondTokenId: number;
        let thirdTokenId : number;

        beforeEach(async function () {
            secondTokenId = Number(await realEstateToken.mintProperty(
                user1.address,
                "https://example.com/token/2",
                "Property 2",
                200,
                ethers.parseEther("200000"),
                "commercial",
                2021
            ));

            thirdTokenId = Number(await realEstateToken.mintProperty(
                user2.address,
                "https://example.com/token/3",
                "Property 3",
                300,
                ethers.parseEther("300000"),
                "land",
                2022
            ))
        });

        it("Should get properties by owner", async function () {
            const properties = await realEstateToken.getPropertiesByOwner(user1.address);
            expect(properties.length).to.equal(2);
            expect(properties[0].location).to.equal("123 Main St");
            expect(properties[1].location).to.equal("Property 2");
        });

        it("Should get all properties", async function () {
            const allProperties = await realEstateToken.getAllProperties();
            expect(allProperties.length).to.equal(3);
        });

        it("Should get properties count", async function () {
            expect(await realEstateToken.getPropertiesCount()).to.equal(3);
        });

        it("Should get owned properties count", async function () {
            expect(await realEstateToken.getOwnedPropertiesCount(user1.address)).to.equal(2);
            expect(await realEstateToken.getOwnedPropertiesCount(user2.address)).to.equal(1);
        });

        it("Should get individual property", async function () {
            const property = await realEstateToken.getProperty(tokenId);
            expect(property.location).to.equal("123 Main St");
            expect(property.area).to.equal(150);
        });
    });

    describe("Property Transfers", function () {
        it("Should transfer property and update ownership", async function () {
            await realEstateToken.connect(user1).toggleForSale(tokenId);

            await realEstateToken.connect(user1).transferFrom(user1.address, user2.address, tokenId);

            const property = await realEstateToken.properties(tokenId);
            expect(property.currentOwner).to.equal(user2.address);
            expect(property.isForSale).to.equal(false);

            const user1Properties = await realEstateToken.getPropertiesByOwner(user1.address);
            const user2Properties = await realEstateToken.getPropertiesByOwner(user2.address);

            expect(user1Properties.length).to.equal(0);
            expect(user2Properties.length).to.equal(1);
        });
    });

    describe("Access Control", function () {
        it("Should not allow non-owner to mint", async function () {
            await expect(
                realEstateToken.connect(user1).mintProperty(
                    user1.address,
                    "https://example.com/token/5",
                    "Location",
                    100,
                    ethers.parseEther("100000"),
                    "residential",
                    2020
                )
            ).to.be.reverted;
        });
    });
});
