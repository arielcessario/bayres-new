// Create cross browser requestAnimationFrame method:
window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(f){setTimeout(f, 1000/60)};

var  scrollheight = document.body.scrollHeight; // altura de todo el documento
var  WindowHeight = window.innerHeight; // altura de la ventana del navegador

var sucursal1 = document.getElementById('sucursal1');
var sucursal2 = document.getElementById('sucursal2');
var sucursal3 = document.getElementById('sucursal3');
var sucursal4 = document.getElementById('sucursal4');

var tierra1 = document.getElementById('tierra1');
var tierra2 = document.getElementById('tierra2');
var tierra3 = document.getElementById('tierra3');

var roca1 = document.getElementById('roca1');
var roca2 = document.getElementById('roca2');
var roca3 = document.getElementById('roca3');

var lava1 = document.getElementById('lava1');
var lava2 = document.getElementById('lava2');
var lava3 = document.getElementById('lava3');

function parallaxbubbles(){
    var scrolltop = window.pageYOffset; // get number of pixels document has scrolled vertically
    //var scrollamount = (scrollTop / (scrollheight-WindowHeight)) * 100 // Obtener cantidad desplaza (en%)
    //console.log(scrollamount);

    sucursal1.style.top = -scrolltop * .2 + 'px'; // move bubble1 at 20% of scroll rate
    sucursal2.style.top = -scrolltop * .4 + 'px'; // move bubble2 at 50% of scroll rate
    sucursal3.style.top = -scrolltop * .6 + 'px'; // move bubble2 at 50% of scroll rate
    sucursal4.style.top = -scrolltop * .7 + 'px'; // move bubble2 at 50% of scroll rate

    tierra1.style.top = -scrolltop * .2 + 'px'; // move bubble1 at 20% of scroll rate
    tierra2.style.top = -scrolltop * .4 + 'px'; // move bubble2 at 50% of scroll rate
    tierra3.style.top = -scrolltop * .6 + 'px'; // move bubble2 at 50% of scroll rate

    roca1.style.top = -scrolltop * .2 + 'px'; // move bubble1 at 20% of scroll rate
    roca2.style.top = -scrolltop * .4 + 'px'; // move bubble2 at 50% of scroll rate
    roca3.style.top = -scrolltop * .6 + 'px'; // move bubble2 at 50% of scroll rate

    lava1.style.top = -scrolltop * .2 + 'px'; // move bubble1 at 20% of scroll rate
    lava2.style.top = -scrolltop * .4 + 'px'; // move bubble2 at 50% of scroll rate
    lava3.style.top = -scrolltop * .6 + 'px'; // move bubble2 at 50% of scroll rate
}

window.addEventListener('scroll', function(){ // on page scroll
    requestAnimationFrame(parallaxbubbles); // call parallaxbubbles() on next available screen paint
}, false)