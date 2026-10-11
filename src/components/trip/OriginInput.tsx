import React, { useState, useRef, useEffect } from 'react';
import { LocationPoint } from '../../types';
import { isWithinServiceArea } from '../../hooks/useGeolocation';
import { DEMO_ORIGIN_LOCATIONS, DEMO_STORES } from '../../data/stores';
type SearchPlace = {label:string; lat:number; lng:number};
const addressCache = new Map<string, SearchPlace[]>();
export function OriginInput({onSelect}: {onSelect: (point: LocationPoint) => void}) {
 const [query,setQuery] = useState('');
 const [name,setName] = useState('My starting point');
 const [lat,setLat] = useState('');
 const [lng,setLng] = useState('');
 const [error,setError] = useState('');
 const [results,setResults] = useState<SearchPlace[]>([]);
 const [busy,setBusy] = useState(false);
 const requestRef = useRef<AbortController | null>(null);
 const lastSearch = useRef(0);
 useEffect(() => () => requestRef.current?.abort(), []);
 const search = async () => {
  if (!query.trim() || busy || Date.now()-lastSearch.current < 1200) return;
  lastSearch.current=Date.now(); setBusy(true);setError('');setResults([]);
  const term=query.trim();const request=new AbortController();requestRef.current=request;
  const timeout=window.setTimeout(()=>request.abort(),12000);
  try {
   let found=addressCache.get(term);
   if (!found) {
    const params=new URLSearchParams({q:term,limit:'5',lang:'en',bbox:'-79.15,35.85,-78.85,36.05'});
    const response=await fetch(`https://photon.komoot.io/api/?${params}`,{signal:request.signal});
    if (!response.ok) throw new Error('Search unavailable');
    const data=await response.json();
    found=(Array.isArray(data.features)?data.features:[]).flatMap((place: {geometry?:{coordinates?:number[]};properties?:Record<string,string>})=>{
     const coords=place.geometry?.coordinates;const p=place.properties;
     if (!coords || !p || !isWithinServiceArea(coords[1],coords[0])) return [];
     const label=[p.name,[p.housenumber,p.street].filter(Boolean).join(' '),p.city,p.state].filter(Boolean).join(', ');
     return [{label:label || term,lat:coords[1],lng:coords[0]}];
    });
    addressCache.set(term,found!);
   }
   if (!request.signal.aborted) {setResults(found!);if(!found!.length)setError('No address found in the demo area. Try a fuller address or use coordinates.');}
  } catch {if(requestRef.current===request)setError('Address search is unavailable. Use a local place, GPS or coordinates instead.');}
  finally {window.clearTimeout(timeout);if(requestRef.current===request)setBusy(false);}
 };

 const places = [...DEMO_ORIGIN_LOCATIONS.map(p => ({label:p.label,lat:p.lat,lng:p.lng})), ...DEMO_STORES.map(p => ({label:`${p.name}, ${p.address}`,lat:p.lat,lng:p.lng}))];
 const matches = query.trim() ? places.filter(p => p.label.toLowerCase().includes(query.trim().toLowerCase())) : [];
 const apply = (latitude:number,longitude:number,label:string) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !isWithinServiceArea(latitude,longitude)) {setError('Choose coordinates within Chapel Hill, Carrboro or Durham. Your current origin has not changed.');return;}
  onSelect({lat:latitude,lng:longitude,label,source:'manual',capturedAt:new Date().toISOString()});
 };
 return <div>
  <form className="origin-form" onSubmit={e=>{e.preventDefault();void search();}}><label htmlFor="origin-place">Address or place</label><input id="origin-place" value={query} disabled={busy} onChange={e=>{setQuery(e.target.value);setResults([]);setError('');}} placeholder="e.g. 208 W Franklin St, Chapel Hill" required /><button className="p-2 rounded-lg bg-brand-primary text-white" disabled={busy || !query.trim()}>{busy?'Searching…':'Search address'}</button><p className="text-xs text-brand-muted">Address search uses Photon. <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">© OpenStreetMap contributors</a></p></form>
  {error && <p role="alert" className="text-sm text-red-700 py-2">{error}</p>}
  <ul aria-label="Address results">{results.map((p,i)=><li key={i}><button className="text-left w-full p-3 border rounded-lg text-sm hover:bg-brand-subtle" onClick={()=>apply(p.lat,p.lng,p.label)}>{p.label}</button></li>)}</ul>
  <ul>{matches.map(p=><li key={p.label}><button className="text-left w-full p-3 border rounded-lg text-sm" onClick={()=>apply(p.lat,p.lng,p.label)}>{p.label}</button></li>)}</ul>
  
  <details><summary>Enter a custom origin</summary><form className="origin-form" onSubmit={e=>{e.preventDefault();if(lat.trim() && lng.trim())apply(Number(lat),Number(lng),name.trim());}}>
   <label htmlFor="origin-name">Address or location name</label><input id="origin-name" value={name} onChange={e=>setName(e.target.value)} required />
   <p className="text-xs text-brand-muted">The coordinates set the map position; the address is its label.</p>
   <label htmlFor="origin-lat">Latitude</label><input id="origin-lat" type="number" step="any" min="-90" max="90" value={lat} onChange={e=>setLat(e.target.value)} required />
   <label htmlFor="origin-lng">Longitude</label><input id="origin-lng" type="number" step="any" min="-180" max="180" value={lng} onChange={e=>setLng(e.target.value)} required />

   <button className="p-2 rounded-lg bg-brand-primary text-white">Use this origin</button>
  </form></details>
 </div>;
}
