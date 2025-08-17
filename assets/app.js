(function(){
  const $ = s => document.querySelector(s);
  const $all = s => Array.from(document.querySelectorAll(s));
  const year = $("#year"); if(year) year.textContent = new Date().getFullYear();

  // mobile nav
  const burger = $("#hamburger"), nav = $("#nav");
  if(burger && nav){ burger.addEventListener("click", ()=> nav.classList.toggle("open")); }

  // load categories
  const catsGrid = $("#cats-grid");
  if(catsGrid){
    fetch("data/categories.json").then(r=>r.json()).then(cats=>{
      catsGrid.innerHTML = cats.map(c=>`
        <a class="card" href="category.html?c=${c.id}">
          <div class="cat-media"><div style="font-size:42px">${c.emoji||"📦"}</div></div>
          <div class="cat-title">
            <span>${c.title}</span>
            <span class="badge">${c.badge||"جديد"}</span>
          </div>
        </a>`).join("");
    });
  }

  // load products
  fetch("data/products.json").then(r=>r.json()).then(items=>{
    // Home featured carousel
    const featured = $("#featured-row");
    if(featured){
      const lim = +featured.dataset.limit || 10;
      const list = (items.filter(i=>i.featured).slice(0,lim)).concat(
        items.filter(i=>!i.featured).slice(0, Math.max(0, lim - items.filter(i=>i.featured).length))
      );
      featured.innerHTML = list.map(card).join("");
      initDots(featured, $("#dots"));
    }

    // Category page
    const params = new URLSearchParams(location.search);
    const cat = params.get("c");
    const grid = $("#cat-grid");
    const title = $("#cat-title");
    const sort = $("#sort");

    if(grid){
      let list = items;
      if(cat && cat !== "all") list = items.filter(p=>p.category===cat);
      if(title){
        const map = {gadgets:"أدوات", home:"المنزل", accessories:"اكسسوارات", all:"الكل"};
        title.textContent = map[cat] || "المنتجات";
      }
      const render = ()=>{
        const arr = [...list];
        switch(sort?.value){
          case "new": arr.sort((a,b)=> (b.added||0)-(a.added||0)); break;
          case "price-asc": arr.sort((a,b)=> a.price-b.price); break;
          case "price-desc": arr.sort((a,b)=> b.price-a.price); break;
          default: arr.sort((a,b)=> (b.pop||0)-(a.pop||0));
        }
        grid.innerHTML = arr.map(card).join("") || placeholders(9);
      };
      sort && sort.addEventListener("change", render);
      render();
    }

    // Product detail
    const id = new URLSearchParams(location.search).get("id");
    if(location.pathname.endsWith("product.html") && id){
      const p = items.find(x=>x.id===id);
      if(!p) return;
      $("#p-img").src = p.image || "https://placehold.co/800x800/0f233b/9ecbff?text=%F0%9F%93%A6";
      $("#p-img").alt = p.title;
      $("#p-title").textContent = p.title;
      $("#p-price").textContent = p.price ? `${p.price.toFixed(2)} ر.س` : "—";
      if(p.badge) $("#p-badge").textContent = p.badge;
      $("#p-desc").textContent = p.desc || "وصف المنتج سيظهر هنا.";
      const link = $("#p-link");
      link.href = p.link || "#";
      link.textContent = p.linkLabel || "شراء عبر المتجر الرسمي";
    }
  }).catch(err=>{
    console.warn("Data load error", err);
    const featured = $("#featured-row"); if(featured) featured.innerHTML = placeholders(8);
    const grid = $("#cat-grid"); if(grid) grid.innerHTML = placeholders(9);
  });

  function card(p){
    const img = p.image || "https://placehold.co/600x600/0f233b/9ecbff?text=%F0%9F%93%A6";
    const price = p.price ? `${p.price.toFixed(2)} ر.س` : "—";
    return `<a class="card prod" href="product.html?id=${encodeURIComponent(p.id)}">
      <div class="media"><img src="${img}" alt="${escapeHTML(p.title)}"></div>
      <div class="body">
        <div class="row">
          <strong>${escapeHTML(p.title)}</strong>
          <span class="badge">${p.badge||""}</span>
        </div>
        <div class="row"><span class="price">${price}</span><span class="muted">${p.category||""}</span></div>
      </div>
    </a>`;
  }

  function placeholders(n){
    return Array.from({length:n}).map(()=>`
      <div class="card prod">
        <div class="media"></div>
        <div class="body">
          <div class="row"><strong>منتج قادم</strong><span class="badge">قريبًا</span></div>
          <div class="row"><span class="price">—</span><span class="muted">—</span></div>
        </div>
      </div>`).join("");
  }

  function initDots(scroller, dotsWrap){
    if(!scroller || !dotsWrap) return;
    const pages = Math.ceil(scroller.scrollWidth / scroller.clientWidth);
    dotsWrap.innerHTML = Array.from({length:pages}).map((_,i)=>`<button class="dot${i===0?' active':''}" data-i="${i}"></button>`).join("");
    dotsWrap.addEventListener("click", e=>{
      const i = +e.target.dataset.i; if(Number.isNaN(i)) return;
      scroller.scrollTo({left: i*scroller.clientWidth, behavior:"smooth"});
    });
    scroller.addEventListener("scroll", ()=>{
      const i = Math.round(scroller.scrollLeft / scroller.clientWidth);
      $all(".dot").forEach((d,idx)=> d.classList.toggle("active", idx===i));
    });
  }

  function escapeHTML(s){return (s+"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
})();
