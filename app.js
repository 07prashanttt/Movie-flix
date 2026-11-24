
const demoVideo =
"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const items = [
 {id:1,title:"Big Buck Bunny",type:"movie",genre:"Animation",emoji:"🐰",url:"https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"},
 {id:2,title:"Sintel",type:"movie",genre:"Adventure",emoji:"🐉",url:"https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"},
 {id:3,title:"Tears of Steel",type:"movie",genre:"Sci-Fi",emoji:"🤖",url:"https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"},
 {id:4,title:"Nature World",type:"series",genre:"Documentary",emoji:"🌍",url:"https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"},
 {id:5,title:"Adventure Life",type:"series",genre:"Adventure",emoji:"🏔️",url:"https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"},
 {id:6,title:"Creative World",type:"series",genre:"Entertainment",emoji:"🎬",url:"https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"}
];

const channels = [
 {id:101,title:"Demo Live Channel 1",emoji:"📺",url:demoVideo},
 {id:102,title:"Demo Live Channel 2",emoji:"🌍",url:demoVideo},
 {id:103,title:"Demo Live Channel 3",emoji:"🎥",url:demoVideo}
];

const $ = id => document.getElementById(id);
let page = "home";
let search = "";
let hls = null;
let installPrompt = null;

function getList(){
 try{return JSON.parse(localStorage.getItem("pflist")||"[]")}
 catch{return []}
}

function saveList(list){
 localStorage.setItem("pflist",JSON.stringify(list));
}

function card(item){
 const saved=getList().includes(item.id);
 return `
 <article class="movie-card">
  <div class="poster" data-play="${item.id}">
   <div><span>${item.emoji}</span><strong>${item.title}</strong></div>
  </div>
  <h3>${item.title}</h3>
  <p>${item.type.toUpperCase()} · ${item.genre}</p>
  <div class="card-actions">
   <button data-play="${item.id}">▶ Play</button>
   <button data-save="${item.id}">${saved?"✓ Saved":"+ List"}</button>
  </div>
 </article>`;
}

function channelCard(channel){
 return `
 <article class="movie-card">
  <div class="poster" data-channel="${channel.id}">
   <div><span>${channel.emoji}</span><strong>${channel.title}</strong></div>
  </div>
  <h3>🔴 ${channel.title}</h3>
  <p>DEMO STREAM</p>
  <div class="card-actions">
   <button data-channel="${channel.id}">▶ Watch Live</button>
  </div>
 </article>`;
}

function render(){
 const q=search.toLowerCase();
 const found=items.filter(x=>x.title.toLowerCase().includes(q)||x.genre.toLowerCase().includes(q));
 const movies=found.filter(x=>x.type==="movie");
 const series=found.filter(x=>x.type==="series");

 $("content").innerHTML="";
 let html="";

 if(page==="home"){
  html=`<h2>🔥 Trending Now</h2><div class="movie-grid">${found.slice(0,6).map(card).join("")}</div>
  <h2>🎬 Movies</h2><div class="movie-grid">${movies.map(card).join("")}</div>
  <h2>📺 Web Series</h2><div class="movie-grid">${series.map(card).join("")}</div>`;
 }
 if(page==="movies"){
  html=`<h2>🎬 All Movies</h2><div class="movie-grid">${movies.map(card).join("")}</div>`;
 }
 if(page==="series"){
  html=`<h2>📺 Web Series</h2><div class="movie-grid">${series.map(card).join("")}</div>`;
 }
 if(page==="live"){
  html=`<h2>🔴 Live TV</h2><p class="empty">These are demonstration streams, not real television channels.</p><div class="movie-grid">${channels.map(channelCard).join("")}</div>`;
 }
 if(page==="mylist"){
  const saved=items.filter(x=>getList().includes(x.id));
  html=`<h2>❤️ My List</h2><div class="movie-grid">${saved.map(card).join("")}</div>`;
 }
 $("content").innerHTML=html || `<p class="empty">No content found.</p>`;
 document.querySelectorAll(".nav-btn").forEach(b=>{
  b.classList.toggle("active",b.dataset.page===page);
 });
}

function playVideo(title,url){
 const video=$("videoPlayer");
 $("playerTitle").textContent=title;
 $("playerInfo").textContent="Demo video stream";
 $("playerModal").classList.remove("hidden");
 if(hls){hls.destroy();hls=null}
 video.pause();
 video.removeAttribute("src");
 video.load();

 if(url.includes(".m3u8") && window.Hls && Hls.isSupported()){
  hls=new Hls();
  hls.loadSource(url);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED,()=>video.play().catch(()=>{}));
 }else if(video.canPlayType("application/vnd.apple.mpegurl") && url.includes(".m3u8")){
  video.src=url;
  video.play().catch(()=>{});
 }else{
  video.src=url;
  video.play().catch(()=>{});
 }
}

function closePlayer(){
 const video=$("videoPlayer");
 video.pause();
 video.removeAttribute("src");
 video.load();
 if(hls){hls.destroy();hls=null}
 $("playerModal").classList.add("hidden");
}

document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-page]");
 if(nav){page=nav.dataset.page;render();return}

 const play=e.target.closest("[data-play]");
 if(play){
  const item=items.find(x=>x.id===Number(play.dataset.play));
  if(item)playVideo(item.title,item.url);
  return;
 }

 const channel=e.target.closest("[data-channel]");
 if(channel){
  const item=channels.find(x=>x.id===Number(channel.dataset.channel));
  if(item)playVideo(item.title,item.url);
  return;
 }

 const save=e.target.closest("[data-save]");
 if(save){
  const id=Number(save.dataset.save);
  let list=getList();
  list=list.includes(id)?list.filter(x=>x!==id):[...list,id];
  saveList(list);
  render();
 }
});

$("search").addEventListener("input",e=>{
 search=e.target.value.trim();
 render();
});

$("closePlayer").addEventListener("click",closePlayer);
$("heroPlay").addEventListener("click",()=>{
 page="movies";render();
});
$("playerModal").addEventListener("click",e=>{
 if(e.target===$("playerModal"))closePlayer();
});

window.addEventListener("beforeinstallprompt",e=>{
 e.preventDefault();
 installPrompt=e;
 $("installBtn").classList.remove("hidden");
});

$("installBtn").addEventListener("click",async()=>{
 if(!installPrompt)return;
 installPrompt.prompt();
 await installPrompt.userChoice;
 installPrompt=null;
 $("installBtn").classList.add("hidden");
});

if("serviceWorker" in navigator){
 window.addEventListener("load",()=>{
  navigator.serviceWorker.register("./sw.js").catch(console.error);
 });
}

render();
