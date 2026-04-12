import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

function App() {
  const [data, setData] = useState({ price: [], board: [], decisions: [] })

  useEffect(() => {
    fetch('/paper-data.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ price: [], board: [], decisions: [] }))
  }, [])

  const chartData = useMemo(() => {
    return (data.price || []).map((row) => ({
      time: row.captured_at_utc,
      currentPrice: row.current_price,
      highPrice: row.high_price,
      lowPrice: row.low_price,
      changePct: row.change_previous_close_per,
    }))
  }, [data.price])

  const decisionDots = useMemo(() => {
    return (data.decisions || []).filter((d) => d.decision !== 'NO_TRADE')
  }, [data.decisions])

  const latestPrice = data.price?.[data.price.length - 1]
  const latestDecision = data.decisions?.[data.decisions.length - 1]
  const latestBoard = data.board?.[data.board.length - 1]

  return (
    <div className="app">
      <header>
        <h1>Nikkei 225 Micro Paper Trading Dashboard</h1>
        <p>Price movement, order-book snapshots, and simulated local trade decisions.</p>
      </header>

      <section className="cards">
        <div className="card">
          <h2>Latest price</h2>
          <strong>{latestPrice?.current_price ?? '-'} </strong>
          <span>{latestPrice?.captured_at_utc ?? 'No data'}</span>
        </div>
        <div className="card">
          <h2>Latest board</h2>
          <strong>Bid {latestBoard?.bid_price ?? '-'} / Ask {latestBoard?.ask_price ?? '-'}</strong>
          <span>Qty {latestBoard?.bid_qty ?? '-'} / {latestBoard?.ask_qty ?? '-'}</span>
        </div>
        <div className="card">
          <h2>Latest decision</h2>
          <strong>{latestDecision?.decision ?? 'NO_DATA'}</strong>
          <span>{latestDecision?.reason ?? 'No decision yet'}</span>
        </div>
      </section>

      <section className="panel chart-panel">
        <h2>Price and simulated orders</h2>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={(v) => String(v).slice(11, 16)} />
              <YAxis domain={["dataMin - 50", "dataMax + 50"]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="currentPrice" stroke="#4f8cff" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="highPrice" stroke="#24b47e" dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="lowPrice" stroke="#f97316" dot={false} strokeDasharray="4 4" />
              {decisionDots.map((d, i) => (
                <ReferenceDot
                  key={`${d.captured_at_utc}-${i}`}
                  x={d.captured_at_utc}
                  y={d.reference_price}
                  r={6}
                  fill={d.decision === 'PAPER_BUY' ? '#22c55e' : '#ef4444'}
                  stroke="white"
                  label={{ value: d.decision === 'PAPER_BUY' ? 'Buy' : 'Sell', position: 'top', fill: '#e5e7eb' }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid two">
        <div className="panel">
          <h2>Recent simulated orders</h2>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Decision</th>
                <th>Lot</th>
                <th>Price</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {(data.decisions || []).slice(-10).reverse().map((row, i) => (
                <tr key={i}>
                  <td>{row.captured_at_utc}</td>
                  <td>{row.decision}</td>
                  <td>{row.lots}</td>
                  <td>{row.reference_price}</td>
                  <td>{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Recent board snapshots</h2>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Bid</th>
                <th>Bid Qty</th>
                <th>Ask</th>
                <th>Ask Qty</th>
              </tr>
            </thead>
            <tbody>
              {(data.board || []).slice(-10).reverse().map((row, i) => (
                <tr key={i}>
                  <td>{row.captured_at_utc}</td>
                  <td>{row.bid_price}</td>
                  <td>{row.bid_qty}</td>
                  <td>{row.ask_price}</td>
                  <td>{row.ask_qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default App
