import React, {useEffect, useState} from 'react'

export default function PersonalDashboard(){
  const [items, setItems] = useState<any[]>([])
  useEffect(()=>{
    const sample = [{id:'1', title:'Follow up: high-value customer', score:92, confidence:0.9}, {id:'2', title:'Resolve incident #123', score:84, confidence:0.7}]
    setItems(sample)
  },[])
  return (
    <div>
      <h2>Personal Work Priority</h2>
      <ul>
        {items.map(it => <li key={it.id}>{it.title} — Score: {it.score} (conf {Math.round(it.confidence*100)}%)</li>)}
      </ul>
    </div>
  )
}
