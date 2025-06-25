const API_URL = "http://localhost:3000/posts";

const createForm = document.getElementById("createForm");
const postList = document.getElementById("postList");

const detailTitle = document.getElementById("detail-title");
const detailAuthor = document.getElementById("detail-author");
const detailContent = document.getElementById("detail-content");

const editForm = document.getElementById("edit-post-form");
const editTitleInput = document.getElementById("edit-title");
const editContentInput = document.getElementById("edit-content");
const cancelEditBtn = document.getElementById("cancel-edit");

let currentPost = null;

// Load all posts
window.addEventListener("DOMContentLoaded", () => {
  fetchPosts();
});

function fetchPosts() {
  fetch(API_URL)
    .then((res) => res.json())
    .then((posts) => {
      postList.innerHTML = "";
      posts.forEach((post) => renderPost(post));
      if (posts.length > 0) {
        handlePostClick(posts[0]); // show first post
      }
    });
}

createForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const content = document.getElementById("post-content").value;
  const author = document.getElementById("author").value;
  const timestamp = new Date().toISOString();

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, author, timestamp })
  })
    .then((res) => res.json())
    .then((newPost) => {
      renderPost(newPost);
      createForm.reset();
    })
    .catch((err) => console.error("POST Error:", err));
});

function renderPost(post) {
  const postItem = document.createElement("li");
  postItem.className = "post";

  const title = document.createElement("h3");
  title.className = "post-title clickable";
  title.textContent = post.title;
  title.addEventListener("click", () => {
    handlePostClick(post);
  });

  const author = document.createElement("p");
  author.className = "post-author";
  author.innerHTML = `<i class='bx bx-user'></i> <strong>${post.author}</strong>`;

  const date = document.createElement("p");
  date.className = "post-date";
  const formatted = post.timestamp
    ? new Date(post.timestamp).toLocaleString("en-GB", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "Unknown date";
  date.textContent = `📅 Posted on: ${formatted}`;

  const body = document.createElement("p");
  body.textContent = post.content.split(" ").slice(0, 10).join(" ") + "...";

  const likeBtn = document.createElement("button");
  likeBtn.className = "btn like-btn";
  let likeCount = 0;
  const likeCountSpan = document.createElement("span");
  likeCountSpan.textContent = ` ${likeCount}`;
  likeBtn.innerHTML = `<i class='bx bx-like'></i> Like`;
  likeBtn.appendChild(likeCountSpan);
  likeBtn.addEventListener("click", () => {
    likeCount++;
    likeCountSpan.textContent = ` ${likeCount}`;
  });

  const editBtn = document.createElement("button");
  editBtn.className = "btn";
  editBtn.innerHTML = "<i class='bx bx-edit-alt'></i> Edit";
  editBtn.addEventListener("click", () => {
    currentPost = post;
    editTitleInput.value = post.title;
    editContentInput.value = post.content;
    editForm.classList.remove("hidden");
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn delete-btn";
  deleteBtn.innerHTML = "<i class='bx bx-trash'></i> Delete";
  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this post?")) {
      fetch(`${API_URL}/${post.id}`, {
        method: "DELETE"
      }).then(() => {
        alert("🗑️ Post deleted!");
        fetchPosts();
      });
    }
  });

  const actions = document.createElement("div");
  actions.className = "post-actions";
  actions.append(likeBtn, editBtn, deleteBtn);

  postItem.append(title, author, date, body, actions);
  postList.append(postItem);
}

function handlePostClick(post) {
  currentPost = post;
  detailTitle.textContent = post.title;
  detailAuthor.innerHTML = `<i class='bx bx-user'></i> ${post.author}`;
  detailContent.textContent = post.content;
  editForm.classList.add("hidden");
}

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentPost) return;

  const newTitle = editTitleInput.value.trim();
  const newContent = editContentInput.value.trim();

  if (newTitle && newContent) {
    fetch(`${API_URL}/${currentPost.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: newTitle,
        content: newContent
      })
    })
      .then((res) => res.json())
      .then((updatedPost) => {
        handlePostClick(updatedPost);   // Update the detail section
        fetchPosts();                   // Refresh the list
        editForm.classList.add("hidden");
        alert("✅ Post updated!");
      })
      .catch((err) => {
        console.error("PATCH Error:", err);
        alert("❌ Failed to update post.");
      });
  }
});


cancelEditBtn.addEventListener("click", () => {
  editForm.classList.add("hidden");
});
