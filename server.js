const express = require("express");
const morgan = require("morgan");
const config = require("config");
const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:db");
const app = express();
const logger = require("./logger");
const Joi = require("joi");
const mongoose = require('mongoose');
const Fawn = require("fawn");
const connect = require('./connect');
const Course = require('./model/courses');
const Author = require('./model/authors');

connect();
Fawn.init(mongoose);

app.set("view engine", "pug");
app.set("views", "./views");

const dbConfig = config.get("Customer.dbConfig");
const password = config.get("mail.password");
console.log(dbConfig);
console.log(password);

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

console.log(process.env.NODE_ENV);
console.log(app.get("env"));

if (app.get("env") === "development") {
  app.use(logger);
  app.use(morgan("tiny"));
  startupDebugger("morgan started");
}

app.use(function (req, res, next) {
  console.log("authenticate....");
  next();
});

dbDebugger("db started");

// app.get("/api/todos", function (req, res) {
//     res.send("Hello world from server.js");
// });

dbDebugger('db started');

const todos = [
  {
    id: 1,
    todoText: "Get Milk",
    isDone: false,
  },
  {
    id: 2,
    todoText: "Give Training",
    isDone: false,
  },
];

app.get("/api/courses", async function(req, res) {
  try {
    const author = req.query.author;
    let query = {};
    let course;
    if(author) {
      // query.author = new RegExp(`.*${author}.*`, 'i');
      query['author.name'] = new RegExp(`.*${author}.*`, 'i');
    }
    // optional chaining ?
    // not crashing the application and returns undefined
    // use split for arrays
    const tags = req.query.tags?.split(",");
    if(tags) {
      query.tags = { $in: tags };
    }
    console.log(query);
    // let course;
    // if(author) {
    //   course = await Course.find({author: new RegExp(`.*${author}.*`, 'i')});
    // } else {
    //   course = await Course.find();
    // }
    // const courses = await Course.find();
    // populate retrieves the author object for each course
    // -_id -> removes it from the object
    // you can add multiple .populate()
    course = await Course.find(query).populate('author', "name -_id");
    res.status(200).send(course);
  } catch(err) {
    res.status(500).send({message: err.message});
  }
})

app.get("/api/courses/:id", async function(req, res) {
  try {
    const course = await Course.findById(res.params.id);
    // const course = await Course.findOne({_id: req.params.id});
    console.log(course);
    res.status(200).send(course);
  } catch(err) {
    if(error.path === '_id') {
      res.status(400).send({message: "The course doesn't exist."});
    } else {
      
      res.status(500).send({message: err.message});
    }
    
  }
})

const errRes = (errors) => {
  const newErrors = {};
  for(const err in errors) {
    newErrors[err] = errors[err].message;
    if(errors[err].properties.type === "enum") {
      newErrors[err] = {
        message: errors[err].message,
        validValues: errors[err].properties.enumValues,
      };
    } else {
      newErrors[err] = errors[err].message;
    }
  }
  return newErrors;
}

const courseValidationSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required()
});

app.post("/api/courses", async (req,res) => {
  try {
    const { author: authorData, ...courseData } = req.body;
    const author = new Author(authorData);
    const course = new Course({...courseData, author: author._id});
    await Fawn.Task()
      .save('Author', author)
      .save('Course', course)
      .run();

    // console.log(courseData);
    // console.log(authorsData);
    
    // await author.validate();
    // await author.save();

    
    // for (let i = 0; i < authorsData.length; i++) {
    //   const element = authorsData[i];
    //   course.authors.push(new Author(element));
    // }

    // console.log(course);
    
    // await course.validate();
    // await course.save();
    res.status(201).send(course);
  } catch(err) {
    console.log(JSON.stringify(err));
    if(err.name === "ValidationError") {
      res.status(400).send({
        message: "attached file has wrong data",
        data: errRes(err.errors)
      });
    } else {
        res.status(500).send({message: err.message});
    }
  }
});

app.put("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // not a very good idea for updating
    // const course = await Course.findOne({_id: id});
    // course.name = req.body.name;
    // await course.save();

    const updatedCourse = await Course.updateOne(
      {$_id: id},
      {$set: req.body,},
      {runValidators: true,}
    );
    res.status(201).send(updatedCourse);
  } catch (error) {
    console.log(JSON.stringify(err));
    if(err.name === "ValidationError") {
      res.status(400).send({
        message: "attached file has wrong data",
        data: errRes(err.errors)
      });
    } else {
        res.status(500).send({message: err.message});
    }
  }
});

app.delete("/api/courses/:courseId/:authorId", async (req, res) => {
  try {
    const { courseId, authorId } = req.params;
    const course = await Course.findOne({_id: courseId});
    const author = course.authors.id(authorId);
    author.remove();
    await course.save();
    res.status(200).send(course);
  } catch (error) {
    res.status(500).send({message: err.message});
  }
})

var port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`${port} port is ready`);
});

//app.get("/", function (req, res) {
//   // database
//   res.render("index", { pageTitle: "Node.js Training", youAreUsingPug: true });
// });

// app.get("/api/todos", function (req, res) {
//   console.log("get method...");
//   const id = req.query.id;
//   const todoText = req.query.todoText;
//   let response = todos;
//   if (id || todoText) {
//     response = response.filter((x) => {
//       if (id) {
//         return x.id === Number(id);
//       }
//       if (todoText) {
//         return x.todoText.includes(todoText);
//       }
//       return false;
//     });
//   }
//   res.status(200).send(response);
// });

// app.get("/api/todos/:id", function (req, res) {
//   const todo = todos.find((x) => x.id === Number(req.params.id));

//   if (todo) {
//     res.status(200).send(todo);
//   } else {
//     res.status(400).send({ message: "id is not available" });
//   }
// });

// app.post("/api/todos", function (req, res) {
//   try {
//     const schema = Joi.object({
//       todoText: Joi.string().min(3).required(),
//       isDone: Joi.boolean(),
//     });

//     const { error } = schema.validate(req.body);

//     if (error) {
//       return res.status(401).send(error.details);
//     }
//     const data = req.body;
//     if (!data.isDone) {
//       data.isDone = false;
//     }

//     const todo = {
//       id: todos.length + 1,
//       ...data,
//     };
//     todos.push(todo);
//     res.status(201).send(todo);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ message: "something is wrong" });
//   }
// });

// app.put("/api/todos/:id", function (req, res) {
//   // TODO: use splice for update record as well
//   try {
//     const index = todos.findIndex((x) => x.id === Number(req.params.id));
//     if (index === -1) {
//       return res.status(404).send({ message: "record not found" });
//     } else {
//       const schema = Joi.object({
//         todoText: Joi.string().min(3).required(),
//         isDone: Joi.boolean(),
//       });
    
//       const { error } = schema.validate(req.body);
//       if (error) {
//         return res.status(401).send(error.details);
//       } else {
//         todos.splice(index, 1);
//         const updatedTodo = {
//           ...req.body,
//           id: Number(req.params.id),
//         };
//         todos.push(updatedTodo);
//         return res.status(201).send(updatedTodo);
//       }
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ message: "something is wrong" });
//   }
// });

// app.delete("/api/todos/:id", function (req, res) {
//   const index = todos.findIndex((x) => x.id === Number(req.params.id));
//   if (index === -1)
//     return res.status(404).send({ message: "record not found" });

//   const deletedTodo = todos[index];
//   // TODO: use splice for update record as well
//   todos.splice(index, 1);

//   return res.status(201).send(deletedTodo);
// });

// // app.get("/api/todos/:year/:month", function (req, res) {
// //   // {
// //   //     year: '',
// //   //     month: ""
// //   // }
// //   res.send(req.params);
// // });
