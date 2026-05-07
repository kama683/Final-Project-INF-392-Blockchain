pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GymCoin is ERC20, Ownable {
    uint256 public sellRate;
    uint256 public buyRate;

    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 gcAmount);
    event TokensSold(address indexed seller, uint256 gcAmount, uint256 ethAmount);
    event RatesUpdated(uint256 newSellRate, uint256 newBuyRate);

    constructor(uint256 _initialSupply, uint256 _sellRate, uint256 _buyRate)
        ERC20("Gym Coin", "GC")
        Ownable(msg.sender)
    {
        _mint(msg.sender, _initialSupply * 10 ** decimals());
        sellRate = _sellRate;
        buyRate = _buyRate;
    }

    function buy(uint256 gcAmount) public payable {
        require(gcAmount > 0, "Amount must be > 0");
        uint256 requiredEth = (gcAmount * 1 ether) / sellRate;
        require(msg.value == requiredEth, "Incorrect ETH amount");
        require(balanceOf(owner()) >= gcAmount * 10 ** decimals(), "Owner has not enough GC");

        _transfer(owner(), msg.sender, gcAmount * 10 ** decimals());
        emit TokensPurchased(msg.sender, msg.value, gcAmount);
    }

    function sell(uint256 gcAmount) public {
        require(gcAmount > 0, "Amount must be > 0");
        require(balanceOf(msg.sender) >= gcAmount * 10 ** decimals(), "Not enough GC");

        uint256 ethToSend = (gcAmount * 1 ether) / buyRate;
        require(address(this).balance >= ethToSend, "Contract has not enough ETH");

        _transfer(msg.sender, owner(), gcAmount * 10 ** decimals());
        payable(msg.sender).transfer(ethToSend);

        emit TokensSold(msg.sender, gcAmount, ethToSend);
    }

    function setRates(uint256 _sellRate, uint256 _buyRate) public onlyOwner {
        require(_sellRate > 0 && _buyRate > 0, "Rates must be > 0");
        sellRate = _sellRate;
        buyRate = _buyRate;
        emit RatesUpdated(_sellRate, _buyRate);
    }

    receive() external payable {}
}