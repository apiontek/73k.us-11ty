module.exports = {
  tags: ["posts"],
  layout: "layouts/post.njk",
  permalink: "/blog/{{ title | slugify }}/",
}
