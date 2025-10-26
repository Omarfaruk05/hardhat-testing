// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateToken is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    
    struct Property {
        uint256 tokenId;
        string location;
        uint256 area;
        uint256 value;
        string propertyType;
        uint256 yearBuilt;
        address currentOwner;
        bool isForSale;
        uint256 createdAt;
        bool exists;
    }
    
    mapping(uint256 => Property) public properties;
    mapping(string => bool) private _existingTokenURIs;
    mapping(address => uint256[]) private _ownedProperties;
    
    event PropertyMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string location,
        uint256 value,
        string propertyType
    );
    
    event PropertyUpdated(uint256 indexed tokenId, uint256 newValue, bool isForSale);
    event PropertyTransferred(uint256 indexed tokenId, address from, address to);

    constructor(address initialOwner)
        ERC721("RealEstateToken", "RET")
        Ownable(initialOwner)
    {}

    function mintProperty(
        address to,
        string memory tokenURI,
        string memory location,
        uint256 area,
        uint256 value,
        string memory propertyType,
        uint256 yearBuilt
    ) public onlyOwner returns (uint256) {
        require(!_existingTokenURIs[tokenURI], "Token URI already exists");
        require(area > 0, "Area must be greater than 0");
        require(value > 0, "Value must be greater than 0");
        require(yearBuilt > 1800 && yearBuilt <= block.timestamp, "Invalid year built");
        
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        properties[tokenId] = Property({
            tokenId: tokenId,
            location: location,
            area: area,
            value: value,
            propertyType: propertyType,
            yearBuilt: yearBuilt,
            currentOwner: to,
            isForSale: false,
            createdAt: block.timestamp,
            exists: true
        });
        
        _ownedProperties[to].push(tokenId);
        _existingTokenURIs[tokenURI] = true;
        nextTokenId++;
        
        emit PropertyMinted(tokenId, to, location, value, propertyType);
        return tokenId;
    }
    
    function updatePropertyValue(uint256 tokenId, uint256 newValue) public {
        Property storage property = properties[tokenId];
        require(property.exists, "Property does not exist");
        require(newValue > 0, "Value must be greater than 0");
        require(
            msg.sender == property.currentOwner || msg.sender == owner(),
            "Not authorized"
        );
        
        property.value = newValue;
        emit PropertyUpdated(tokenId, newValue, property.isForSale);
    }
    
    function toggleForSale(uint256 tokenId) public {
        Property storage property = properties[tokenId];
        require(property.exists, "Property does not exist");
        require(msg.sender == property.currentOwner, "Not the owner");
        
        property.isForSale = !property.isForSale;
        emit PropertyUpdated(tokenId, property.value, property.isForSale);
    }

    function getProperty(uint256 tokenId) public view returns (Property memory) {
        Property memory property = properties[tokenId];
        require(property.exists, "Property does not exist");
        return property;
    }
    function getPropertiesByOwner(address owner) public view returns (Property[] memory) {
        uint256[] memory ownedTokenIds = _ownedProperties[owner];
        Property[] memory ownedProperties = new Property[](ownedTokenIds.length);
        
        for (uint256 i = 0; i < ownedTokenIds.length; i++) {
            ownedProperties[i] = properties[ownedTokenIds[i]];
        }
        
        return ownedProperties;
    }
    
    function getAllProperties() public view returns (Property[] memory) {
        Property[] memory allProps = new Property[](nextTokenId);
        
        for (uint256 i = 0; i < nextTokenId; i++) {
            allProps[i] = properties[i];
        }
        
        return allProps;
    }
    
    function getPropertiesForSale() public view returns (Property[] memory) {
        uint256 forSaleCount = 0;
        
        // First count
        for (uint256 i = 0; i < nextTokenId; i++) {
            if (properties[i].isForSale) {
                forSaleCount++;
            }
        }
        
        Property[] memory forSaleProperties = new Property[](forSaleCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < nextTokenId; i++) {
            if (properties[i].isForSale) {
                forSaleProperties[currentIndex] = properties[i];
                currentIndex++;
            }
        }
        
        return forSaleProperties;
    }
    
    function getPropertiesCount() public view returns (uint256) {
        return nextTokenId;
    }
    
    function getOwnedPropertiesCount(address owner) public view returns (uint256) {
        return _ownedProperties[owner].length;
    }
    
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);
        
        if (from != address(0)) {
            // Remove from previous owner's list
            uint256[] storage fromProperties = _ownedProperties[from];
            for (uint256 i = 0; i < fromProperties.length; i++) {
                if (fromProperties[i] == tokenId) {
                    fromProperties[i] = fromProperties[fromProperties.length - 1];
                    fromProperties.pop();
                    break;
                }
            }
            
            // Add to new owner's list
            _ownedProperties[to].push(tokenId);
            
            // Update property data
            properties[tokenId].currentOwner = to;
            properties[tokenId].isForSale = false;
            
            emit PropertyTransferred(tokenId, from, to);
        }
        
        return previousOwner;
    }
}