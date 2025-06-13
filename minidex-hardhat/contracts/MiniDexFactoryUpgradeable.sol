// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

interface IMiniDexPair {
    function initialize(address tokenA, address tokenB, address owner) external;
}

contract MiniDexFactoryUpgradeable is Initializable, OwnableUpgradeable {
    event PairCreated(address indexed tokenA, address indexed tokenB, address pairAddress, uint256 index);

    address public pairImplementation;
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    function initialize(address _pairImplementation, address _owner) public initializer {
        __Ownable_init(_owner);
        pairImplementation = _pairImplementation;
    }

    function createPair(address tokenA, address tokenB) external onlyOwner returns (address pair) {
        require(tokenA != tokenB, "Identical addresses");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(getPair[tokenA][tokenB] == address(0), "Pair already exists");

        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);

        bytes memory data = abi.encodeWithSelector(IMiniDexPair.initialize.selector, token0, token1, msg.sender);
        ERC1967Proxy proxy = new ERC1967Proxy(pairImplementation, data);
        pair = address(proxy);

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(tokenA, tokenB, pair, allPairs.length - 1);
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function getPairAtIndex(uint256 index) external view returns (address) {
        require(index < allPairs.length, "Out of bounds");
        return allPairs[index];
    }

    function setPairImplementation(address newImpl) external onlyOwner {
        require(newImpl != address(0), "Zero address");
        pairImplementation = newImpl;
    }
}
