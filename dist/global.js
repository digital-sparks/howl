(()=>{new EventSource("http://localhost:3000/esbuild").addEventListener("change",()=>location.reload());window.Webflow||(window.Webflow=[]);window.Webflow.push(()=>{console.log("hello");let t=setInterval(function(){window.Vimeo&&window.Vimeo.Player&&(clearInterval(t),i())},50);function i(){document.querySelectorAll("div[vimeo-data-id]").forEach(e=>{let o=e.getAttribute("vimeo-data-id");if(o){let n={id:o,background:!0,loop:!0,autoplay:!0,muted:!0,dnt:!0},d=new Vimeo.Player(e,n)}})}});})();
