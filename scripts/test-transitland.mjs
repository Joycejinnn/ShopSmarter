import { readFileSync } from 'node:fs';
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const match = env.match(/^\s*TRANSITLAND_API_KEY\s*=\s*(.*?)\s*$/m);
const key = match?.[1].replace(/^(["'])(.*)\1$/, '$2');
if (!key) { console.error('Missing TRANSITLAND_API_KEY in .env.local'); process.exit(1); }
const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:'America/New_York', year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
const params = new URLSearchParams({fromPlace:'35.9132,-79.0558',toPlace:'35.9967,-78.902',date:`${parts.year}-${parts.month}-${parts.day}`,time:'12:00',maxItineraries:'3',useFallbackDates:'false'});
try {
 const response=await fetch(`https://transit.land/api/v2/routing/otp/plan?${params}`,{headers:{apikey:key},signal:AbortSignal.timeout(30000)});
 console.log(`HTTP ${response.status}`);
 if(!response.ok) { console.log(({401:'Authentication failed: check the key.',403:'Access denied: check Routing API subscription.',429:'Rate limit or quota reached.'})[response.status] || 'Provider request failed.');process.exitCode=1; }
 else {
  const data=await response.json();const trips=data.plan?.itineraries;
  if (!Array.isArray(trips)) {console.log('Unexpected API response: routing availability not confirmed.');process.exitCode=1;}
  else {console.log(`Routing API responded. Itineraries: ${trips.length}`);for(const trip of trips)console.log(JSON.stringify({durationMinutes:Math.round(trip.duration/60),legs:trip.legs?.map(l=>({mode:l.mode,route:l.routeShortName || l.route,from:l.from?.name,to:l.to?.name}))}));if(!trips.length)console.log('No route at this date/time; credentials alone do not guarantee local service coverage.');}
 }
} catch {console.error('Network request failed or timed out; key was not logged.');process.exitCode=1;}
