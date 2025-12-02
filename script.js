document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos da UI ---
  const cardsContainer = document.querySelector(".cards-container");
  const paginationContainer = document.querySelector(".pagination-container");
  const campoBusca = document.querySelector("#search");
  const backToTopBtn = document.getElementById("back-to-top-btn");

  // --- Estado da Aplicação ---
  let todosOsDados = [];
  let dadosFiltrados = [];
  let categoriaAtiva = "todos";
  let paginaAtual = 1;
  let debounceTimer;
  const INPUT_DELAY_EM_MS_PARA_PESQUISAR = 600;
  const ITENS_POR_PAGINA = 20;

  const inicializar = async () => {
    try {
      const resposta = await fetch("data.json");
      todosOsDados = await resposta.json();
      renderizarFiltros();
      aplicarFiltros(); // Renderiza os cards iniciais
    } catch (error) {
      console.error("Falha ao buscar ou inicializar dados:", error);
    }
  };

  const renderizarFiltros = () => {
    const categoriasUnicas = [
      "todos",
      ...new Set(todosOsDados.map((d) => d.categoria)),
    ];
    const filtersContainer = document.createElement("div");
    filtersContainer.classList.add("filters-container");

    filtersContainer.innerHTML = categoriasUnicas
      .map(
        (categoria) => `
    <button class="filter-btn ${
      categoria === "todos" ? "active" : ""
    }" data-categoria="${categoria.toLowerCase()}">
      ${categoria}
    </button>
  `
      )
      .join("");

    cardsContainer.before(filtersContainer);

    filtersContainer.addEventListener("click", (e) => {
      const target = e.target.closest(".filter-btn");
      if (!target) return;

      categoriaAtiva = target.dataset.categoria;
      filtersContainer.querySelector(".active")?.classList.remove("active");
      target.classList.add("active");
      aplicarFiltros();
    });
  };

  const aplicarFiltros = () => {
    const termoBusca = campoBusca.value.toLowerCase();

    const porCategoria =
      categoriaAtiva === "todos"
        ? todosOsDados
        : todosOsDados.filter(
            (d) => d.categoria.toLowerCase() === categoriaAtiva
          );

    dadosFiltrados = porCategoria.filter(
      (dado) =>
        dado.titulo.toLowerCase().includes(termoBusca) ||
        dado.descricao.toLowerCase().includes(termoBusca) ||
        dado.tags.some((tag) => tag.toLowerCase().includes(termoBusca))
    );

    paginaAtual = 1;
    configurarPaginacao();
    renderizarPagina(paginaAtual);
  };

  const renderizarPagina = (pagina) => {
    paginaAtual = pagina;
    const inicio = (pagina - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const itensDaPagina = dadosFiltrados.slice(inicio, fim);

    renderizarCards(itensDaPagina);
    atualizarBotaoAtivo();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const configurarPaginacao = () => {
    paginationContainer.innerHTML = "";
    const totalPaginas = Math.ceil(dadosFiltrados.length / ITENS_POR_PAGINA);

    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.className = "page-btn";
      btn.innerText = i;
      paginationContainer.appendChild(btn);
    }
  };

  const atualizarBotaoAtivo = () => {
    paginationContainer.querySelector(".active")?.classList.remove("active");
    document.querySelectorAll(".page-btn").forEach((btn) => {
      if (parseInt(btn.innerText) === paginaAtual) {
        btn.classList.add("active");
      }
    });
  };

  const renderizarCards = (dadosParaRenderizar) => {
    if (dadosParaRenderizar.length === 0) {
      cardsContainer.innerHTML = `<p class="nenhum-resultado">Nenhum resultado encontrado. Tente um termo ou filtro diferente.</p>`;
      return;
    }
    cardsContainer.innerHTML = dadosParaRenderizar
      .map(
        (dado, index) => `
    <article class="card" style="animation-delay: ${index * 100}ms;">
          <small class="tag">${dado.categoria.toUpperCase()}</small>
          <h3>${dado.titulo}</h3>
          <p>${dado.descricao}</p>
          <div class="aplicacao">
            <strong>Na prática:</strong><br/>
            <span>${dado.aplicacao}</span>
          </div>
          <div class="tags-container">
            ${dado.tags
              .map((tag) => `<span class="tag-item">#${tag}</span>`)
              .join("")}
          </div>
    </article>
  `
      )
      .join("");
  };

  // --- Ouvintes de Eventos ---

  campoBusca.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(
      aplicarFiltros,
      INPUT_DELAY_EM_MS_PARA_PESQUISAR
    );
  });

  paginationContainer.addEventListener("click", (e) => {
    const target = e.target.closest(".page-btn");
    if (!target) return;
    renderizarPagina(parseInt(target.innerText, 10));
  });

  window.addEventListener("scroll", () => {
    backToTopBtn.classList.toggle("show", window.scrollY > 300);
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // --- Inicialização ---
  inicializar();
});
