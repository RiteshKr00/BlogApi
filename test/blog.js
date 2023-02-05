const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
var server = require("../server");
const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
let token;
let userId;
let blogId;
describe("Blogs Api", async (done) => {
  describe("/POST create blog", () => {
    it("should create a new blog for a logged in user", async () => {
      //login
      const hashedPassword = await bcrypt.hash("password", (saltOrRounds = 10));
      const user = new User({
        name: "test",
        email: "test@gmail.com",
        password: hashedPassword,
      });
      await user.save();
      userId = user._id;
      chai
        .request(server)
        .post("/api/v1/auth/signin")
        .send({
          email: "test@gmail.com",
          password: "password",
        })
        .end((err, res) => {
          token = res.body.bearerToken;
          chai
            .request(server)
            .post("/api/v1/blog/")
            .set("Authorization", `Bearer ${token}`)
            .send({
              title: "Test Blog",
              description: "This is a test blog",
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property("message");
              res.body.should.have.property("blog_created");
            });
        });
    });

    it("create a new blog for a logged out user", (done) => {
      chai
        .request(server)
        .post("/api/v1/blog")
        .send({
          title: "Test Blog",
          description: "This is a test blog",
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
  
  //Delete Blog
  describe("/Delete delete a blog", () => {
    it("should Delete a blog for a logged in user", async () => {
      //login
      const hashedPassword = await bcrypt.hash("password", (saltOrRounds = 10));
      const user = new User({
        name: "test",
        email: "test@gmail.com",
        password: hashedPassword,
      });
      await user.save();
      const blog = new Blog({
        title: "Health",
        description: "Health is wealth",
      });
      await blog.save();

      userId = user._id;
      blogId = blog._id;
      chai
        .request(server)
        .post("/api/v1/auth/signin")
        .send({
          email: "test@gmail.com",
          password: "password",
        })
        .end((err, res) => {
          token = res.body.bearerToken;
          chai
            .request(server)
            .delete(`/api/v1/blog/${blogId}`)
            .set("Authorization", `Bearer ${token}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property("message");
              res.body.should.have.property("Deleted_playlist");
              // done();
            });
        });
    });
    it("Delete a new blog for a logged out user", (done) => {
      chai
        .request(server)
        .put(`/api/v1/blog/${blogId}`)
        .send({
          title: "Change Title of Test Blog",
          description: "This is a test blog",
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
  //Edit Some Parameters
  describe("/PUT Edit blog", () => {
    it("should Edit some parameters of a blog for a logged in user", async () => {
      //login
      const hashedPassword = await bcrypt.hash("password", (saltOrRounds = 10));
      const user = new User({
        name: "test",
        email: "test@gmail.com",
        password: hashedPassword,
      });
      await user.save();
      const blog = new Blog({
        title: "Health",
        description: "Health is wealth",
      });
      await blog.save();

      userId = user._id;
      blogId = blog._id;
      chai
        .request(server)
        .post("/api/v1/auth/signin")
        .send({
          email: "test@gmail.com",
          password: "password",
        })
        .end((err, res) => {
          token = res.body.bearerToken;
          chai
            .request(server)
            .put(`/api/v1/blog/${blogId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
              title: "Changing title",
              description: "This is a test blog",
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property("message");
              res.body.should.have.property("updatedBlog");
              // done();
            });
        });
    });
    it("Edit a new blog for a logged out user", (done) => {
      chai
        .request(server)
        .put(`/api/v1/blog/${blogId}`)
        .send({
          title: "Change Title of Test Blog",
          description: "This is a test blog",
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
