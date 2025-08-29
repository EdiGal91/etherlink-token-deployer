// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./BasicERC20.sol";

contract ERC20Factory {
    event TokenDeployed(
        address indexed owner,
        address token,
        string name,
        string symbol,
        uint8 decimals
    );

    function createToken(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_
    ) external returns (address token) {
        BasicERC20 t = new BasicERC20(
            name_,
            symbol_,
            decimals_,
            initialSupply_,
            msg.sender
        );
        token = address(t);

        emit TokenDeployed(msg.sender, token, name_, symbol_, decimals_);
    }
}
