// public/js/detalhes.js
$(document).ready(function () {
  let notaSelecionada = 0;

  // Hover e clique nas estrelas do formulário
  $(document).on('mouseenter', '.estrela-input', function () {
    const nota = $(this).data('nota');
    atualizarVisualEstrelas(nota);
  });

  $(document).on('mouseleave', '#estrelas-input', function () {
    atualizarVisualEstrelas(notaSelecionada);
  });

  $(document).on('click', '.estrela-input', function () {
    notaSelecionada = $(this).data('nota');
    $('#nota').val(notaSelecionada);
    atualizarVisualEstrelas(notaSelecionada);
  });

  function atualizarVisualEstrelas(nota) {
    $('.estrela-input').each(function () {
      const n = $(this).data('nota');
      if (n <= nota) {
        $(this).removeClass('bi-star').addClass('bi-star-fill').css('color', '#ffc107');
      } else {
        $(this).removeClass('bi-star-fill').addClass('bi-star').css('color', '#ccc');
      }
    });
  }

  // Envio do formulário via AJAX
  $('#form-avaliacao').on('submit', function (e) {
    e.preventDefault();

    const id = $('#estabelecimento_id').val();
    const nota = parseInt($('#nota').val());
    const comentario = $('#comentario').val().trim();

    if (!nota || nota < 1 || nota > 5) {
      mostrarToast('Selecione uma nota de 1 a 5 estrelas!', 'danger');
      return;
    }

    $.ajax({
      url: `/api/estabelecimentos/${id}/avaliacoes`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ nota, comentario }),
      success: function () {
        mostrarToast('Avaliação enviada com sucesso! Recarregando...', 'success');
        setTimeout(() => location.reload(), 1200);
      },
      error: function (xhr) {
        mostrarToast('Erro ao enviar avaliação: ' + (xhr.responseJSON?.error || 'tente novamente'), 'danger');
      }
    });
  });

  function mostrarToast(msg, tipo = 'success') {
    const toast = $('#toast');
    toast.removeClass('bg-success bg-danger bg-warning').addClass(`bg-${tipo}`);
    $('#toast-msg').text(msg);
    new bootstrap.Toast(toast[0]).show();
  }
});