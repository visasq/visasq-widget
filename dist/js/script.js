(function() {
  var card = document.querySelector('a.visasq-cards');
  var width = card.getAttribute('width') || '160px';
  card.style.display = 'none';

  var img = document.createElement('img');
  img.setAttribute('src', 'https://raw.githubusercontent.com/visasq/visasq-widget/v1/assets/img/eol.png');
  img.setAttribute('width', width);

  card.parentElement.insertBefore(img, card)
})();

