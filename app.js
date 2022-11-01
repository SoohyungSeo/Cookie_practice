const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const port = 3000;
const SECRET_KEY = "seosoohyung";


app.use(cookieParser());
app.use(express.json());


app.get("/", (req, res) => {
    res.status(200).send("kakaoprac")
})

let tokenObject = {};

app.get("/set-token/:id", (req, res) =>{
    const id = req.params.id;
    const accessToken = createAccessToken(id);
    const refreshToken = createRefreshToken();

    tokenObject[refreshToken] = id;
    res.cookie('accessToken', accessToken)
    res.cookie('refreshToken', refreshToken);

    return res.status(200).json({"message":"Token 정상적으로 발행"})
})

function createAccessToken(id) {
    const accessToken = jwt.sign({id:id}, SECRET_KEY, {expiresIn:'10s'})

    return accessToken
}

function createRefreshToken() {
    const refreshToken = jwt.sign({}, SECRET_KEY, {expiresIn:'7d'})

    return refreshToken;
}

app.get("/get-token", (req, res) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken) return res.status(400).json({"message":"Refresh Token이 이미 존재"});
    if(!accessToken) return res.status(400).json({"message":"Access Token이 이미 존재"});

    const isAccessTokenValidate = validateAccessToken(accessToken);
    const isRefreshTokenValidate = validateRefreshToken(refreshToken);

    if(!isRefreshTokenValidate) return res.status(419).json({"message":"Refresh Token의 기간이 만료."});

    if(!isAccessTokenValidate) {
        const accessTokenId = tokenObject[refreshToken];
        if(!accessTokenId) return res.status(419).json({"message":"Refresh Token의 정보가 존재하지 않음"})

        const newAccessToken = createAccessToken(accessTokenId);
        res.cookie("accessToken", newAccessToken);
        return res.json({"message":"Access Token을 새롭게 발급하였습니다"})
    }
    const {id} = getAccessTokenPayload(accessToken);
    return res.json({"message": `${id}의 payload를 가진 Token이 성공적으로 인증`})
})

function validateAccessToken(accessToken) {
    try{
        jwt.verify(accessToken, SECRET_KEY);
        return true;
    } catch(error) {
        return false
    }
}

function validateRefreshToken(refreshToken) {
    try{
        jwt.verify(refreshToken, SECRET_KEY);
        return true;
    } catch(error) {
        return false;
    }
}

function getAccessTokenPayload(accessToken) {
    try{
        const payload = jwt.verify(accessToken, SECRET_KEY);
        return payload
    } catch(error) {
        return null;
    }
}

app.listen(port, () => {
    console.log("3000번 포트로 열렸습니다.")
})