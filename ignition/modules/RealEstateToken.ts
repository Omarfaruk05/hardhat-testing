import { ethers } from 'hardhat';

export async function deployRealEstateToken() {
  const [deployer] = await ethers.getSigners();

  const RealEstateToken = await ethers.getContractFactory('RealEstateToken');
  const contract = await RealEstateToken.deploy(deployer.address); // ✅ pass initialOwner

  console.log(`✅ Contract deployed at: ${await contract.getAddress()}`);
  return contract;
}


export async function mintProperty(
    contract: any,
    to: string,
    tokenURI: string
) {
    const tx = await contract.mintProperty(to, tokenURI);
    await tx.wait();
    console.log(`🏠 Minted property to ${to} with URI: ${tokenURI}`);
}

export async function getOwnerOf(contract: any, tokenId: number) {
    const owner = await contract.ownerOf(tokenId);
    console.log(`🔍 Owner of token ${tokenId}: ${owner}`);
    return owner;
}

export async function getTokenURI(contract: any, tokenId: number) {
    const uri = await contract.tokenURI(tokenId);
    console.log(`📄 Token URI for ${tokenId}: ${uri}`);
    return uri;
}