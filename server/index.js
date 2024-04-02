import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

console.log("Back to basics");
console.log("MERN - JWT Authentication");

//creating a server

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

const PORT = 3001;

app.get("/", async (req, res) => {
  console.log("Working fine ✅");
  res.json({ msg: "Working fine ✅" });
});

// app.post("/login", (req, res) => {
//   //Using JWT here

//   const { username, password } = req.body;
//   if (username == "" || password === "") {
//     console.log("Empty vals");
//     return;
//   }
//   //creating Token using username&password
//   const token = jwt.sign(
//     { username, kuchBhi: "asdsdvbsvlauy123@sad" },
//     "qwwfe1asd"
//   );
//   console.log("JWT-token: ", token);

//   // res.cookie("JWT_token",token).send("Login called")
//   // res.cookie("token", token, { httpOnly: true }).json(token);
//   res.cookie("token", token, { httpOnly: true, maxAge: 360000 });
//   return res.json({ status: true, message: "login successfully" });

//   // JWT.sign(
//   //   { username, kuchBhi: "asdsdvbsvlauy123@sad" },
//   //   "qwwfe1asd",
//   //   {},
//   //   function (err, token) {
//   //     if (err) console.log("Error in JWT :", err);
//   //     //   Token generate ho rha h and frontend pr bhi ja rha h
//   //     // frontend pr hi set ho paegi localstorage, backend mein set krne ke liye packages use krne pdenge

//   //     //set krni h token in cookie
//   //     res
//   //       .cookie("JwtToken", token, {
//   //         httpOnly: true,
//   //         // sameSite: "strict",
//   //         // secure: true,
//   //       })
//   //       .json({ JWTtoken: token });
//   //     console.log(token);
//   //   }
//   // );
//   //   console.log(req.body);
//   //   console.log("POST req");
//   //   res.json({ msg: "POST req" });
// });

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (username == "" || password === "") {
    console.log("Empty vals");
    return;
  }

  const token = jwt.sign(
    {
      username,
    },
    "asnjasvj"
  );
  res.setHeader("Authorization", token);
  console.log("res.header : ", res.getHeader("Authorization"));
  res.cookie("token", token, { httpOnly: true, secure: true });
  res.setHeader("Set-Cookie", `token=${token}; Path=/; Max-Age=3600`);

  console.log("get headers: ", res.getHeaders());
  // Set cookieName and cookieValue as per your requirement

  return res.json({
    status: true,
    message: "login successfully",
    JWTtoken: token,
  });
});

app.get("/setToken", (req, res) => {
  console.log("setToken called");
  //   localStorage.setItem("jwt_token", "token");
  res
    .cookie("JwtTokenGET", "tokenGET", { sameSite: "none", secure: true })
    .json({ JwtTokenGET: "tokenGET " });
  //   res.send("Token set");
});

app.post("/setToken", (req, res) => {
  console.log("get headers: ", res.getHeaders());

  // console.log("headers from set-token-post: ", res.getHeader["Authorization"]);

  console.log("setToken POST called");
  //   localStorage.setItem("jwt_token", "token");
  res
    .cookie("JwtTokenPOST", "tokenPOST", { httpOnly: true, secure: true })
    .json({ JWTtoken: "tokenPOST " });
  // res
  //   .cookie("JwtTokenPOST", "tokenPOST", { sameSite: "none", secure: true })
  //   .json({ JWTtoken: "tokenPOST " });
  //   res.send("Token set");
});

app.get("/getCookies", (req, res) => {
  res.json(req.cookies);
  console.log("All cookies: ", req.cookies);
});

app.listen(PORT, () => {
  console.log("Connected to server at PORT : 3001");
});
