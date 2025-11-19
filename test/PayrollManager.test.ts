import { expect } from "chai";
import { ethers } from "hardhat";
import { PayrollManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PayrollManager", function () {
  let payrollManager: PayrollManager;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let employee: SignerWithAddress;

  beforeEach(async function () {
    [owner, admin, employee] = await ethers.getSigners();

    const PayrollManager = await ethers.getContractFactory("PayrollManager");
    payrollManager = await PayrollManager.deploy();
    await payrollManager.waitForDeployment();

    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    await payrollManager.grantRole(ADMIN_ROLE, admin.address);
  });

  describe("Employee Management", function () {
    it("Should add a new employee", async function () {
      await payrollManager.connect(admin).addEmployee(
        employee.address,
        "arkiv-hash-123"
      );

      const emp = await payrollManager.employees(employee.address);
      expect(emp.active).to.be.true;
      expect(emp.walletAddress).to.equal(employee.address);
    });

    it("Should not allow duplicate employees", async function () {
      await payrollManager.connect(admin).addEmployee(
        employee.address,
        "arkiv-hash-123"
      );

      await expect(
        payrollManager.connect(admin).addEmployee(
          employee.address,
          "arkiv-hash-456"
        )
      ).to.be.revertedWith("Employee already exists");
    });
  });

  describe("Invoice Management", function () {
    beforeEach(async function () {
      await payrollManager.connect(admin).addEmployee(
        employee.address,
        "arkiv-hash-123"
      );
    });

    it("Should create an invoice", async function () {
      const amount = ethers.parseEther("1000");
      const token = ethers.ZeroAddress;
      const chainId = 1;

      await payrollManager.connect(admin).createInvoice(
        employee.address,
        amount,
        token,
        "invoice-hash-123",
        chainId
      );

      const invoice = await payrollManager.invoices(0);
      expect(invoice.employee).to.equal(employee.address);
      expect(invoice.amount).to.equal(amount);
      expect(invoice.paid).to.be.false;
    });

    it("Should track invoice tally", async function () {
      const amount = ethers.parseEther("1000");

      await payrollManager.connect(admin).createInvoice(
        employee.address,
        amount,
        ethers.ZeroAddress,
        "invoice-hash-1",
        1
      );

      await payrollManager.connect(admin).createInvoice(
        employee.address,
        amount,
        ethers.ZeroAddress,
        "invoice-hash-2",
        1
      );

      const tally = await payrollManager.getInvoiceTally();
      expect(tally.totalInvoices).to.equal(2);
      expect(tally.paidInvoices).to.equal(0);
    });
  });
});
