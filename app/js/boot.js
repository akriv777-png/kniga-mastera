import { whenReady } from "./lib.js";
import { startBook } from "./book.js";

whenReady(function () {
  startBook().catch(function (err) {
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = '<div class="gate"><p class="err">Книга не открылась. Обнови страницу.</p></div>';
    }
  });
});
