let cardsContainer = document.querySelector(".cards-container");
let campoBusca = document.querySelector("#search");
let dados = [];
let categoriaAtiva = "todos"; // Controla o filtro de categoria ativo
let debounceTimer; // Timer para o delay da busca

// Função principal que carrega os dados e inicializa a aplicação
async function inicializar() {
  try {
    const resposta = await fetch("data.json");
    dados = await resposta.json();
    renderizarFiltros();
    aplicarFiltros(); // Renderiza os cards iniciais
  } catch (error) {
    console.error("Falha ao buscar ou inicializar dados:", error);
  }
}

// Extrai categorias únicas e cria os botões de filtro
function renderizarFiltros() {
  const categoriasUnicas = ["todos", ...new Set(dados.map((d) => d.categoria))];
  const filtersContainer = document.createElement("div");
  filtersContainer.classList.add("filters-container");

  categoriasUnicas.forEach((categoria) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = categoria;
    btn.dataset.categoria = categoria.toLowerCase();
    if (categoria.toLowerCase() === categoriaAtiva) {
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      categoriaAtiva = categoria.toLowerCase();
      // Atualiza o estado ativo dos botões
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      aplicarFiltros();
    });
    filtersContainer.appendChild(btn);
  });

  // Insere os filtros antes do container de cards
  cardsContainer.before(filtersContainer);
}

// Função central que aplica o filtro de categoria e a busca por texto
function aplicarFiltros() {
  // 1. Filtra por categoria
  let dadosFiltradosPorCategoria = dados;
  if (categoriaAtiva !== "todos") {
    dadosFiltradosPorCategoria = dados.filter(
      (dado) => dado.categoria.toLowerCase() === categoriaAtiva
    );
  }

  // 2. Filtra pelo termo de busca
  const termoBusca = campoBusca.value.toLowerCase();
  const dadosFiltradosFinal = dadosFiltradosPorCategoria.filter(
    (dado) =>
      dado.titulo.toLowerCase().includes(termoBusca) ||
      dado.descricao.toLowerCase().includes(termoBusca) ||
      dado.tags.some((tag) => tag.toLowerCase().includes(termoBusca))
  );

  renderizarCards(dadosFiltradosFinal);
}

function renderizarCards(dados) {
  cardsContainer.innerHTML = ""; // Limpa os cards existentes antes de renderizar novos
  dados.forEach((dado, index) => {
    let article = document.createElement("article");
    article.classList.add("card");
    // Adiciona um atraso escalonado para a animação de entrada
    article.style.animationDelay = `${index * 100}ms`;
    article.innerHTML = `
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
        `;
    cardsContainer.appendChild(article);
  });
}

// Adiciona o ouvinte de evento para a busca em tempo real
campoBusca.addEventListener("input", () => {
  // Limpa o timer anterior para reiniciar a contagem
  clearTimeout(debounceTimer);
  // Define um novo timer para executar a busca após um pequeno atraso
  const delayInMs = 600;
  debounceTimer = setTimeout(aplicarFiltros, delayInMs);
});

// Inicia a aplicação
inicializar();

// --- Lógica para o botão "Voltar para o Topo" ---
const backToTopBtn = document.getElementById("back-to-top-btn");

// Mostra ou esconde o botão baseado na posição do scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    // Mostra o botão após rolar 300px
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
});

// Rola para o campo de busca ao clicar
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
