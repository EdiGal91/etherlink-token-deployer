// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./BasicERC20.sol";

struct TokenInfo {
    address token;
    string name;
    string symbol;
    uint8 decimals;
    bool mintable;
    bool burnable;
}

contract ERC20Factory {
    mapping(address => address[]) public ownerTokens;
    mapping(address => TokenInfo) public infoByToken;

    event TokenDeployed(
        address indexed owner,
        address indexed token,
        string name,
        string symbol,
        uint8 decimals,
        bool isMintable,
        bool isBurnable
    );

    function createToken(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        bool isMintable_,
        bool isBurnable_
    ) external returns (address token) {
        token = address(
            new BasicERC20(
                name_,
                symbol_,
                decimals_,
                initialSupply_,
                msg.sender,
                isMintable_,
                isBurnable_
            )
        );

        ownerTokens[msg.sender].push(token);
        infoByToken[token] = TokenInfo({
            token: token,
            mintable: isMintable_,
            burnable: isBurnable_,
            decimals: decimals_,
            name: name_,
            symbol: symbol_
        });

        emit TokenDeployed(
            msg.sender,
            token,
            name_,
            symbol_,
            decimals_,
            isMintable_,
            isBurnable_
        );
    }

    function getOwnerTokens(
        address owner
    ) external view returns (address[] memory) {
        return ownerTokens[owner];
    }

    function getOwnerTokenInfos(
        address owner
    ) external view returns (TokenInfo[] memory) {
        address[] memory list = ownerTokens[owner];
        TokenInfo[] memory out = new TokenInfo[](list.length);
        for (uint256 i; i < list.length; i++) {
            out[i] = infoByToken[list[i]];
        }
        return out;
    }
}
