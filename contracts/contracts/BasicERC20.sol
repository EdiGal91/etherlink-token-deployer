// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BasicERC20 is ERC20, Ownable, ERC20Burnable {
    uint8 private immutable _customDecimals;
    bool public mintable;
    bool public burnable;

    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    modifier whenMintable() {
        require(mintable, "mint disabled");
        _;
    }
    modifier whenBurnable() {
        require(burnable, "burn disabled");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        address owner_,
        bool mintable_,
        bool burnable_
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
        burnable = burnable_;
        _mint(owner_, initialSupply_ * 10 ** _customDecimals);
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }

    function mint(address to, uint256 amount) external onlyOwner whenMintable {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function burn(uint256 amount) public override whenBurnable {
        super.burn(amount);
        emit Burned(msg.sender, amount);
    }

    function burnFrom(
        address account,
        uint256 amount
    ) public override whenBurnable {
        super.burnFrom(account, amount);
        emit Burned(account, amount);
    }
}
