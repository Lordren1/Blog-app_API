import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Mock data to store submitted posts
let posts = [];

// Serve static files
app.use(express.static("public"));

// Function to convert Celsius to Fahrenheit and apply Math.floor
const convertAndFloorTemperature = (kelvinTemp) => {
  const celsiusTemp = kelvinTemp - 273.15;
  const fahrenheitTemp = celsiusTemp * 9/5 + 32;
  return Math.floor(fahrenheitTemp);
};

// Render index page with sorted posts
app.get("/", (req, res) => {
  // Sort posts by creation date (most recent first)
  const sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);

  let weatherConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://api.openweathermap.org/data/2.5/weather?lat=6.5&lon=3.3&appid=519313b4b0568225c5a8ea3b2a4b401b',
    headers: {}
  };

  // Configuration for Blockchain API request
  let blockchainConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://api.blockchain.com/v3/exchange/l2/BTC-USD',
    headers: { 
      'X-API-Token': '1e47b460-ffc3-43ba-8be2-fedc8d69f4bf', 
      'Cookie': '_cfuvid=wCu.ariLgJtu7RzLXkvbZrsAZrbk3j5GxwbhFiCKqrc-1715872592245-0.0.1.1-604800000'
    }
  };

  Promise.all([  
    axios.request(weatherConfig),
    axios.request(blockchainConfig)
  ])
  .then((response) => {
    const weatherData = response[0].data;
    const blockchainData = response[1].data;

    // Convert temperatures to Fahrenheit and apply Math.floor
    weatherData.main.temp = convertAndFloorTemperature(weatherData.main.temp);
    weatherData.main.feels_like = convertAndFloorTemperature(weatherData.main.feels_like);
    weatherData.main.temp_min = convertAndFloorTemperature(weatherData.main.temp_min);
    weatherData.main.temp_max = convertAndFloorTemperature(weatherData.main.temp_max);

    console.log('Log here:', weatherData);
    console.log('Log here:', blockchainData);

    res.render("index.ejs",  {posts: sortedPosts, weatherData, blockchainData });
  })
  .catch((error) => {
    console.log(error);
    res.status(500).send("Error fetching data");
  });
});

app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.post("/submit", (req, res) => {
  const { name, title, postData, url } = req.body;
  const newPost = {
    id: posts.length + 1,
    name: name,
    title: title,
    postData: postData,
    url: url,
    createdAt: new Date()
  };
  posts.push(newPost);
  res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(post => post.id === postId);
  res.render("edit.ejs", { post: post });
});

app.post("/edit/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const { name, title, postData, url } = req.body;
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    posts[postIndex] = {
      ...posts[postIndex],
      name: name,
      title: title,
      postData: postData,
      url: url
    };
  }
  res.redirect("/");
});

app.get("/delete/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  posts = posts.filter(post => post.id !== postId);
  res.redirect("/");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.get("/post", (req, res) => {
  const sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);
  res.render("post.ejs", { posts: sortedPosts });
});

app.post("/submit", (req, res) => {
  const postData = req.body.postData;
  res.redirect("post.ejs");
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
