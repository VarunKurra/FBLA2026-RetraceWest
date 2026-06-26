export const PAGE_GUIDES = {
  '/': {
    title: 'Home',
    announce: 'Home page. RetraceWest is the Parkway West lost and found app for Parkway West High School. Sign in, browse the registry, report an item, or read how the system works.',
  },
  '/about': {
    title: 'About',
    announce: 'About page. Meet the team, read the project background, and see the core goals behind RetraceWest.',
  },
  '/auth': {
    title: 'Sign In',
    announce: 'Sign in page. Log in with your Parkway schools email or switch to the admin sign in portal.',
  },
  '/dashboard': {
    title: 'Dashboard',
    announce: 'Dashboard. See your points tier, recent claims, found items on campus, and quick links to report or browse items.',
  },
  '/registry': {
    title: 'Registry',
    announce: 'Registry. Browse lost and found items. Search by description, filter by category, and open an item to claim it or navigate to it on the map.',
  },
  '/report': {
    title: 'Report Item',
    announce: 'Report item page. File a lost or found report with a title, category, campus location, description, and optional photo.',
  },
  '/map': {
    title: 'Campus Map',
    announce: 'Campus map. View item markers on the school map. Select an item to see details or start walking directions.',
  },
  '/leaderboard': {
    title: 'Leaderboard',
    announce: 'Leaderboard. View student rankings by recovery points and apply to become a volunteer.',
  },
  '/admin': {
    title: 'Admin',
    announce: 'Admin panel. Review overview stats, the campus heat map, claim moderation, student accounts, and volunteer requests.',
  },
};

export function getPageGuide(pathname) {
  return PAGE_GUIDES[pathname] || {
    title: 'RetraceWest',
    announce: 'RetraceWest page loaded. Use the navigation bar to move between sections.',
  };
}

export function getPageAnnouncement(pathname) {
  const guide = getPageGuide(pathname);
  return `Now on ${guide.title}. ${guide.announce}`;
}

export function getAssistIntro(pathname) {
  const guide = getPageGuide(pathname);
  return [
    'Voice assist is on.',
    `You are on the ${guide.title} page.`,
    guide.announce,
    'Hover over a link or button for one second to hear what it is.',
    'Tab through the page to hear each control.',
    'Press the assist button again to turn voice assist off.',
  ].join(' ');
}
