pragma solidity ^0.8.28;

contract MyTest {
    uint public unlockedTime;
    address payable public owner;


    event Withdrawal(uint amount, uint when);


    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockedTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw() public{
        require(block.timestamp >= unlockedTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);

        owner.transfer(address(this).balance);
    }
}