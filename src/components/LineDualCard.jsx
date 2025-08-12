import React, { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function LineDualCard({ title, labels, seriesA, seriesB, fmt }){
  const ref = useRef(null)
  useEffect(()=>{
    if (!ref.current) return
    const ctx = ref.current.getContext('2d')
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: `${title} Actual`, data: seriesA, tension:.35, borderWidth:2, pointRadius:0 },
          { label: `${title} Budget`, data: seriesB, tension:.35, borderWidth:2, pointRadius:0, borderDash:[6,6] }
        ]
      },
      options: {
        responsive:true,
        interaction:{ mode:'index', intersect:false },
        plugins:{
          legend:{ labels:{ color:'#cbd5e1' } },
          tooltip:{ callbacks:{ label:(ctx)=> `${ctx.dataset.label}: ${fmt(ctx.raw)}` } }
        },
        scales:{
          x:{ ticks:{ color:'#94a3b8' }, grid:{ color:'rgba(255,255,255,0.05)' } },
          y:{ ticks:{ color:'#94a3b8' }, grid:{ color:'rgba(255,255,255,0.05)' } }
        }
      }
    })
    return ()=> chart.destroy()
  }, [title, labels, seriesA, seriesB, fmt])
  return (
    <div className="card glow rounded-2xl p-4 fade-in">
      <h3 className="text-lg font-semibold mb-2">{title}: Actual vs Budget</h3>
      <canvas ref={ref} height="160"></canvas>
    </div>
  )
}
