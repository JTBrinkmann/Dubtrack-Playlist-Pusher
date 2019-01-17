# loads jquery from the CDN
loadJquery = !->
  if window.jQuery
    require \index
  else
    script = document.createElement \script
    script.onload = !->
      require \index
    script.onerror = (err) !->
      console.error err;
      alert JSON.stringify err
    script.src = \https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js
    document.head.appendChild script

loadJquery!