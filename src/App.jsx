import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'
import Chart from 'chart.js/auto'
import KPI from './components/KPI.jsx'
import VarianceTable from './components/VarianceTable.jsx'
import LineDualCard from './components/LineDualCard.jsx'
import { combineActualBudget, fmtCurrency, fmtPercent } from './utils.js'

function useCSVData(){
  const [state, setState] = useState({ rows: [], ready: false, error: null })
  useEffect(()=>{
    (async ()=>{
      try {
        const [actuals, budget] = await Promise.all([
          fetch('/actuals.csv').then(r=>r.text()),
          fetch('/budget.csv').then(r=>r.text())
        ])
        const parse = (csv)=> new Promise(res=> Papa.parse(csv, { header:true, complete: (r)=> res(r.data.filter(r=>Object.values(r).some(v=>String(v).trim()!==''))) }))
        const [aRows, bRows] = await Promise.all([parse(actuals), parse(budget)])
        const merged = combineActualBudget(aRows, bRows)
        setState({ rows: merged, ready:true, error:null })
      } catch(e){
        console.error(e)
        setState({ rows: [], ready:true, error: e.message || String(e) })
      }
    })()
  }, [])
  return state
}

export default function App(){
  const { rows, ready, error } = useCSVData()

  useEffect(()=>{
    if (!ready || rows.length===0) return
    const labels = rows.map(r=>r.Month)
    const get = m => rows.map(r=>r[m+'_Actual'] ?? null)

    const rev = get('Revenue').map((v,i)=> v ?? rows[i]['Total Rev_Actual'] ?? null)
    const cogs = get('COGS')
    const opex = get('OpEx')

    const ctx = document.getElementById('revExp').getContext('2d')
    const chart = new Chart(ctx, {
      type:'line',
      data: { labels, datasets: [
        { label:'Revenue', data:rev, tension:.35, borderWidth:2, pointRadius:0 },
        { label:'COGS', data:cogs, tension:.35, borderWidth:2, pointRadius:0, borderDash:[6,6] },
        { label:'OpEx', data:opex, tension:.35, borderWidth:2, pointRadius:0, borderDash:[2,4] }
      ]},
      options: {
        responsive:true, interaction:{ mode:'index', intersect:false },
        plugins:{ legend:{ labels:{ color:'#cbd5e1' } }, tooltip:{ callbacks:{ label:(ctx)=> `${ctx.dataset.label}: ${fmtCurrency(ctx.raw)}` } } },
        scales:{ x:{ ticks:{ color:'#94a3b8' }, grid:{ color:'rgba(255,255,255,0.05)' } }, y:{ ticks:{ color:'#94a3b8' }, grid:{ color:'rgba(255,255,255,0.05)' } } }
      }
    })
    return ()=> chart.destroy()
  }, [ready, rows.length])

  if (!ready){
    return <div className="min-h-screen flex items-center justify-center"><div className="text-slate-300">Loading dashboard…</div></div>
  }
  if (error){
    return <div className="min-h-screen flex items-center justify-center"><div className="text-red-400">Error: {error}</div></div>
  }
  if (rows.length===0){
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-xl text-center text-slate-300">
          <h1 className="text-2xl font-bold mb-2">No data loaded yet</h1>
          <p className="text-slate-400">Place your CSVs in <code>/public/actuals.csv</code> and <code>/public/budget.csv</code> and refresh.</p>
        </div>
      </div>
    )
  }

  const last = rows[rows.length-1] || {}
  const headline = ['Total Rev','Gross Margin %','EBITDA','EBITDA Margin','Rule of 40','Customers']
  const kpis = headline.map(name=>{
    const actual = last[name+'_Actual'] ?? (name==='Total Rev' ? last['Revenue_Actual'] : undefined)
    const budget = last[name+'_Budget'] ?? (name==='Total Rev' ? last['Revenue_Budget'] : undefined)
    const series = rows.slice(-12).map(r=>({ Month:r.Month, val: (name==='Total Rev' ? (r['Total Rev_Actual'] ?? r['Revenue_Actual']) : r[name+'_Actual']) }))
    return <KPI key={name} name={name} actual={actual} budget={budget} last12={series} />
  })

  const labels = rows.map(r=>r.Month)
  const get = m => rows.map(r=>r[m+'_Actual'] ?? null)
  const getB = m => rows.map(r=>r[m+'_Budget'] ?? null)
  const categories = ['Beauty Rev','Infusion Rev','Membership Rev','Store Rev','Tech Rev','Wellness Rev']

  const varMetrics = ['Total Rev','COGS','Gross Margin %','Sales & Marketing','R&D','G&A','OpEx','EBITDA','EBITDA Margin','CAC','LTV','Churn Rate','Rule of 40']
  const varRows = rows.map(r=>{
    const obj = { Month: r.Month }
    varMetrics.forEach(m=>{
      obj[m+'_Actual'] = r[m+'_Actual'] ?? (m==='Total Rev' ? r['Revenue_Actual'] : undefined)
      obj[m+'_Budget'] = r[m+'_Budget'] ?? (m==='Total Rev' ? r['Revenue_Budget'] : undefined)
    })
    return obj
  })

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Medspa Finance Dashboard</h1>
          <p className="text-slate-400">Actual vs Budget • Replace CSVs in /public</p>
        </div>
        <div className="text-sm text-slate-400">{new Date().toLocaleString()}</div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{kpis}</section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categories.map(cat=>(
          <LineDualCard
            key={cat}
            title={cat}
            labels={labels}
            seriesA={get(cat)}
            seriesB={getB(cat)}
            fmt={fmtCurrency}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card glow rounded-2xl p-4 fade-in">
          <h3 className="text-lg font-semibold mb-2">Revenue vs COGS vs OpEx</h3>
          <canvas id="revExp" height="160"></canvas>
        </div>
        <LineDualCard title="Gross Margin %" labels={labels} seriesA={get('Gross Margin %')} seriesB={getB('Gross Margin %')} fmt={fmtPercent} />
        <LineDualCard title="CAC vs LTV (split)" labels={labels} seriesA={get('CAC')} seriesB={get('LTV')} fmt={fmtCurrency} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineDualCard title="EBITDA" labels={labels} seriesA={get('EBITDA')} seriesB={getB('EBITDA')} fmt={fmtCurrency} />
        <LineDualCard title="EBITDA Margin" labels={labels} seriesA={get('EBITDA Margin')} seriesB={getB('EBITDA Margin')} fmt={fmtPercent} />
      </section>

      <VarianceTable rows={varRows} metrics={varMetrics} />
    </div>
  )
}
