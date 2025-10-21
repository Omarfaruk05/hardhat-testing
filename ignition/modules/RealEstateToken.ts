// ignition/modules/RealEstateToken.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RealEstateTokenModule = buildModule("RealEstateTokenModule", (m) => {
    // Get the deployer account
    const deployer = m.getAccount(0);

    // Deploy the contract
    const realEstateToken = m.contract("RealEstateToken", [deployer]);

    // Seed with sample properties
    const sampleProperties = [
        {
            to: deployer,
            tokenURI: "ipfs://QmSample1",
            location: "123 Main Street, New York, NY",
            area: 150,
            value: BigInt("75000000000000000000"), // 750000 ETH in wei
            propertyType: "residential",
            yearBuilt: 2020
        },
        {
            to: deployer,
            tokenURI: "ipfs://QmSample2",
            location: "456 Oak Avenue, Los Angeles, CA",
            area: 300,
            value: BigInt("120000000000000000000"), // 1200000 ETH in wei
            propertyType: "commercial",
            yearBuilt: 2018
        },
        {
            to: deployer,
            tokenURI: "ipfs://QmSample3",
            location: "789 Pine Road, Miami, FL",
            area: 500,
            value: BigInt("50000000000000000"), // 500000 ETH in wei
            propertyType: "land",
            yearBuilt: 2023
        }
    ];

    // Add mint transactions for each property
    sampleProperties.forEach((prop, index) => {
        m.call(realEstateToken, "mintProperty", [
            prop.to,
            prop.tokenURI,
            prop.location,
            prop.area,
            prop.value,
            prop.propertyType,
            prop.yearBuilt
        ], { id: `mintProperty${index}` });
    });

    return { realEstateToken };
});

export default RealEstateTokenModule;