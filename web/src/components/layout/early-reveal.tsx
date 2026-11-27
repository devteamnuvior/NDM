/**
 * Starts the scroll reveal of what is on the first screen as soon as the page has arrived, instead of
 * after the JavaScript has loaded and React has hydrated (which on a phone can take seconds).
 *
 * It does exactly what `useReveal` does when an element enters the view: it adds the class `in` to the
 * `.rv` elements whose top is above 90% of the window (the hook's `rootMargin: 0 0 -10% 0`) and whose box is
 * on screen. The CSS transition is the same one, it only starts earlier; the hook later finds these
 * elements already revealed and leaves them alone. Everything further down still waits for the hook.
 *
 * It does nothing when:
 *   - the visitor prefers reduced motion (the CSS shows every `.rv` element at once),
 *   - the address has a #fragment, or the page was reloaded or reached with Back / Forward (the browser may
 *     still move the scroll position, so the first screen is not known yet),
 *   - the page is not at the top.
 *
 * Suspense: a section that waits for data is first sent as its fallback and swapped for the real content
 * further down the HTML (Pricing's header is one). Revealing a fallback would show it fading in and then
 * being replaced by a hidden copy that fades in again. So the pass runs when the whole HTML has been read
 * (DOMContentLoaded: every boundary of a prerendered page has been swapped by then), and anything still
 * inside a pending boundary (between React's `<!--$?-->` and its closing `<!--/$-->`) is skipped.
 *
 * Rendered at the end of <body>. It is a plain inline script and is not run again on navigations inside
 * the site (React does not run scripts it inserts); there the hook reveals the new page as before.
 */
const SCRIPT = `(function(){try{
var w=window,d=document;
if(w.matchMedia("(prefers-reduced-motion: reduce)").matches||location.hash)return;
var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];
if(n&&(n.type==="reload"||n.type==="back_forward"))return;
function pending(){var s=[],t=d.createTreeWalker(d.body,128),c,x,k;
while((c=t.nextNode()))if(c.data==="$?"||c.data==="$!"){k=0;for(x=c.nextSibling;x;x=x.nextSibling){
if(x.nodeType===8){if(x.data==="/$"){if(!k)break;k--;}else if(x.data.charAt(0)==="$")k++;}else s.push(x);}}
return s;}
function inside(e,s){for(;e;e=e.parentNode)if(s.indexOf(e)>=0)return true;return false;}
function run(){if(w.scrollY>0)return;
var s=pending(),h=w.innerHeight,vw=w.innerWidth,line=h*0.9,els=d.querySelectorAll(".rv:not(.in)"),hit=[],i,r;
for(i=0;i<els.length;i++){r=els[i].getBoundingClientRect();
if((r.width||r.height)&&r.top<line&&r.bottom>0&&r.left<vw&&r.right>0&&!(s.length&&inside(els[i],s)))hit.push(els[i]);}
for(i=0;i<hit.length;i++)hit[i].classList.add("in");}
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",run,{once:true});else run();
}catch(e){}})();`;

export function EarlyReveal() {
  /* production only: in development React reports the added class as a hydration difference */
  if (process.env.NODE_ENV !== "production") return null;
  return <script id="ndm-early-reveal" dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
