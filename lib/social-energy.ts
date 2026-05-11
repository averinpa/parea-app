import { Butterfly, Confetti, Couch, HouseLine, Scales } from './phosphor-icons'

export const SOCIAL_ENERGY = [
  { id: 'homebody',  label: 'Homebody',        Icon: HouseLine, color: '#8B5CF6', grad: ['#EDE9FE','#C4B5FD'] as [string,string] },
  { id: 'chill',     label: 'Chill vibes',     Icon: Couch,     color: '#06B6D4', grad: ['#E0F2FE','#7DD3FC'] as [string,string] },
  { id: 'balanced',  label: 'Balanced',        Icon: Scales,    color: '#10B981', grad: ['#D1FAE5','#6EE7B7'] as [string,string] },
  { id: 'social',    label: 'Extrovert',        Icon: Butterfly, color: '#F59E0B', grad: ['#FEF3C7','#FCD34D'] as [string,string] },
  { id: 'party',     label: 'Party animal',    Icon: Confetti,  color: '#EF4444', grad: ['#FEE2E2','#FCA5A5'] as [string,string] },
]
