"use client";
import {useEffect,useState} from "react";
import {apiClient} from "@/lib/api/client";
import {applyTheme,isTheme,themes,type ThemeId} from "@/lib/themes";
export default function ThemePicker({locale}:{locale:string}){
 const [selected,setSelected]=useState<ThemeId>("midnight-black");
 const [message,setMessage]=useState("");
 useEffect(()=>{const local=localStorage.getItem("wraplink-theme");if(local&&isTheme(local))setSelected(local);void apiClient.get<{theme:string}>("/api/v1/me/appearance").then(({data})=>{if(isTheme(data.theme)){setSelected(data.theme);applyTheme(data.theme)}}).catch(()=>{})},[]);
 async function choose(id:ThemeId){const previous=selected;setSelected(id);applyTheme(id);setMessage("");try{await apiClient.put("/api/v1/me/appearance",{theme:id});setMessage(locale==="fa"?"پوسته ذخیره شد":"Theme saved")}catch{setMessage(locale==="fa"?"ذخیره روی سرور انجام نشد":"Could not sync theme to account");/* keep local preference */}}
 return <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8"><h2 className="text-xl font-bold">{locale==="fa"?"ظاهر و پوسته‌ها":"Appearance & Themes"}</h2><p className="mt-2 text-sm text-gray-400">{locale==="fa"?"پوسته دلخواه خود را انتخاب کنید":"Choose your gaming dashboard theme"}</p><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{themes.map(t=><button type="button" key={t.id} onClick={()=>void choose(t.id)} aria-pressed={selected===t.id} className="overflow-hidden rounded-2xl border p-2 text-left transition hover:scale-[1.03]" style={{borderColor:selected===t.id?t.accent:"#ffffff30",background:t.background}}><div className="h-20 rounded-xl p-3" style={{background:`linear-gradient(135deg,${t.background},${t.accent}55)`}}><div className="h-3 w-1/2 rounded-full" style={{background:t.accent}}/><div className="mt-3 flex gap-2"><div className="h-8 w-1/3 rounded-lg" style={{background:t.accent,opacity:.55}}/><div className="h-8 flex-1 rounded-lg bg-white/10"/></div></div><span className="block px-2 py-3 text-sm font-semibold text-white">{t.name}</span></button>)}</div><p role="status" className="mt-3 text-sm text-cyan-300">{message}</p></section>
}
