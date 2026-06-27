$(document).ready(function () {
  carregarEstabelecimentos();

  // Cadastro via AJAX
  $('#form-cadastro').on('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const form = this;

    $.ajax({
      url: '/api/estabelecimentos',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function () {
        $('#modalCadastro').modal('hide');
        form.reset();
        carregarEstabelecimentos();
      }
    });
  });

  // Avaliação por estrelas (delegada)
  $(document).on('click', '.enviar-avaliacao', function () {
    const card = $(this).closest('.card');
    const id = card.data('id');
    const nota = card.find('.estrela.ativa').last().data('nota') || 0;
    const comentario = card.find('.comentario-input').val() || '';

    if (!nota) {
      alert('Selecione pelo menos uma estrela!');
      return;
    }

    $.post(`/api/estabelecimentos/${id}/avaliacoes`, { nota, comentario }, function () {
      carregarEstabelecimentos();
    });
  });

  // Hover das estrelas
  $(document).on('mouseenter', '.estrela', function () {
    const nota = $(this).data('nota');
    $(this).closest('.estrelas-ativas').find('.estrela').each(function () {
      $(this).toggleClass('ativa', $(this).data('nota') <= nota);
    });
  });

// public/js/main.js (trecho da função carregarEstabelecimentos)
function carregarEstabelecimentos() {
  $.get('/api/estabelecimentos', function (data) {
    let html = '';
    data.forEach(est => {
      const estrelasHTML = gerarEstrelas(est.media_estrelas);
      html += `
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm card-link" 
               data-id="${est.id}" 
               style="cursor: pointer; transition: transform 0.2s;"
               onmouseover="this.style.transform='translateY(-4px)'"
               onmouseout="this.style.transform='translateY(0)'">
            <img src="${est.foto_url || '/img/default.jpg'}" 
                 class="card-img-top" 
                 alt="${est.nome}"
                 style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">${est.nome}</h5>
              <p class="card-text">
                ${est.endereco}<br>
                <span class="badge bg-info">${est.categoria}</span>
              </p>
              <div class="media-estrelas">
                ${estrelasHTML}
                <small class="text-muted">
                  (${parseFloat(est.media_estrelas).toFixed(1)} — ${est.total_avaliacoes})
                </small>
              </div>
            </div>
            <div class="card-footer bg-transparent">
              <small class="text-muted">
                <i class="bi bi-eye"></i> Clique para ver detalhes
              </small>
            </div>
          </div>
        </div>`;
    });
    $('#lista-estabelecimentos').html(html);
  });
}

// 🆕 Redireciona ao clicar no card (mas NÃO interfere nos botões internos)
$(document).on('click', '.card-link', function (e) {
  // Ignora cliques em botões, inputs e estrelas dentro do card
  if ($(e.target).closest('button, input, .estrela, .estrelas-ativas, .enviar-avaliacao').length) {
    return;
  }
  const id = $(this).data('id');
  window.location.href = `/estabelecimento/${id}`;
});

  function gerarEstrelas(media) {
    let html = '';
    const arredondada = Math.round(media);
    for (let i = 1; i <= 5; i++) {
      html += i <= arredondada
        ? '<i class="bi bi-star-fill text-warning"></i>'
        : '<i class="bi bi-star text-warning"></i>';
    }
    return html;
  }
});