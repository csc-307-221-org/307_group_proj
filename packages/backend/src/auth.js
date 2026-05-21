import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

export function registerUser(req, res) {
  const { username, pwd } = req.body;

  if (!username || !pwd) {
    res.status(400).send("Bad request: Invalid input data.");
  } else {
    User.findOne({ username: username }).then((existingUser) => {
      if (existingUser) {
        res.status(409).send("Username already taken");
      } else {
        bcrypt
          .genSalt(10)
          .then((salt) => bcrypt.hash(pwd, salt))
          .then((hashedPassword) => {
            const newUser = new User({
              username: username,
              hashedPassword: hashedPassword,
            });

            newUser.save().then((savedUser) => {
              generateAccessToken(savedUser).then((token) => {
                res.status(201).send({ token: token });
              });
            });
          });
      }
    });
  }
}

export function loginUser(req, res) {
  const { username, pwd } = req.body;

  User.findOne({ username: username }).then((retrievedUser) => {
    if (!retrievedUser) {
      res.status(401).send("Unauthorized");
    } else {
      bcrypt
        .compare(pwd, retrievedUser.hashedPassword)
        .then((matched) => {
          if (matched) {
            generateAccessToken(retrievedUser).then((token) => {
              res.status(200).send({ token: token });
            });
          } else {
            res.status(401).send("Unauthorized");
          }
        })
        .catch(() => {
          res.status(401).send("Unauthorized");
        });
    }
  });
}

export function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token received");
    res.status(401).end();
  } else {
    jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
      if (decoded) {
        req.user = decoded;
        next();
      } else {
        console.log("JWT error:", error);
        res.status(401).end();
      }
    });
  }
}

function generateAccessToken(user) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "1d" },
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      },
    );
  });
}
