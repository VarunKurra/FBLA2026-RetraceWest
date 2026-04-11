// Parkway West High School — hardcoded school data. No need for a full
// Missouri schools list anymore since this app is only for West High.

export const PARKWAY_WEST = {
  id: 'parkway-west',
  name: 'Parkway West High School',
  shortName: 'West High',
  city: 'Chesterfield',
  state: 'MO',
  address: '14653 Clayton Rd, Chesterfield, MO 63017',
  website: 'https://westhigh.parkwayschools.net',
  mascot: 'Longhorns',
  colors: { primary: '#B22234', secondary: '#1B2A4A', accent: '#D4A017' },
  // Coordinates for the school building itself
  coords: [38.6228, -90.5347],
  // Approx radius in miles for the campus
  radius: 0.28,
  emailDomain: '@parkwayschools.net',
  // Known locations on campus for quick selection in reports
  locations: [
    'Main Office',
    'Commons / Cafeteria',
    'Library / Media Center',
    'Gym (Main)',
    'Gym (Auxiliary)',
    'A-Hall',
    'B-Hall',
    'C-Hall',
    'D-Hall',
    'E-Hall',
    'Fine Arts Wing',
    'Science Wing',
    'Parking Lot A',
    'Parking Lot B',
    'Athletic Fields',
    'Auditorium',
    'Band Room',
    'Art Room',
    'Counseling Office',
    'Nurse\'s Office',
    'Student Entrance',
    'Bus Loop',
    'Weight Room',
    'Pool / Natatorium',
  ],
};

// keeping this export so old code that imports MISSOURI_SCHOOLS from context
// wont completely break while we're in the middle of the refactor
export const MISSOURI_SCHOOLS = [PARKWAY_WEST];
