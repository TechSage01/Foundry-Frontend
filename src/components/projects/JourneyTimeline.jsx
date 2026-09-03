export default function JourneyTimeline({ milestones = [] }) {
  return <ol>{milestones.map((milestone) => <li key={milestone.id}>{milestone.title}</li>)}</ol>
}
