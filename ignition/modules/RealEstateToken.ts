// ignition/modules/RealEstateToken.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RealEstateTokenModule = buildModule("RealEstateTokenModule", (m) => {
    // Get the deployer account
    const deployer = m.getAccount(0);

    // Deploy the contract
    const realEstateToken = m.contract("RealEstateToken", [deployer]);

    // Seed with sample properties (using m.getAccount for recipient addresses)
    const sampleProperties = [
        {
            to: deployer,
            tokenURI: "ipfs://QmSample1",
            location: "123 Main Street, New York, NY",
            area: 1500, // in square feet
            value: m.getParameter("value1", BigInt("750000000000000000000")), // 750 ETH in wei
            propertyType: "residential",
            yearBuilt: 2020
        },
        {
            to: m.getAccount(1), // Different account for testing
            tokenURI: "ipfs://QmSample2",
            location: "456 Oak Avenue, Los Angeles, CA",
            area: 3000, // in square feet
            value: m.getParameter("value2", BigInt("1200000000000000000000")), // 1200 ETH in wei
            propertyType: "commercial",
            yearBuilt: 2018
        },
        {
            to: m.getAccount(2), // Another account
            tokenURI: "ipfs://QmSample3",
            location: "789 Pine Road, Miami, FL",
            area: 5000, // in square feet
            value: m.getParameter("value3", BigInt("500000000000000000000")), // 500 ETH in wei
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
        ], {
            id: `mintProperty${index}`,
            after: [realEstateToken] // Ensure contract is deployed first
        });
    });

    return { realEstateToken };
});

export default RealEstateTokenModule;