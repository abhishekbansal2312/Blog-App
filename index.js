const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const bodyParser = require("body-parser");

const app = express();
const port = 3010;

// Default blog entry
const defaultBlog = {
  title: "Welcome to My Blog!",
  description: "This is a default blog post. Feel free to add more blogs.",
  link: "https://example.com/default-blog",
};

const users = [
  {
    fname: "Abhishek",
    lname: "Bansal",
    bio: "A passionate web developer with experience in various technologies.",
    linkedin: "https://www.linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
  },
];

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Function to get blogs from JSON file
async function getBlogs() {
  try {
    const data = await fs.readFile(path.join(__dirname, "blogs.json"), "utf8");
    const blogs = JSON.parse(data);
    // If the blogs array is empty, add the default blog
    if (blogs.length === 0) {
      blogs.push(defaultBlog);
      await fs.writeFile(
        path.join(__dirname, "blogs.json"),
        JSON.stringify(blogs, null, 2)
      );
    }
    return blogs;
  } catch (err) {
    console.error("Error reading or parsing blogs.json:", err);
    // Return an array with the default blog if there’s an error
    return [defaultBlog];
  }
}

// Define routes
app.get("/", async (req, res) => {
  try {
    const blogs = await getBlogs();
    res.render("home", { title: "Home Page", blogs });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/contact", (req, res) => {
  res.render("contact", { title: "Contact Page" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About Page", users });
});

app.get("/newblog", (req, res) => {
  res.render("newblog", { title: "New Blog Page" });
});

app.post("/newblog", async (req, res) => {
  const { title, description, link } = req.body;
  const newBlog = { title, description, link };

  try {
    const blogs = await getBlogs();
    blogs.push(newBlog);

    await fs.writeFile(
      path.join(__dirname, "blogs.json"),
      JSON.stringify(blogs, null, 2)
    );

    res.redirect("/");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send("404 Page Not Found");
});

app.listen(port, () => {
  console.log(`Your server is running at http://localhost:${port}`);
});
