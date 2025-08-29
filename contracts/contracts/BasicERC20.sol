// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BasicERC20 is ERC20 {
    uint8 private immutable _customDecimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        address owner_
    ) ERC20(name_, symbol_) {
        require(decimals_ <= 18, "decimals too large");
        require(initialSupply_ > 0, "initial supply must be greater than 0");
        require(bytes(name_).length != 0, "name must be set");
        require(bytes(symbol_).length != 0, "symbol must be set");
        require(owner_ != address(0), "owner must be set");

        _customDecimals = decimals_;
        _mint(owner_, initialSupply_ * 10 ** _customDecimals);
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }
}
