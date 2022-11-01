const router = require("./index");

let tokenObject = {};

router.get("/set-token/:id", (req, res) =>{
    const id = req.params.id;
    const accessToken = createAccessToken(id);
    const refreshToken = createRefreshToken();

    tokenObject[refreshToken] = id;
    res.cookie('accessToken', accessToken)
    res.cookie('refreshToken', refreshToken);

    return res.status(200).json({"message":"Token 정상적으로 발행"})
})

function createAccessToken(id) {
    const accessToken = jwt.sign({id:id}, SECRET_KEY, {expiresIn:'1d'})

    return accessToken
}

function createRefreshToken() {
    const refreshToken = jwt.sign({}, SECRET_KEY, {expiresIn:'7d'})

    return refreshToken;
}