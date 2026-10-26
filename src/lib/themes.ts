export const themes=[
{id:"midnight-black",name:"Midnight Black",background:"#070B18",accent:"#00E5FF"},
{id:"cyber-blue",name:"Cyber Blue",background:"#050B1A",accent:"#00E5FF"},
{id:"neon-purple",name:"Neon Purple",background:"#140B2D",accent:"#A855F7"},
{id:"toxic-green",name:"Toxic Green",background:"#07150D",accent:"#39FF14"},
{id:"crimson-gaming",name:"Crimson Gaming",background:"#1C080E",accent:"#FF3355"},
{id:"golden-elite",name:"Golden Elite",background:"#191307",accent:"#FFD700"},
{id:"arctic-frost",name:"Arctic Frost",background:"#EAF4FF",accent:"#0077FF"},
{id:"synthwave",name:"Synthwave",background:"#190B23",accent:"#FF2BD6"},
{id:"inferno",name:"Inferno",background:"#1B0D07",accent:"#FF6B00"},
{id:"titanium",name:"Titanium",background:"#151B24",accent:"#CBD5E1"},
] as const;
export type ThemeId=typeof themes[number]["id"];
export const isTheme=(s:string):s is ThemeId=>themes.some(t=>t.id===s);
export function applyTheme(id:ThemeId){document.documentElement.dataset.wraplinkTheme=id;localStorage.setItem("wraplink-theme",id);window.dispatchEvent(new Event("wraplink-theme-change"));}
