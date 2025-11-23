let cardsContainer = document.querySelector(".cards-container");
let campoBusca = document.querySelector("#search");
let dados = [];

async function iniciarBusca() {
  // Se os dados ainda não foram carregados, busca do JSON.
  if (dados.length === 0) {
    try {
      let resposta = await fetch("data.json");
      dados = await resposta.json();
    } catch (error) {
      console.error("Falha ao buscar dados:", error);
      return; // Interrompe a execução se houver erro
    }
  }

  if (!campoBusca) {
    console.warn("Campo de busca não encontrado.");
    return;
  }

  const termoBusca = campoBusca.value.toLowerCase();
  const dadosFiltrados = dados.filter(
    (dado) =>
      dado.titulo.toLowerCase().includes(termoBusca) ||
      dado.descricao.toLowerCase().includes(termoBusca) ||
      dado.tags.some((tag) => tag.toLowerCase().includes(termoBusca))
  );

  renderizarCards(dadosFiltrados);
}

function renderizarCards(dados) {
  cardsContainer.innerHTML = ""; // Limpa os cards existentes antes de renderizar novos
  for (let dado of dados) {
    let article = document.createElement("article");
    article.classList.add("card");
    article.innerHTML = `
          <small class="tag">${dado.categoria}</small>
          <h3>${dado.titulo}</h3>
          <p>
            ${dado.descricao}
          </p>
          <div>
            <strong>Na prática: </strong
            ><br/><span
              >${dado.aplicacao}</span
            >
          </div>
        `;
    cardsContainer.appendChild(article);
  }
}
