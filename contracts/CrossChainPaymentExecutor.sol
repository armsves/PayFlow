// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWormholeRelayer {
    function sendPayloadToEvm(
        uint16 targetChain,
        address targetAddress,
        bytes memory payload,
        uint256 receiverValue,
        uint256 gasLimit
    ) external payable returns (uint64 sequence);
}

interface ILiFi {
    struct BridgeData {
        bytes32 transactionId;
        string bridge;
        string integrator;
        address referrer;
        address sendingAssetId;
        address receiver;
        uint256 minAmount;
        uint256 destinationChainId;
        bool hasSourceSwaps;
        bool hasDestinationCall;
    }

    function startBridgeTokensViaGenericBridge(
        BridgeData memory _bridgeData,
        bytes calldata _bridgeSpecificData
    ) external payable;
}

contract CrossChainPaymentExecutor is Ownable, ReentrancyGuard {
    IWormholeRelayer public wormholeRelayer;
    ILiFi public lifi;
    address public payrollManager;

    event CrossChainPaymentInitiated(
        uint256 indexed invoiceId,
        address indexed employee,
        uint256 amount,
        uint256 destinationChain,
        string bridge
    );

    constructor(
        address _wormholeRelayer,
        address _lifi,
        address _payrollManager
    ) Ownable(msg.sender) {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
        lifi = ILiFi(_lifi);
        payrollManager = _payrollManager;
    }

    function executeCrossChainPayment(
        uint256 _invoiceId,
        address _employee,
        address _token,
        uint256 _amount,
        uint256 _destinationChain,
        string memory _bridge
    ) external payable nonReentrant {
        require(msg.sender == payrollManager || msg.sender == owner(), "Unauthorized");

        if (_token != address(0)) {
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
            IERC20(_token).approve(address(lifi), _amount);
        }

        ILiFi.BridgeData memory bridgeData = ILiFi.BridgeData({
            transactionId: bytes32(_invoiceId),
            bridge: _bridge,
            integrator: "PayFlow",
            referrer: address(0),
            sendingAssetId: _token,
            receiver: _employee,
            minAmount: (_amount * 95) / 100,
            destinationChainId: _destinationChain,
            hasSourceSwaps: false,
            hasDestinationCall: false
        });

        lifi.startBridgeTokensViaGenericBridge{value: msg.value}(bridgeData, "");

        emit CrossChainPaymentInitiated(_invoiceId, _employee, _amount, _destinationChain, _bridge);
    }

    function executeViaWormhole(
        uint256 _invoiceId,
        uint16 _targetChain,
        address _targetAddress,
        bytes memory _payload
    ) external payable nonReentrant {
        require(msg.sender == payrollManager || msg.sender == owner(), "Unauthorized");

        wormholeRelayer.sendPayloadToEvm{value: msg.value}(
            _targetChain,
            _targetAddress,
            _payload,
            0,
            200000
        );

        emit CrossChainPaymentInitiated(_invoiceId, address(0), 0, _targetChain, "wormhole");
    }

    receive() external payable {}
}
