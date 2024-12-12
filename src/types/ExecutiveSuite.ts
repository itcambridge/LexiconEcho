export type Executive = 
  | 'Chief Executive Officer'
  | 'Chief Marketing Officer'
  | 'Chief Financial Officer'
  | 'Chief Technology Officer'
  | 'Chief Operations Officer'
  | 'Chief Human Resources Officer'
  | 'Chief Compliance Officer'
  | 'Chief Sales Officer'
  | 'Chief Expansion Officer'
  | 'Chief Development Officer';

export interface ExecutiveInfo {
  id: string;
  title: Executive;
  name: string;
  initials: string;
  color: string;
  expertise: string[];
}

export const executives: ExecutiveInfo[] = [
  {
    id: 'ac',
    title: 'Chief Executive Officer',
    name: 'Alexandra Chen',
    initials: 'AC',
    color: '#0088cc',
    expertise: [
      'Strategic Leadership',
      'Business Transformation',
      'Global Expansion',
      'Stakeholder Management'
    ]
  },
  {
    id: 'mr',
    title: 'Chief Marketing Officer',
    name: 'Marcus Rodriguez',
    initials: 'MR',
    color: '#cc00cc',
    expertise: [
      'Brand Strategy',
      'Digital Marketing',
      'Market Analysis',
      'Customer Experience'
    ]
  },
  {
    id: 'sw',
    title: 'Chief Financial Officer',
    name: 'Sarah Williams',
    initials: 'SW',
    color: '#88cc00',
    expertise: [
      'Financial Strategy',
      'Risk Management',
      'Investment Planning',
      'M&A'
    ]
  },
  {
    id: 'dk',
    title: 'Chief Technology Officer',
    name: 'David Kumar',
    initials: 'DK',
    color: '#008800',
    expertise: [
      'Technical Architecture',
      'Cloud Infrastructure',
      'AI/ML Integration',
      'Security'
    ]
  },
  {
    id: 'jl',
    title: 'Chief Operations Officer',
    name: 'Jennifer Liu',
    initials: 'JL',
    color: '#880044',
    expertise: [
      'Operations Management',
      'Process Optimization',
      'Supply Chain',
      'Quality Control'
    ]
  },
  {
    id: 'mf',
    title: 'Chief Human Resources Officer',
    name: 'Michael Foster',
    initials: 'MF',
    color: '#44cc00',
    expertise: [
      'Talent Management',
      'Organizational Development',
      'Culture Building',
      'DEI Initiatives'
    ]
  },
  {
    id: 'rj',
    title: 'Chief Compliance Officer',
    name: 'Rachel Johnson',
    initials: 'RJ',
    color: '#cc4400',
    expertise: [
      'Regulatory Compliance',
      'Risk Management',
      'Policy Development',
      'Ethics & Governance'
    ]
  },
  {
    id: 'bp',
    title: 'Chief Sales Officer',
    name: 'Benjamin Parker',
    initials: 'BP',
    color: '#00ccbb',
    expertise: [
      'Sales Strategy',
      'Customer Relationships',
      'Revenue Growth',
      'Team Leadership'
    ]
  },
  {
    id: 'lw',
    title: 'Chief Expansion Officer',
    name: 'Laura Wong',
    initials: 'LW',
    color: '#cc8800',
    expertise: [
      'Market Expansion',
      'Growth Strategy',
      'Business Scaling',
      'International Markets'
    ]
  },
  {
    id: 'rm',
    title: 'Chief Development Officer',
    name: 'Ryan Martinez',
    initials: 'RM',
    color: '#8800cc',
    expertise: [
      'Product Development',
      'Innovation Strategy',
      'Market Validation',
      'Lean Methodology'
    ]
  }
]; 