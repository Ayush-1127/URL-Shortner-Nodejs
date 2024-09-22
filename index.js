const express = require('express');
const { connectToMongoDB } = require("./connect");
const cookieParser = require('cookie-parser')

const URL = require("./models/url")
const path = require('path')

const urlRoute = require("./routes/url")
const staticRouter = require('./routes/staticRouter')
const userRoute = require('./routes/user');
const {checkForAuthentication, restrictTo }= require('./middleware/auth');

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/url-shortener")
    .then(() => console.log("Connected to MongoDB"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"))

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // it support form data 
app.use(cookieParser())
app.use(checkForAuthentication);



// app.get("/test", async(req, res) => {
//     const allUrls = await URL.find({});
//     return res.render('home', {
//         urls: allUrls,
//     })
// })

app.use("/url", restrictTo(["NORMAL"]), urlRoute)
app.use('/user', userRoute)
app.use('/',staticRouter)

app.get("/url/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId,
    },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },
            },
        }
    );
    
    res.redirect(entry.redirectUrl)
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
