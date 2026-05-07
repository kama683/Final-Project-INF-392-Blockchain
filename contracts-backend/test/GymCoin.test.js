const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GymCoin", function () {
  let gymCoin, owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const GymCoin = await ethers.getContractFactory("GymCoin");
    // initialSupply=10000 GC, sellRate=100 (1 ETH = 100 GC), buyRate=200
    gymCoin = await GymCoin.deploy(10000, 100, 200);
  });

  it("Owner gets initial supply", async function () {
    const balance = await gymCoin.balanceOf(owner.address);
    expect(balance).to.equal(ethers.parseUnits("10000", 18));
  });

  it("User can buy GC", async function () {
    // Покупаем 100 GC, нужно отправить 1 ETH
    const ethAmount = ethers.parseEther("1");
    await gymCoin.connect(user1).buy(100, { value: ethAmount });
    
    const balance = await gymCoin.balanceOf(user1.address);
    expect(balance).to.equal(ethers.parseUnits("100", 18));
  });

  it("Only owner can change rates", async function () {
    await expect(
      gymCoin.connect(user1).setRates(150, 250)
    ).to.be.reverted;
  });
});