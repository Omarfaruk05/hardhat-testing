import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('RealEstateToken', function () {
    let realEstateToken: any;
    let owner: any;
    let addr1: any;

    const sampleTokenURI = 'https://example.com/metadata/1.json';

    beforeEach(async () => {
        [owner, addr1] = await ethers.getSigners();

        const RealEstateToken = await ethers.getContractFactory('RealEstateToken');
        realEstateToken = await RealEstateToken.deploy(owner.address); 
        await realEstateToken.deployed();
    });

    it('should deploy with correct name and symbol', async () => {
        expect(await realEstateToken.name()).to.equal('RealEstateToken');
        expect(await realEstateToken.symbol()).to.equal('RET');
    });

    it('should mint a property token to an address', async () => {
        await realEstateToken.mintProperty(addr1.address, sampleTokenURI);

        const balance = await realEstateToken.balanceOf(addr1.address);
        expect(balance).to.equal(1);

        const ownerOfToken = await realEstateToken.ownerOf(0);
        expect(ownerOfToken).to.equal(addr1.address);
    });

    it('should store correct token URI', async () => {
        await realEstateToken.mintProperty(addr1.address, sampleTokenURI);

        const tokenURI = await realEstateToken.tokenURI(0);
        expect(tokenURI).to.equal(sampleTokenURI);
    });

    it('should only allow owner to mint', async () => {
        await expect(
            realEstateToken.connect(addr1).mintProperty(addr1.address, sampleTokenURI)
        ).to.be.revertedWith('Ownable: caller is not the owner');
    });
});