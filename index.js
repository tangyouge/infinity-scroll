/*
 * @Author: ZhipengTang
 * @Date: 2020-06-08 09:40:38
 * @LastEditors: ZhipengTang
 * @LastEditTime: 2020-06-08 16:26:02
 * @FilePath: /demo-scroll/index.js
 */ 

const container = document.getElementById("listContainer");
const list = document.querySelectorAll("#listContainer li");

// 渲染 20 个 list
const renderPage = function(firstIndex) {
  list.forEach((cur, index) => {
    const li = cur;
    li.innerHTML = firstIndex + index + 1;
  })
}

renderPage(0);

const renderFunction = function(firstIndex) {
  renderPage(firstIndex);
}

const listScroll = new Scroll({
  firstItemId: "item-first",
  lastItemId: "item-last",
  container,
  listSize: 21,
  itemHeight: 120,
  renderFunction
})

listScroll.startObserver();