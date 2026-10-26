"use client";

import { useMemo, useState } from "react";
import { CalendarDays, MapPin, Search, ArrowUpRight, Ticket, Sparkles, LayoutDashboard, Plus, Users, ChartNoAxesCombined } from "lucide-react";
import { demoEvents } from "@/lib/demo-data";

type EventItem = typeof demoEvents[number];
const categories = ["All events", "Technology", "Music", "Design"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All events");
  const [view, setView] = useState<"discover"|"dashboard"|"create">("discover");
  const [notice, setNotice] = useState("");
  const events = useMemo(() => demoEvents.filter(e =>
    (category === "All events" || e.category === category) &&
    (e.title + e.city + e.venue + e.description).toLowerCase().includes(query.toLowerCase())
  ), [query, category]);

  return <main>
    <header className="nav"><div className="shell" style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
      <div className="brand"><span className="brand-mark"><Ticket size={19}/></span> gatherly<span style={{color:"#6c55ed"}}>.</span></div>
      <nav className="navlinks">
        <a href="#events" onClick={()=>setView("discover")}>Discover</a>
        <a href="#organizers" onClick={()=>setView("dashboard")}>For organizers</a>
        <button className="btn" onClick={()=>setNotice("Demo mode: connect authentication to enable account registration.")}>Sign in <ArrowUpRight size={14} style={{display:"inline",marginLeft:5}}/></button>
      </nav>
    </div></header>
    <div className="shell">
      <section className="hero">
        <div className="eyebrow"><Sparkles size={13} style={{display:"inline",marginRight:7}}/> FIND YOUR NEXT MOMENT</div>
        <h1>Good things happen when we <span style={{color:"#c9c0ff"}}>gather.</span></h1>
        <p>Discover experiences, meet your people, and make room for something unforgettable.</p>
        <div className="searchbar"><Search size={19} color="#818797" style={{margin:"auto 0 auto 9px"}}/><input aria-label="Search events" placeholder="Search events, venues, or cities..." value={query} onChange={e=>setQuery(e.target.value)}/><button className="btn" onClick={()=>document.getElementById("events")?.scrollIntoView({behavior:"smooth"})}>Explore events</button></div>
        <div style={{display:"flex",gap:22,marginTop:25,fontSize:12,color:"#d7d1ff"}}><span>✦ Curated experiences</span><span>✦ Easy reservations</span><span>✦ Your city, your vibe</span></div>
      </section>

      {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice("")} style={{float:"right",border:0,background:"transparent"}}>✕</button></div>}

      <section id="events">
        <div className="section-head"><div><div className="eyebrow" style={{color:"#7562df"}}>THE GOOD STUFF</div><h2 style={{marginTop:8}}>Events worth showing up for</h2><p className="muted" style={{marginTop:8}}>A little inspiration for your next big memory.</p></div><span className="muted">{events.length} experiences</span></div>
        <div className="filters">{categories.map(c=><button key={c} className={"chip "+(category===c?"active":"")} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="events">
          {events.map((e: EventItem)=><article className="event-card" key={e.id}>
            <div className={"event-art "+e.color}><span className="tag">{e.tag}</span><span>{e.category==="Technology"?"FUTURE / TECH":e.category==="Music"?"INDIE / LIVE":"DESIGN / LAB"}</span></div>
            <div className="event-body"><div className="muted" style={{color:"#7966e6",fontWeight:800,letterSpacing:".7px",fontSize:10}}>{e.category.toUpperCase()}</div><h3 style={{marginTop:7}}>{e.title}</h3><p>{e.description}</p>
              <div className="event-meta"><CalendarDays size={14}/>{e.date}</div><div className="event-meta"><MapPin size={14}/>{e.venue}, {e.city}</div>
              <div className="card-foot"><div className="price">₹{e.price.toLocaleString("en-IN")} <small>/ person</small></div><button className="btn" onClick={()=>setNotice(`${e.title}: demo ticket selection. Connect the database and reservation API to enable 10-minute holds.`)}>Get tickets <ArrowUpRight size={14} style={{display:"inline",marginLeft:3}}/></button></div>
            </div>
          </article>)}
        </div>
        {events.length===0 && <div className="panel" style={{textAlign:"center",padding:50}}>No events found. Try a different search.</div>}
      </section>

      <section id="organizers" style={{marginTop:52}}>
        <div className="section-head"><div><div className="eyebrow" style={{color:"#7562df"}}>BUILT FOR THE PEOPLE WHO BRING US TOGETHER</div><h2 style={{marginTop:8}}>Your events. Your impact.</h2></div></div>
        <div className="events">
          <div className="panel"><div style={{background:"#efedff",width:42,height:42,borderRadius:12,display:"grid",placeItems:"center",color:"#6650df"}}><LayoutDashboard/></div><h3>One simple dashboard</h3><p className="muted">Manage events, ticket tiers, capacity, and sales cut-off dates in one place.</p><button className="btn secondary" onClick={()=>setView(view==="create"?"discover":"create")}>Create an event <Plus size={14} style={{display:"inline"}}/></button></div>
          <div className="panel"><div style={{background:"#fff1e8",width:42,height:42,borderRadius:12,display:"grid",placeItems:"center",color:"#bd5d31"}}><ChartNoAxesCombined/></div><h3>Understand your audience</h3><p className="muted">Track ticket sales, revenue, conversion, and event performance.</p><button className="btn secondary" onClick={()=>setView("dashboard")}>View analytics <ArrowUpRight size={14} style={{display:"inline"}}/></button></div>
          <div className="panel"><div style={{background:"#e3f8f2",width:42,height:42,borderRadius:12,display:"grid",placeItems:"center",color:"#178a71"}}><Users/></div><h3>Built for every role</h3><p className="muted">Separate admin, organizer, and attendee experiences with role-based access.</p><button className="btn secondary" onClick={()=>setNotice("RBAC is defined in the database schema; production authentication must be configured.")}>Explore roles</button></div>
        </div>
      </section>

      {view==="create" && <section className="panel" style={{marginTop:24}}><h2>Create an event</h2><p className="muted">UI preview only — saving requires a connected database and authenticated organizer.</p><div className="form-grid" style={{marginTop:18}}><div className="field"><label>Event name</label><input placeholder="e.g. Startup Demo Day"/></div><div className="field"><label>Category</label><select><option>Technology</option><option>Music</option><option>Design</option></select></div><div className="field"><label>Venue</label><input placeholder="Venue name"/></div><div className="field"><label>Sales cut-off</label><input type="date"/></div><div className="field"><label>General Admission quantity</label><input type="number" placeholder="100"/></div><div className="field"><label>VIP price (₹)</label><input type="number" placeholder="1999"/></div></div><button className="btn" style={{marginTop:18}} onClick={()=>setNotice("Form preview only. Configure authentication and the events API before saving events.")}>Save event</button></section>}

      {view==="dashboard" && <section className="panel" style={{marginTop:24}}><h2>Organizer analytics preview</h2><p className="muted">Sample dashboard figures only — not live business data.</p><div className="stats"><div className="stat"><span className="muted">Gross revenue</span><strong>₹1,84,500</strong><span style={{color:"#13866e",fontSize:12}}>↑ 12.8% vs. last month</span></div><div className="stat"><span className="muted">Tickets sold</span><strong>428</strong><span className="muted">Across 6 events</span></div><div className="stat"><span className="muted">Conversion rate</span><strong>8.6%</strong><span className="muted">Event page to purchase</span></div></div><div style={{height:110,display:"flex",alignItems:"end",gap:12,borderBottom:"1px solid #e8eaf0",padding:"0 12px"}}>{[42,65,52,78,58,92,72,100,81,88,70,95].map((h,i)=><div key={i} title={`Sample week ${i+1}`} style={{height:`${h}%`,flex:1,borderRadius:"6px 6px 0 0",background:"linear-gradient(#9a8cff,#6c55ed)"}}/>)}</div><p className="muted">Illustrative weekly revenue chart</p></section>}

      <div className="notice"><strong>Prototype status:</strong> Event discovery and the interface interactions work with sample data. Authentication, database writes, real reservation holds, payment processing, Redis caching, and automated expiry need configuration and integration before production use.</div>
      <footer className="footer"><div style={{display:"flex",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}><span>© 2026 Gatherly. Made for moments that matter.</span><span>Discover · Organize · Gather</span></div></footer>
    </div>
  </main>;
}
