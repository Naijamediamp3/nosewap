const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");

const companyWalletKey = config.get("CompanyWalletKey");

const auth = require("./../../middleware/auth");

const ctctm_abi = require("../../abi/ctctm.json");

const User = require("../../models/Coin");

// @route    POST api/coin/
// @desc     Register user
// @access   Public
router.post("/", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // const { name, symbol, isCoin, WalletName, chain, address, staked_value, users, country, fee } = req.body;

  // console.log("getAll:",req.body);

  try {
    let user = await User.find();

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "User not found." }] });
    }
    console.log("getAllCoinInfo:success");
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/sendCTCTMtoUer", async (req, res) => {
  let { toAddress, amount } = req.body;
  // const toAddress = "0xf62e68C9fe7868F1e7110F5C7e8F9E0908559409"; //User Wall address
  const privateKey = companyWalletKey;
  const fromAddress = "0x3698FC37de282C265262731d2711809a1A1B6136"; // Company Wallet address
  const tokenAddress = "0x7e41E454b6A29C54e4cDB565E47542f4BCb37ef1";

  console.log(tokenAddress);

  const Web3 = require("web3");
  const web3 = new Web3(
    new Web3.providers.HttpProvider("https://bsc-dataseed1.binance.org/")
  );
  try {
    let contract = new web3.eth.Contract(ctctm_abi.abi, tokenAddress, {
      from: fromAddress,
    });

    const balance = await contract.methods.balanceOf(fromAddress).call();
    console.log(balance);

    amount = web3.utils.toHex(web3.utils.toWei(parseFloat(amount).toString())); //1 DEMO Token
    let data = contract.methods.transfer(toAddress, amount).encodeABI();

    let txObj = {
      gas: web3.utils.toHex(1000000),
      to: tokenAddress,
      value: "0x00",
      data: data,
      from: fromAddress,
    };

    web3.eth.accounts.signTransaction(txObj, privateKey, (err, signedTx) => {
      if (err) {
        res.status(500).send("Server error");
        return callback(err);
      } else {
        console.log("signedTx:", signedTx);

        return web3.eth.sendSignedTransaction(
          signedTx.rawTransaction,
          (err, res) => {
            if (err) {
              console.log(err);
            } else {
              console.log(res);
            }
          }
        );
      }
    });
    res.status(200).json("Success");
  } catch (error) {
    res.status(500).json(error);
  }
});

// @route    POST api/coin/:symbol
// @desc     Register user
// @access   Public
router.post("/:symbol", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // const { name, symbol, isCoin, WalletName, chain, address, staked_value, users, country, fee } = req.body;
  const { symbol } = req.params;

  // console.log(symbol);
  // console.log("getAll:",req.body);

  try {
    let user = await User.findOne({ symbol });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "User not found." }] });
    }

    console.log("getOne:success");
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    POST api/coin/calcFee/:symbol/:staking_amount
// @desc     CalcFeeBySymbol
// @access   Public
router.post("/calcFee/:symbol/:staking_amount", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // const { name, symbol, isCoin, WalletName, chain, address, staked_value, users, country, fee } = req.body;
  const { symbol, staking_amount } = req.params;

  // console.log(symbol);
  // console.log("getAll:",req.body);

  try {
    let user = await User.findOne({ symbol });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "User not found." }] });
    }

    console.log("calcFee:");

    return res.status(200).json({
      _staked_val: parseFloat(staking_amount * 5),
      _fee: parseFloat((user.fee * 10000.0 * staking_amount) / 10000.0),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    POST api/coin/calcFee/:symbol/:staking_amount
// @desc     Register user
// @access   Public
router.post(
  "/addStaking/:address/:symbol/:staking_amount",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const { name, symbol, isCoin, WalletName, chain, address, staked_value, users, country, fee } = req.body;
    const { address, symbol, staking_amount } = req.params;

    // console.log(symbol);
    // console.log("getAll:",req.body);

    try {
      let user = await User.findOne({ symbol });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: "User not found." }] });
      }

      user.staked_value = parseFloat(
        parseFloat(user.staked_value) + parseFloat(staking_amount)
      );
      user.users.push(address);
      user.save();

      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
