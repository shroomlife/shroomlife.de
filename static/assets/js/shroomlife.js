// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('worker.js', {
      scope: '/'
    })
    .then(function () {})
    .catch(function (error) {
      console.log('Service worker registration failed, error:', error)
    })
}

function getRandomColor () {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function hexToRgb (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

$(document).ready(function () {
  const color1 = getRandomColor()
  const rgb1 = hexToRgb(color1)
  const colorString1 = 'rgba(' + rgb1.r + ',' + rgb1.g + ',' + rgb1.r + ',.33)'
  $('.layer1, .layer1 *').css('background-color', colorString1)

  lazyload()

  $('.grid.instagram').masonry()

  $('.grid.instagram .grid-item a').each(function () {
    const item = $(this)
    const text = item.attr('data-title')
    const likes = parseInt(item.attr('data-likes'))
    const comments = parseInt(item.attr('data-comments'))
    const time = item.attr('data-time')

    const tip = $(document.createElement('div'))

    tip.append('<p class="caption">' + text + '</p>')

    const tipFooter = $(document.createElement('div'))
    tipFooter.addClass('tippy-footer')

    tipFooter.append(
      '<span class="likes"><i class="fas fa-heart"></i> ' + likes + '</span>'
    )
    tipFooter.append(
      '<span class="likes"><i class="fas fa-comment"></i> ' +
        comments +
        '</span>'
    )
    tipFooter.append(
      '<span class="time">' + moment(time * 1000).fromNow() + '</span>'
    )

    tip.append(tipFooter)
    item.data('tippy', tip.html())
  })

  $('.grid.instagram .grid-item a').each(function () {
    const item = $(this)

    tippy(item[0], {
      content: item.data('tippy'),
      theme: 'light',
      interactive: true
    })
  })
})
