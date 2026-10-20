"use client";
import {useEffect,useState} from "react";
import {adminUsers,type AdminUser} from "@/lib/api/admin";

export default function AdminUsersContent(){
 const [users,setUsers]=useState<AdminUser[]>([]);
 const [search,setSearch]=useState("");
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 async function load(term:string){
  setLoading(true);setError("");
  try{setUsers(await adminUsers(term))}
  catch(e){setError((e as {response?:{status?:number}}).response?.status===403?"Access administrator permission required":"Could not load users")}
  finally{setLoading(false)}
 }
 useEffect(()=>{void load("")},[]);
 return <main className="mx-auto max-w-6xl px-6 py-12">
  <h1 className="mb-6 text-3xl font-bold">User management</h1>
  <form onSubmit={e=>{e.preventDefault();void load(search)}} className="mb-6 flex gap-3">
   <input aria-label="Search users" placeholder="Email or name" value={search} onChange={e=>setSearch(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/20 bg-transparent p-3"/>
   <button className="rounded-lg bg-cyan-600 px-5 py-2">Search</button>
  </form>
  {error&&<p role="alert" className="mb-4 text-red-400">{error}</p>}
  {loading?<p>Loading…</p>:<div className="overflow-x-auto rounded-xl border border-white/15">
   <table className="w-full text-left text-sm"><thead className="bg-white/10"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Verified</th><th className="p-3">Registered</th></tr></thead>
   <tbody>{users.map(u=><tr key={u.id} className="border-t border-white/10"><td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3">{u.status}</td><td className="p-3">{u.emailVerified?"Yes":"No"}</td><td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>
  </div>}
  <p className="mt-3 text-xs text-gray-500">Showing up to 100 users. Account modifications are not enabled until audited backend actions are available.</p>
 </main>;
}
