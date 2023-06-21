// Global variables
const todoListElement = document.getElementById("todo-list");
const completedListElement = document.getElementById("completed-list");
const createForm = document.getElementById("create-form");
const titleInput = document.getElementById("title-input");
const descriptionInput = document.getElementById("description-input");

// Initialize the array to store todos and the ID counter
let todos = [];
let idCounter = 31;

// Add event listener to the submit button
createForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Get the title and description from the input fields
  let title = titleInput.value;
  let description = descriptionInput.value;

  // Create a new todo with title and description
  // Call the renderTodos function after the todo is created
  createTodo(title, description, todos, () => {
    renderTodos(todos);
  });

  // Reset the input fields
  createForm.reset();
});

// Function to render the todos on the page
function renderTodos(todos) {
  // Clear the existing todo and completed lists
  todoListElement.innerHTML = "";
  completedListElement.innerHTML = "";

  // Iterate through each todo and create corresponding elements
  for (let todo of todos) {
    let element = createTodoElement(todo);

    // Append the element to the lists based on completion status
    if (todo.completed) {
      completedListElement.append(element);
    } else {
      todoListElement.append(element);
    }
  }
}

// Function to create a todo element
function createTodoElement(todo) {
  // Create the necessary HTML elements
  let li = document.createElement("li");
  li.classList.add("todo-item");
  let article = document.createElement("article");
  let title = document.createElement("p");
  let description = document.createElement("p");
  let createdDate = document.createElement("p");
  let completedDate = document.createElement("p");
  let completeBtn = document.createElement("button");
  let removeBtn = document.createElement("button");

  // Set attributes and content for the created elements
  title.innerText = todo.title;
  description.innerText = todo.description;

  const displayDate = new Date().toLocaleString();

  if (todo.completed) {
    completedDate.innerText = "Completed: " + displayDate;
    createdDate.style.display = "none"; // Hide the created date for completed todos

    // Show only the delete button for completed todos
    removeBtn.innerText = "Delete";
    removeBtn.addEventListener("click", () => {
      removeTodo(todo, todos, () => {
        renderTodos(todos);
      });
    });

    // Hide the complete button for completed todos
    completeBtn.style.display = "none";
  } else {
    createdDate.innerText = "Created: " + displayDate;
    completedDate.style.display = "none"; // Hide the completed date for unfinished todos

    completeBtn.innerText = "Complete";
    completeBtn.addEventListener("click", () => {
      updateTodoStatus(todo, todos, () => {
        renderTodos(todos); // Render the updated todos list after the status is updated
      });
    });

    removeBtn.innerText = "Delete";
    removeBtn.addEventListener("click", () => {
      removeTodo(todo, todos, () => {
        renderTodos(todos);
      });
    });
  }

  // Append the created elements to the article
  article.append(title, description, createdDate, completedDate, completeBtn, removeBtn);

  // Append the article to the list item
  li.append(article);
  // Return the created list item
  return li;
}

// Function to create a new todo
function createTodo(title, description, todos, after) {
  fetch("https://dummyjson.com/todos/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description,
      completed: false,
      userId: 1,
    }),
  })
    .then((res) => res.json())
    .then((value) => {
      console.log(value);
      value.id = idCounter++;
      value.title = title;
      value.description = description;
      todos.push(value);
      after();
    });
}

// Function to remove a todo
function removeTodo(todo, todos, after) {
  fetch("https://dummyjson.com/todos/" + todo.id, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((value) => {
      if (value.isDeleted) {
        let index = todos.findIndex((todo) => todo.id === value.id);
        if (index !== -1) {
          todos.splice(index, 1);
        }
        after();
      }
    });
}

// Function to update the status of a todo
function updateTodoStatus(todo, todos, after) {
  fetch("https://dummyjson.com/todos/" + todo.id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      completed: true,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Failed to update todo status.");
      }
    })
    .then((value) => {
      // Assuming the server response returns the updated todo
      // You can modify this part based on the actual response structure
      todo.completed = value.completed; // Update the todo status
      after(); // Call the callback function
    })
    .catch((error) => {
      console.log(error);
      // Handle the error here if necessary
    });
}
