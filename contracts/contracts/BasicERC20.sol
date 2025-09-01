// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicERC20 is ERC20, Ownable {
    uint8 private immutable _customDecimals;
    bool public mintable;

    event Minted(address indexed to, uint256 amount);

    modifier whenMintable() {
        require(mintable, "mint disabled");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        address owner_,
        bool mintable_
    ) ERC20(name_, symbol_) Ownable(owner_) {
        require(bytes(name_).length != 0, "name must be set");
        require(
            bytes(symbol_).length > 0 && bytes(symbol_).length <= 11,
            "bad symbol"
        );
        require(decimals_ <= 18, "decimals too large");
        require(initialSupply_ > 0, "initial supply must be greater than 0");
        require(owner_ != address(0), "owner must be set");

        _customDecimals = decimals_;
        mintable = mintable_;
        _mint(owner_, initialSupply_ * 10 ** _customDecimals);
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }

    function mint(address to, uint256 amount) external onlyOwner whenMintable {
        _mint(to, amount);
        emit Minted(to, amount);
    }
}
