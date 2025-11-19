// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PayrollManager
 * @notice Manages payroll payments with invoice verification on Scroll L2
 */
contract PayrollManager is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAYROLL_EXECUTOR = keccak256("PAYROLL_EXECUTOR");

    struct Invoice {
        uint256 invoiceId;
        address employee;
        uint256 amount;
        address token;
        uint256 timestamp;
        bool paid;
        string arkivDataHash;
        uint256 chainId;
    }

    struct Employee {
        address walletAddress;
        string arkivProfileHash;
        bool active;
        uint256 totalPaid;
        uint256 invoiceCount;
    }

    uint256 public nextInvoiceId;
    mapping(uint256 => Invoice) public invoices;
    mapping(address => Employee) public employees;
    mapping(address => uint256[]) public employeeInvoices;

    uint256 public totalInvoicesPaid;
    uint256 public totalAmountPaid;

    event InvoiceCreated(uint256 indexed invoiceId, address indexed employee, uint256 amount, address token);
    event InvoicePaid(uint256 indexed invoiceId, address indexed employee, uint256 amount, uint256 chainId);
    event EmployeeAdded(address indexed employee, string arkivProfileHash);
    event EmployeeUpdated(address indexed employee, bool active);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PAYROLL_EXECUTOR, msg.sender);
    }

    function addEmployee(address _employee, string memory _arkivProfileHash) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(_employee != address(0), "Invalid employee address");
        require(!employees[_employee].active, "Employee already exists");

        employees[_employee] = Employee({
            walletAddress: _employee,
            arkivProfileHash: _arkivProfileHash,
            active: true,
            totalPaid: 0,
            invoiceCount: 0
        });

        emit EmployeeAdded(_employee, _arkivProfileHash);
    }

    function createInvoice(
        address _employee,
        uint256 _amount,
        address _token,
        string memory _arkivDataHash,
        uint256 _chainId
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(employees[_employee].active, "Employee not active");
        require(_amount > 0, "Amount must be greater than 0");

        uint256 invoiceId = nextInvoiceId++;

        invoices[invoiceId] = Invoice({
            invoiceId: invoiceId,
            employee: _employee,
            amount: _amount,
            token: _token,
            timestamp: block.timestamp,
            paid: false,
            arkivDataHash: _arkivDataHash,
            chainId: _chainId
        });

        employeeInvoices[_employee].push(invoiceId);
        employees[_employee].invoiceCount++;

        emit InvoiceCreated(invoiceId, _employee, _amount, _token);

        return invoiceId;
    }

    function markInvoicePaid(uint256 _invoiceId) 
        external 
        onlyRole(PAYROLL_EXECUTOR) 
    {
        Invoice storage invoice = invoices[_invoiceId];
        require(!invoice.paid, "Invoice already paid");

        invoice.paid = true;
        employees[invoice.employee].totalPaid += invoice.amount;
        totalInvoicesPaid++;
        totalAmountPaid += invoice.amount;

        emit InvoicePaid(_invoiceId, invoice.employee, invoice.amount, invoice.chainId);
    }

    function getEmployeeInvoices(address _employee) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return employeeInvoices[_employee];
    }

    function getInvoiceTally() 
        external 
        view 
        returns (uint256 totalInvoices, uint256 paidInvoices, uint256 totalPaid) 
    {
        return (nextInvoiceId, totalInvoicesPaid, totalAmountPaid);
    }

    function updateEmployeeStatus(address _employee, bool _active) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(employees[_employee].walletAddress != address(0), "Employee does not exist");
        employees[_employee].active = _active;
        emit EmployeeUpdated(_employee, _active);
    }

    function emergencyWithdraw(address _token, uint256 _amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (_token == address(0)) {
            payable(msg.sender).transfer(_amount);
        } else {
            IERC20(_token).transfer(msg.sender, _amount);
        }
    }

    receive() external payable {}
}
