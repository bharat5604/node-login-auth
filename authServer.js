require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());
// sample login user name
const userList = [
  {
    username: "bharat",
    password: "bharat@123",
    isAdmin: false,
  },
  {
    username: "abhishek",
    password: "abhishek@123",
    isAdmin: true,
  },
];
let refreshTokens = [];

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    // const accessToken = jwt.sign(
    //   { name: user.name },
    //   process.env.ACCESS_TOKEN_SECRET,
    //   { expiresIn: "25s" }
    // );
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/logout", async (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/login", (req, res) => {
  // authentication user
  const users = userList.find((user) => user.username == req.body.username);
  // const userDetails = {
  //   username: req.body.username,
  //   password: req.body.password,
  // };
  if (users == null) {
    return res.status(400).send({ message: "cannot find user" });
  }
  try {
    if (req.body.password == users.password) {
      const user = { name: users.username };
      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
      refreshTokens.push(refreshToken);
      res.send({
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: { ...user, isAdmin: users.isAdmin },
      });
    } else {
      res.send({ message: "username and password does not match" });
    }
  } catch {
    res.status(500).send();
  }
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "25s" });
}

app.listen(8000);
