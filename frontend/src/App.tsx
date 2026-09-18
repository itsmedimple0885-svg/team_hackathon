import React, { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8000/dashboard'
const tabs = ['Personal Priority', 'Team Priority', 'Actions & Traceability']

const personalRows = [
  { rank: 1, title: 'API Timeout in Payment Service', source: 'Incidents', sourceMeta: 'Severity: Critical | From: Incidents Feed', score: '9.8', level: 'CRITICAL', due: 'ASAP', team: 'ASAP', action: 'View Details', tone: 'critical' },
  { rank: 2, title: 'BUG-1245: Data migration failed for Q3 customers', source: 'JIRA', sourceMeta: 'Pri: Data Team Channel', score: '9.2', level: 'HIGH', due: 'Today 5:00 PM', team: 'Blocks 3 others', action: 'View Details', tone: 'high' },
  { rank: 3, title: '@Priya: Need review on security audit findings', source: 'TEAMS', sourceMeta: 'From: #security-compliance (1 hour ago)', score: '8.1', level: 'HIGH', due: 'Tomorrow 10:00 AM', team: '12 messages', action: 'View Details', tone: 'high' },
  { rank: 4, title: 'Email: Q4 Budget Approval Required - Platform Team', source: 'OUTLOOK', sourceMeta: 'From: Finance Team (Manager CC)', score: '7.9', level: 'HIGH', due: 'This Friday', team: '2 attachments', action: 'View Details', tone: 'medium' },
  { rank: 5, title: 'FEAT-892: Implement caching layer for Redis', source: 'JIRA', sourceMeta: 'P2 | Sprint: Q4 Sprint 1', score: '6.7', level: 'MEDIUM', due: 'Sept 15', team: 'Ready for review', action: 'View Details', tone: 'medium' },
  { rank: 6, title: '@Priya: API docs need update - new endpoint added', source: 'TEAMS', sourceMeta: 'From: #api-development (2 hours ago)', score: '5.8', level: 'MEDIUM', due: 'Next Week', team: '1 thread', action: 'View Details', tone: 'medium' }
]

const actionItems = [
  { id: 'ACTION-001', title: 'Fix Payment API Timeout Issue', owners: ['Priya Sharma', 'SRE Team'], due: '09:45 AM', risk: 'Critical', confidence: '97%', description: 'Root cause: Connection pool exhaustion in payment service. Need to reset connection pool and review autoscaling limits.', status: 'in-progress' },
  { id: 'ACTION-002', title: 'Review Security Audit Findings Report', owners: ['Amit Joshi', 'TEAMS'], due: 'Today 5:00 PM', risk: 'High', confidence: '95%', description: 'Security compliance findings need review and remediation follow-up; risk to production access required.', status: 'blocked' },
  { id: 'ACTION-003', title: 'Investigate Data Migration Failed Records', owners: ['Rahul Kumar', 'Data Team'], due: 'Tomorrow 10:00 AM', risk: 'High', confidence: '93%', description: '1,250 Q3 customer records failed to migrate. Block for dashboard team and customer impact.', status: 'pending' },
  { id: 'ACTION-004', title: 'Approve Q4 Budget Allocation Plan', owners: ['Pooja Sharma', 'OUTLOOK'], due: 'This Friday', risk: 'Medium', confidence: '83%', description: 'Q4 budget for platform team needs final approval. Includes 2 new contractor roles and cloud spend.', status: 'pending' },
  { id: 'ACTION-005', title: 'Update API Documentation for New Endpoints', owners: ['Amit Joshi', 'TEAM'], due: 'Next Friday', risk: 'Medium', confidence: '79%', description: 'Document internal API changes and update openapi swagger schema for consumers.', status: 'scheduled' },
  { id: 'ACTION-006', title: 'Review Redis Caching Strategy Document', owners: ['Vikram Roy', 'Data Team'], due: 'Sept 30', risk: 'Medium', confidence: '80%', description: 'Evaluate cache TTL and invalidation strategy for improved tenant latency and resilience.', status: 'scheduled' }
]

const teamPriorityItems = [
  { name: 'Production Incident: API Service Down', owner: 'Priya Sharma', type: 'INCIDENT', due: 'Due: ASAP (1 hour)', score: 'P5', progress: 92 },
  { name: 'Security Audit: Q3 Compliance Review', owner: 'Amit Joshi', type: 'JIRA', due: 'Due: Today 5:00 PM', score: 'AJ', progress: 72 },
  { name: 'Data Migration Q4 Cohort: Urgent Fixes', owner: 'Rahul Kumar', type: 'JIRA', due: 'Due: Tomorrow 10:00 AM', score: 'RK', progress: 78 },
  { name: 'Review: API Documentation Updates', owner: 'Nuka Kapoor', type: 'JIRA', due: 'Due: Sept 20', score: 'NK', progress: 45 },
  { name: 'Feature: Redis Cache Implementation', owner: 'Vikram Roy', type: 'JIRA', due: 'Due: Sept 20', score: 'VR', progress: 32 }
]

const workloadRows = [
  { person: 'Priya Sharma', initials: 'PS', workload: 85, label: '85% utilized' },
  { person: 'Amit Joshi', initials: 'AJ', workload: 62, label: '62% utilized' },
  { person: 'Rahul Kumar', initials: 'RK', workload: 78, label: '78% utilized' },
  { person: 'Nuka Kapoor', initials: 'NK', workload: 45, label: '45% utilized' },
  { person: 'Vikram Roy', initials: 'VR', workload: 58, label: '58% utilized' }
]

function PersonalView() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const payload = {
          items: [
            { id: 'INC-1001', title: 'Payment API timeout in production', source: 'Incidents' },
            { id: 'JIRA-882', title: 'Review security audit findings', source: 'Jira' },
            { id: 'OUT-445', title: 'Budget approval follow-up', source: 'Outlook' },
            { id: 'JIRA-902', title: 'Implement Redis cache layer', source: 'Jira' },
            { id: 'TEAMS-101', title: 'API docs update for new endpoints', source: 'Teams' },
            { id: 'INC-204', title: 'Data migration failed Q3 customer records', source: 'Incidents' }
          ],
          snapshot: { team: 'Platform Engineering', user: 'Priya Sharma', date: '2026-09-17' }
        }

        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!res.ok) throw new Error('API request failed')

        const data = await res.json()
        const apiRows = (data.personal?.rows || []).map((item: any) => ({
          ...item,
          score: String(item.score),
          action: 'View Details',
        }))

        setRows(apiRows)
      } catch (error) {
        setRows([
          { rank: 1, title: 'API Timeout in Payment Service', source: 'Incidents', sourceMeta: 'Severity: Critical | From: Incidents Feed', score: '9.8', level: 'CRITICAL', due: 'ASAP', team: 'ASAP', action: 'View Details', tone: 'critical' },
          { rank: 2, title: 'BUG-1245: Data migration failed for Q3 customers', source: 'JIRA', sourceMeta: 'Pri: Data Team Channel', score: '9.2', level: 'HIGH', due: 'Today 5:00 PM', team: 'Blocks 3 others', action: 'View Details', tone: 'high' },
          { rank: 3, title: '@Priya: Need review on security audit findings', source: 'TEAMS', sourceMeta: 'From: #security-compliance (1 hour ago)', score: '8.1', level: 'HIGH', due: 'Tomorrow 10:00 AM', team: '12 messages', action: 'View Details', tone: 'high' },
          { rank: 4, title: 'Email: Q4 Budget Approval Required - Platform Team', source: 'OUTLOOK', sourceMeta: 'From: Finance Team (Manager CC)', score: '7.9', level: 'HIGH', due: 'This Friday', team: '2 attachments', action: 'View Details', tone: 'medium' },
          { rank: 5, title: 'FEAT-892: Implement caching layer for Redis', source: 'JIRA', sourceMeta: 'P2 | Sprint: Q4 Sprint 1', score: '6.7', level: 'MEDIUM', due: 'Sept 15', team: 'Ready for review', action: 'View Details', tone: 'medium' },
          { rank: 6, title: '@Priya: API docs need update - new endpoint added', source: 'TEAMS', sourceMeta: 'From: #api-development (2 hours ago)', score: '5.8', level: 'MEDIUM', due: 'Next Week', team: '1 thread', action: 'View Details', tone: 'medium' }
        ])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const tableRows = rows.length ? rows : []

  return (
    <div className="panel-shell">
      <div className="page-header light-header">
        <div className="title-wrap">
          <span className="title-icon small-grid" aria-hidden="true" />
          <h1>My Work Priority Dashboard</h1>
        </div>
        <div className="header-meta">
          <span className="user-name">Priya Sharma</span>
          <span className="role">Software Engineer</span>
          <button className="refresh-btn" onClick={() => window.location.reload()}>Refresh Now</button>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">My Open items</div>
          <div className="metric-value">12</div>
          <div className="metric-note">Last updated: 09:15 AM</div>
        </div>
        <div className="metric-card highlight">
          <div className="metric-label">High priority</div>
          <div className="metric-value">4</div>
          <div className="metric-note">Require attention today</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Today actions</div>
          <div className="metric-value">6</div>
          <div className="metric-note">Due by EOD</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg priority score</div>
          <div className="metric-value large-score">7.8/10</div>
          <div className="metric-note">95% confidence AI ranking</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <span>Source:</span>
          <button className="dropdown-pill">All Sources</button>
        </div>
        <div className="filter-group">
          <span>Urgency:</span>
          <button className="dropdown-pill">All</button>
        </div>
        <div className="filter-group">
          <span>Due:</span>
          <button className="dropdown-pill">Today</button>
        </div>
      </div>

      <div className="table-shell">
        <table className="priority-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Task / Item</th>
              <th>Priority score</th>
              <th>Due date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#627086' }}>Loading priorities…</td>
              </tr>
            ) : (
              tableRows.map((row) => (
                <tr key={row.rank}>
                  <td className="rank-cell"><span className="rank-badge">{row.rank}</span></td>
                  <td className="title-cell">
                    <div className="task-title">{row.title}</div>
                    <div className="task-meta">
                      <span className={`pill ${row.tone}`}>{row.source}</span>
                      <span>{row.sourceMeta}</span>
                    </div>
                  </td>
                  <td className="score-cell">
                    <div className="score-value">{row.score}</div>
                    <div className={`score-tag ${row.tone}`}>{row.level}</div>
                  </td>
                  <td className="due-cell">
                    <div className="date-value">{row.due}</div>
                    <div className="date-sub">{row.team}</div>
                  </td>
                  <td className="action-cell">
                    <button className="link-btn">{row.action}</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TeamView() {
  const [teamRows, setTeamRows] = useState<any[]>(teamPriorityItems)
  const [memberRows, setMemberRows] = useState<any[]>(workloadRows)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const payload = {
        items: [
          { id: 'INC-3001', title: 'Production Incident: API Service Down', source: 'Incidents' },
          { id: 'JIRA-1101', title: 'Security Audit: Q3 Compliance Review', source: 'Jira' },
          { id: 'JIRA-1102', title: 'Data Migration Q4 Cohort: Urgent Fixes', source: 'Jira' },
          { id: 'JIRA-1103', title: 'Review: API Documentation Updates', source: 'Jira' },
          { id: 'JIRA-1104', title: 'Feature: Redis Cache Implementation', source: 'Jira' }
        ],
        snapshot: { team: 'Platform Engineering', user: 'Priya Sharma', date: '2026-09-17' }
      }

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('team fetch failed')
        const data = await res.json()
        const mapped = (data.team?.rows || []).map((item: any) => ({
          ...item,
          score: item.score || 'VR',
          progress: Number(item.progress || 50)
        }))
        setTeamRows(mapped)
        setMemberRows(workloadRows)
      } catch (error) {
        setTeamRows(teamPriorityItems)
        setMemberRows(workloadRows)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="panel-shell team-panel">
      <div className="page-header light-header">
        <div className="title-wrap">
          <span className="title-icon team-icon" aria-hidden="true" />
          <h1>Team Work Priority Board</h1>
        </div>
        <div className="header-meta team-meta">
          <span className="user-name">Platform Engineering Team</span>
          <span className="role">5 members | 47 Open items</span>
        </div>
      </div>

      <div className="metric-grid team-grid">
        <div className="metric-card">
          <div className="metric-label">Open items</div>
          <div className="metric-value">3</div>
          <div className="metric-note">Incident requiring immediate attention</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Team workload</div>
          <div className="metric-value">68%</div>
          <div className="metric-note">Average capacity utilization</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Blockers</div>
          <div className="metric-value">5</div>
          <div className="metric-note">Items blocking team work</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">P0 + P1</div>
          <div className="metric-value">2</div>
          <div className="metric-note">Items due this week</div>
        </div>
      </div>

      <div className="team-layout">
        <div className="board-card left-card">
          <div className="section-heading">Top Team Priorities (This Week)</div>
          <div className="priorities-list">
            {loading ? (
              <div style={{ padding: '18px', color: '#627086' }}>Loading team priorities…</div>
            ) : (
              teamRows.map((item) => (
                <div className="priority-item" key={item.name}>
                  <div className="priority-main">
                    <div className="priority-title">{item.name}</div>
                    <div className="priority-sub">
                      <span className="pill mini incident">{item.type}</span>
                      <span>{item.owner}</span>
                    </div>
                  </div>
                  <div className="priority-side">
                    <div className="mini-badge">{item.score}</div>
                    <div className="priority-due">{item.due}</div>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="board-card right-card">
          <div className="section-heading">Team Member Workload</div>
          <div className="member-list">
            {memberRows.map((member) => (
              <div className="member-row" key={member.person}>
                <div className="member-info">
                  <span className="avatar">{member.initials}</span>
                  <span>{member.person}</span>
                </div>
                <div className="member-progress">
                  <div className="progress-track tiny">
                    <span style={{ width: `${member.workload}%` }} />
                  </div>
                  <span className="util-label">{member.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="team-lower-grid">
        <div className="board-card lower-card">
          <div className="section-heading">Work Distribution by Source</div>
          <div className="chart">
            <div className="chart-row">
              <span>Incidents</span>
              <div className="segment"><span style={{ width: '35%' }} className="segment-red" /></div>
              <strong>35%</strong>
            </div>
            <div className="chart-row">
              <span>Jira Issues</span>
              <div className="segment"><span style={{ width: '40%' }} className="segment-blue" /></div>
              <strong>40%</strong>
            </div>
            <div className="chart-row">
              <span>Teams Chats</span>
              <div className="segment"><span style={{ width: '15%' }} className="segment-purple" /></div>
              <strong>15%</strong>
            </div>
            <div className="chart-row">
              <span>Outlook</span>
              <div className="segment"><span style={{ width: '10%' }} className="segment-gray" /></div>
              <strong>10%</strong>
            </div>
          </div>
        </div>

        <div className="board-card lower-card">
          <div className="section-heading">Team Risks &amp; Blockers</div>
          <ul className="risk-list">
            <li><span className="risk-tag critical">Critical incident</span><p>Payment API incident causing customer transactions to fail. Issue is impacting 2.8% of daily traffic.</p></li>
            <li><span className="risk-tag warning">Security compliance</span><p>Q3 audit findings require review; blockers on access monitoring and vulnerability patches.</p></li>
            <li><span className="risk-tag alert">Blocker Alert</span><p>Data migration is blocking 3 other team members; Rahul Kumar unavailable until next week.</p></li>
            <li><span className="risk-tag neutral">Resource constraint</span><p>Team utilization at 68% (Amit 62%, Priya 85%); need support for backlog reduction.</p></li>
            <li><span className="risk-tag neutral">Deadline warning</span><p>Q4 budget approval due in 2 days. Slack is likely to delay several infrastructure changes.</p></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function ActionsView() {
  const [items, setItems] = useState<any[]>(actionItems)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const payload = {
        items: [
          { id: 'ACTION-001', title: 'Fix Payment API Timeout Issue', source: 'Incidents' },
          { id: 'ACTION-002', title: 'Review Security Audit Findings Report', source: 'Jira' },
          { id: 'ACTION-003', title: 'Investigate Data Migration Failed Records', source: 'Incidents' },
          { id: 'ACTION-004', title: 'Approve Q4 Budget Allocation Plan', source: 'Outlook' },
          { id: 'ACTION-005', title: 'Update API Documentation for New Endpoints', source: 'Teams' },
          { id: 'ACTION-006', title: 'Review Redis Caching Strategy Document', source: 'Jira' }
        ],
        snapshot: { team: 'Platform Engineering', user: 'Priya Sharma', date: '2026-09-17' }
      }

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('actions fetch failed')
        const data = await res.json()
        const mapped = (data.actions?.rows || []).map((item: any) => ({
          ...item,
          confidence: String(item.confidence || '94%'),
          risk: item.risk || 'Medium',
          owners: item.owners || ['Platform Team']
        }))
        setItems(mapped)
      } catch (error) {
        setItems(actionItems)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="panel-shell action-panel">
      <div className="page-header light-header">
        <div className="title-wrap">
          <span className="title-icon small-grid" aria-hidden="true" />
          <h1>Action Items &amp; Traceability</h1>
        </div>
        <div className="header-meta action-meta">
          <button className="filter-chip">All users</button>
          <button className="filter-chip">Today</button>
        </div>
      </div>

      <div className="metric-grid action-grid">
        <div className="metric-card">
          <div className="metric-label">Actions for today</div>
          <div className="metric-value">6</div>
          <div className="metric-note">Due by end of business</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">AI confidence</div>
          <div className="metric-value">94%</div>
          <div className="metric-note">Average across all items</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Source traced</div>
          <div className="metric-value">4</div>
          <div className="metric-note">Queued from raw data</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Resolved</div>
          <div className="metric-value">2</div>
          <div className="metric-note">Completed this week</div>
        </div>
      </div>

      <div className="action-layout">
        <div className="action-list-panel">
          <div className="section-heading inline-row">
            <span>Actionable Items (with source traceability)</span>
            <button className="filter-line">Audit Trail</button>
          </div>

          {loading ? (
            <div style={{ padding: '18px', color: '#627086' }}>Loading actions…</div>
          ) : (
            items.map((item) => (
              <div className="action-row" key={item.id}>
                <div className="action-header-row">
                  <div className="action-id"><strong>{item.id}</strong></div>
                  <div className="action-submeta">{item.due}</div>
                </div>
                <div className="action-main">
                  <div className="action-title-row">
                    <h3>{item.title}</h3>
                    <button className="link-btn small">View Details</button>
                  </div>
                  <div className="action-detail-meta">
                    {item.owners.map((owner: string) => (
                      <span key={owner} className="member-pill">{owner}</span>
                    ))}
                    <span className="mini-badge danger">{item.risk}</span>
                    <span className="mini-badge neutral">{item.confidence}</span>
                  </div>
                  <p>{item.description}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="trace-panel">
          <div className="section-heading inline-row small-gap">
            <span>Audit Trail</span>
            <button className="filter-line">All traces</button>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-time">09:45 AM</div>
              <div className="timeline-content">
                <strong>Payment API issue triggered</strong>
                <p>System created a new trace from the incidents payload.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-time">09:48 AM</div>
              <div className="timeline-content">
                <strong>AI ranked as critical</strong>
                <p>Confidence 97% based on impact, SLA, and recent escalation history.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-time">09:51 AM</div>
              <div className="timeline-content">
                <strong>Owner assigned</strong>
                <p>Priya Sharma was selected as accountable owner for the workflow.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-time">09:58 AM</div>
              <div className="timeline-content">
                <strong>Action created</strong>
                <p>New ticket source and audit lineage were attached to the incident.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function App() {
  const [selectedTab, setSelectedTab] = useState('Personal Priority')

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; min-height: 100%; font-family: 'Segoe UI', sans-serif; }
        body {
          background: linear-gradient(180deg, #0d5eb7 0%, #0a4fb3 100%);
          min-height: 100vh;
        }
        button { font: inherit; }
        .app-shell {
          width: min(1220px, calc(100vw - 48px));
          margin: 24px auto;
          background: rgba(11, 92, 181, 0.35);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.09);
          overflow: hidden;
        }
        .tab-bar {
          display: flex;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          padding: 10px 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .tab {
          min-width: 140px;
          padding: 10px 18px 12px;
          border: 0;
          border-radius: 8px 8px 0 0;
          background: transparent;
          color: rgba(255,255,255,0.8);
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tab.active {
          background: rgba(255,255,255,0.14);
          color: #fff;
          box-shadow: inset 0 -1px 0 rgba(255,255,255,0.15);
        }
        .view-stage {
          background: rgba(226,230,235,0.78);
          min-height: 780px;
          padding: 18px 18px 12px;
        }
        .panel-shell {
          background: rgba(242,245,247,0.72);
          border-radius: 8px;
          min-height: 748px;
          box-shadow: inset 0 0 0 1px rgba(140,160,185,0.25);
          overflow: hidden;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 18px 14px;
          border-bottom: 1px solid rgba(108,121,136,0.18);
          background: rgba(255,255,255,0.12);
        }
        .light-header { background: rgba(236,240,243,0.76); }
        .title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .title-wrap h1 {
          margin: 0;
          font-size: clamp(1.7rem, 2vw, 2.1rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          color: #2b2f38;
        }
        .title-icon {
          width: 18px;
          height: 18px;
          display: inline-block;
          border-radius: 4px;
          background: linear-gradient(135deg, #35a7ff 0%, #6c9af8 100%);
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(27,65,101,0.25);
        }
        .small-grid {
          background: linear-gradient(135deg, #a8d4b5 0%, #8ec2a7 100%);
          border-radius: 4px;
        }
        .small-grid::before,
        .small-grid::after {
          content: "";
          position: absolute;
          inset: 2px;
          background-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
          background-size: 6px 6px;
          background-repeat: no-repeat;
          background-position: 0 0, 0 100%;
          opacity: 0.5;
        }
        .team-icon {
          background: linear-gradient(135deg, #2c7ee8 0%, #1d5bb6 100%);
        }
        .team-icon::before {
          content: "👥";
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          font-size: 12px;
        }
        .header-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2d3642;
          font-size: 0.82rem;
        }
        .user-name {
          font-weight: 700;
        }
        .role {
          color: #586775;
        }
        .refresh-btn, .filter-chip, .dropdown-pill, .filter-line, .link-btn {
          border: 1px solid rgba(112,125,142,0.4);
          background: rgba(247,250,253,0.8);
          color: #2d3d4f;
          border-radius: 4px;
          padding: 6px 10px;
          cursor: pointer;
        }
        .refresh-btn {
          background: #edf1f8;
          border-color: rgba(79,111,152,0.35);
          color: #24508d;
          font-weight: 600;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(160px, 1fr));
          gap: 18px;
          padding: 18px 18px 0;
        }
        .metric-card {
          background: rgba(232,236,241,0.9);
          border-radius: 8px;
          border: 1px solid rgba(122,132,146,0.18);
          min-height: 120px;
          padding: 12px 14px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
        }
        .metric-card.highlight {
          background: rgba(242, 245, 248, 0.98);
        }
        .metric-label {
          color: #7a8191;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        .metric-value {
          font-size: 2.1rem;
          font-weight: 700;
          line-height: 1.1;
          color: #1f2430;
          margin-bottom: 10px;
        }
        .metric-value.large-score { font-size: 1.9rem; }
        .metric-note {
          color: #606c7d;
          font-size: 0.75rem;
        }
        .filter-bar {
          display: flex;
          gap: 14px;
          background: rgba(231,235,240,0.9);
          border: 1px solid rgba(122,132,146,0.18);
          border-radius: 8px;
          margin: 18px 18px 0;
          padding: 12px 14px;
          align-items: center;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4f5968;
          font-size: 0.78rem;
        }
        .dropdown-pill {
          min-width: 110px;
          text-align: left;
        }
        .table-shell {
          margin: 18px 18px 0;
          background: rgba(235,239,243,0.72);
          border: 1px solid rgba(122,132,146,0.18);
          border-radius: 8px;
          overflow: hidden;
        }
        .priority-table {
          width: 100%;
          border-collapse: collapse;
        }
        .priority-table thead th {
          text-align: left;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: rgba(246,248,250,0.94);
          color: #5a6471;
          padding: 12px 14px;
          border-bottom: 1px solid rgba(106,117,132,0.16);
        }
        .priority-table tbody td {
          padding: 16px 14px;
          border-bottom: 1px solid rgba(106,117,132,0.12);
          vertical-align: middle;
        }
        .rank-badge {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3a8adf 0%, #2d6ec5 100%);
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
        }
        .title-cell {
          width: 52%;
        }
        .task-title {
          font-size: 1.05rem;
          color: #1d2a34;
          margin-bottom: 6px;
        }
        .task-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.74rem;
          color: #6d7482;
          flex-wrap: wrap;
        }
        .pill {
          display: inline-block;
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .pill.incident { background: #f1d2d4; color: #a84652; }
        .pill.high { background: rgba(226, 116, 71, 0.12); color: #d5613f; }
        .pill.medium { background: rgba(76, 161, 63, 0.12); color: #2b8d4b; }
        .pill.critical { background: rgba(210, 68, 68, 0.12); color: #c54444; }
        .score-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1d2a36;
          margin-bottom: 4px;
        }
        .score-tag {
          display: inline-block;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 4px;
          padding: 4px 6px;
        }
        .score-tag.critical { background: rgba(190, 44, 44, 0.12); color: #c63a3a; }
        .score-tag.high { background: rgba(188, 126, 53, 0.14); color: #b96312; }
        .score-tag.medium { background: rgba(39, 125, 94, 0.12); color: #257a66; }
        .due-cell {
          width: 16%;
        }
        .date-value { font-weight: 600; color: #2a3340; }
        .date-sub { font-size: 0.74rem; color: #667280; margin-top: 4px; }
        .action-cell { text-align: right; }
        .link-btn { background: transparent; border: 0; color: #3271c7; font-weight: 600; padding: 2px 0; }
        .team-grid { grid-template-columns: repeat(4, minmax(130px, 1fr)); }
        .team-layout {
          display: grid;
          grid-template-columns: 1.25fr 0.95fr;
          gap: 18px;
          padding: 18px 18px 0;
        }
        .board-card {
          background: rgba(238,240,243,0.8);
          border: 1px solid rgba(122,132,146,0.18);
          border-radius: 8px;
          padding: 12px 14px 8px;
        }
        .section-heading {
          margin: 0 0 12px;
          font-size: 0.85rem;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #486178;
          font-weight: 700;
        }
        .priorities-list { display: flex; flex-direction: column; gap: 12px; }
        .priority-item {
          padding: 8px 0 0;
          border-top: 1px solid rgba(95,108,124,0.12);
        }
        .priority-item:first-child { border-top: 0; padding-top: 0; }
        .priority-main { display: flex; justify-content: space-between; gap: 12px; }
        .priority-title { font-size: 0.96rem; color: #232a36; }
        .priority-sub {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.72rem;
          color: #69788a;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .mini-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.67rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .mini-badge.danger { background: rgba(205,60,60,0.12); color: #bf3737; }
        .mini-badge.neutral { background: rgba(85,113,132,0.12); color: #557085; }
        .priority-side {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .progress-track {
          position: relative;
          height: 8px;
          width: 100%;
          border-radius: 999px;
          background: rgba(148,160,176,0.23);
          overflow: hidden;
          margin-top: 8px;
        }
        .progress-track span {
          position: absolute;
          inset: 0 auto 0 0;
          border-radius: inherit;
          background: linear-gradient(90deg, #2f83e6 0%, #1d5695 100%);
        }
        .tiny { height: 6px; }
        .member-list { display: flex; flex-direction: column; gap: 12px; }
        .member-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 8px 0;
          border-top: 1px solid rgba(95,108,124,0.12);
        }
        .member-row:first-child { border-top: 0; }
        .member-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #1f2935;
        }
        .avatar {
          width: 26px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3a8adf 0%, #2d6ec5 100%);
          color: #fff;
          border-radius: 50%;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .member-progress {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 10px;
        }
        .util-label {
          font-size: 0.69rem;
          color: #6e7f93;
        }
        .team-lower-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 18px;
          padding: 18px;
        }
        .chart { display: flex; flex-direction: column; gap: 12px; }
        .chart-row {
          display: grid;
          grid-template-columns: 100px 1fr 46px;
          align-items: center;
          gap: 10px;
          color: #38475d;
          font-size: 0.82rem;
        }
        .segment {
          position: relative;
          height: 12px;
          border-radius: 999px;
          background: rgba(144,156,171,0.18);
          overflow: hidden;
        }
        .segment > span {
          position: absolute;
          inset: 0 auto 0 0;
          display: block;
          border-radius: inherit;
        }
        .segment-red { background: linear-gradient(90deg, #e74d48 0%, #d93838 100%); }
        .segment-blue { background: linear-gradient(90deg, #3d90ef 0%, #2369d8 100%); }
        .segment-purple { background: linear-gradient(90deg, #8a7ee8 0%, #6457d1 100%); }
        .segment-gray { background: linear-gradient(90deg, #a2b0c0 0%, #7d90a6 100%); }
        .risk-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .risk-list li {
          border-top: 1px solid rgba(95,108,124,0.12);
          padding-top: 8px;
        }
        .risk-list li:first-child { border-top: 0; padding-top: 0; }
        .risk-list p {
          margin: 6px 0 0;
          color: #4a5a6b;
          font-size: 0.8rem;
          line-height: 1.45;
        }
        .risk-tag {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .risk-tag.critical { background: rgba(205,60,60,0.12); color: #be3939; }
        .risk-tag.warning { background: rgba(205,138,60,0.12); color: #b77210; }
        .risk-tag.alert { background: rgba(87,113,204,0.12); color: #4d69d2; }
        .risk-tag.neutral { background: rgba(110,146,165,0.12); color: #4f6c7d; }
        .action-grid { grid-template-columns: repeat(4, minmax(140px, 1fr)); }
        .action-layout {
          display: grid;
          grid-template-columns: 1.6fr 0.8fr;
          gap: 18px;
          padding: 18px;
        }
        .action-list-panel, .trace-panel {
          background: rgba(236,240,244,0.8);
          border: 1px solid rgba(122,132,146,0.18);
          border-radius: 8px;
          padding: 12px 14px;
        }
        .inline-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .small-gap {
          margin-bottom: 10px;
        }
        .filter-line {
          background: rgba(243,246,249,0.7);
          color: #617388;
          font-size: 0.76rem;
        }
        .action-row {
          margin-top: 10px;
          padding: 10px 0;
          border-top: 1px solid rgba(95,108,124,0.12);
        }
        .action-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .action-id { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: #63758b; }
        .action-submeta { font-size: 0.7rem; color: #68798a; }
        .action-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .action-title-row h3 {
          margin: 0;
          font-size: 1.02rem;
          color: #1e2a35;
        }
        .small { font-size: 0.76rem; }
        .member-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(85,108,126,0.1);
          color: #486374;
          font-size: 0.7rem;
          margin-right: 6px;
        }
        .action-detail-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }
        .action-main p {
          margin: 0;
          color: #54657a;
          font-size: 0.8rem;
          line-height: 1.5;
        }
        .timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .timeline-item {
          display: grid;
          grid-template-columns: 70px 1fr;
          gap: 12px;
          align-items: flex-start;
          padding-top: 8px;
          border-top: 1px solid rgba(95,108,124,0.12);
        }
        .timeline-item:first-child { border-top: 0; padding-top: 0; }
        .timeline-time {
          font-size: 0.72rem;
          color: #65758a;
          padding-top: 4px;
        }
        .timeline-content strong {
          display: block;
          margin-bottom: 4px;
          color: #1d2a35;
          font-size: 0.83rem;
        }
        .timeline-content p {
          margin: 0;
          font-size: 0.79rem;
          color: #586a7c;
          line-height: 1.5;
        }
      `}</style>

      <div className="app-shell">
        <div className="tab-bar">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="view-stage">
          {selectedTab === 'Personal Priority' && <PersonalView />}
          {selectedTab === 'Team Priority' && <TeamView />}
          {selectedTab === 'Actions & Traceability' && <ActionsView />}
        </div>
      </div>
    </>
  )
}
