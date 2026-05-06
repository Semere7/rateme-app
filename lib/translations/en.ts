export type Translation = {
  nav: {
    dashboard:      string
    achievements:   string
    compare:        string
    salary:         string
    friends:        string
    myProfile:      string
    settings:       string
    signOut:        string
    addAchievement: string
    language:       string
  }
  auth: {
    signInTitle:     string
    createAccount:   string
    email:           string
    password:        string
    fullName:        string
    username:        string
    signingIn:       string
    creatingAccount: string
    signIn:          string
    signUp:          string
    noAccount:       string
    haveAccount:     string
    createOne:       string
    signInLink:      string
    usernameMin:     string
    passwordMin:     string
  }
  dashboard: {
    socialScore:           string
    myAchievements:        string
    totalPoints:           string
    verified:              string
    socialRanking:         string
    recentActivity:        string
    salaryInsight:         string
    rank:                  string
    of:                    string
    top:                   string
    trust:                 string
    communication:         string
    helpfulness:           string
    respect:               string
    overall:               string
    ratedYou:              string
    youRated:              string
    friendRequest:         string
    noActivity:            string
    noRatings:             string
    editProfile:           string
    addFirstAchievement:   string
    setSalary:             string
    avgSalary:             string
    similarAchievers:      string
  }
  friends: {
    title:        string
    findFriends:  string
    search:       string
    pending:      string
    accepted:     string
    addFriend:    string
    cancel:       string
    accept:       string
    decline:      string
    noFriends:    string
    noPending:    string
    requestSent:  string
  }
  achievements: {
    title:          string
    add:            string
    noAchievements: string
    points:         string
    verified:       string
    pending:        string
  }
  compare: {
    title:      string
    searchUser: string
    selectUser: string
    vs:         string
    score:      string
    rank:       string
  }
  salary: {
    title:          string
    salaryRange:    string
    field:          string
    experience:     string
    country:        string
    employment:     string
    currency:       string
    saveSalary:     string
    updateSalary:   string
    benchmark:      string
    avgSalary:      string
    top10:          string
    yourSalary:     string
    yourRank:       string
    hiddenResult:   string
    benchmarkOptIn: string
    benchmarkNote:  string
  }
  profile: {
    editProfile: string
    bio:         string
    save:        string
    cancel:      string
    ratings:     string
    noRatings:   string
    rateUser:    string
  }
  common: {
    loading: string
    save:    string
    cancel:  string
    error:   string
    back:    string
    min:     string
    max:     string
  }
}

const en: Translation = {
  nav: {
    dashboard:      'Dashboard',
    achievements:   'Achievements',
    compare:        'Compare',
    salary:         'Salary',
    friends:        'Friends',
    myProfile:      'My Profile',
    settings:       'Settings',
    signOut:        'Sign out',
    addAchievement: '+ Add Achievement',
    language:       'Language',
  },
  auth: {
    signInTitle:     'Sign In',
    createAccount:   'Create Account',
    email:           'Email',
    password:        'Password',
    fullName:        'Full Name',
    username:        'Username',
    signingIn:       'Signing in…',
    creatingAccount: 'Creating account…',
    signIn:          'Sign In',
    signUp:          'Create Account',
    noAccount:       'No account?',
    haveAccount:     'Already have an account?',
    createOne:       'Create one',
    signInLink:      'Sign in',
    usernameMin:     'Username must be at least 3 characters',
    passwordMin:     'Password must be at least 6 characters',
  },
  dashboard: {
    socialScore:          'Social Score',
    myAchievements:       'My Achievements',
    totalPoints:          'Total Points',
    verified:             'Verified',
    socialRanking:        'Social Ranking',
    recentActivity:       'Recent Activity',
    salaryInsight:        'Salary Insight',
    rank:                 'Rank',
    of:                   'of',
    top:                  'Top',
    trust:                'Trust',
    communication:        'Communication',
    helpfulness:          'Helpfulness',
    respect:              'Respect',
    overall:              'Overall',
    ratedYou:             'rated you',
    youRated:             'you rated',
    friendRequest:        'friend request',
    noActivity:           'No recent activity',
    noRatings:            'No ratings yet',
    editProfile:          'Edit Profile',
    addFirstAchievement:  'Add your first achievement',
    setSalary:            'Set up salary profile',
    avgSalary:            'Avg salary',
    similarAchievers:     'users with similar achievement score',
  },
  friends: {
    title:       'Friends',
    findFriends: 'Find Friends',
    search:      'Search by name or username…',
    pending:     'Pending',
    accepted:    'Friends',
    addFriend:   'Add Friend',
    cancel:      'Cancel',
    accept:      'Accept',
    decline:     'Decline',
    noFriends:   'No friends yet',
    noPending:   'No pending requests',
    requestSent: 'Request sent',
  },
  achievements: {
    title:          'Achievements',
    add:            '+ Add Achievement',
    noAchievements: 'No achievements yet',
    points:         'points',
    verified:       'Verified',
    pending:        'Pending',
  },
  compare: {
    title:      'Compare & Rank',
    searchUser: 'Search for a user…',
    selectUser: 'Select a user to compare',
    vs:         'vs',
    score:      'Score',
    rank:       'Rank',
  },
  salary: {
    title:          'Salary Insights',
    salaryRange:    'Monthly salary range',
    field:          'Field / profession',
    experience:     'Experience level',
    country:        'Country',
    employment:     'Employment type',
    currency:       'Currency',
    saveSalary:     'Save & see insights',
    updateSalary:   'Update salary profile',
    benchmark:      'Salary Benchmark',
    avgSalary:      'Avg salary',
    top10:          'Top 10%',
    yourSalary:     'Your salary',
    yourRank:       'Your rank',
    hiddenResult:   'Not enough data yet',
    benchmarkOptIn: 'Use my salary anonymously in benchmarks',
    benchmarkNote:  'Your exact salary stays private. It is only used in anonymous aggregate calculations.',
  },
  profile: {
    editProfile: 'Edit Profile',
    bio:         'Bio',
    save:        'Save',
    cancel:      'Cancel',
    ratings:     'Ratings',
    noRatings:   'No ratings yet',
    rateUser:    'Rate',
  },
  common: {
    loading: 'Loading…',
    save:    'Save',
    cancel:  'Cancel',
    error:   'Something went wrong',
    back:    'Back',
    min:     'Min',
    max:     'Max',
  },
}

export default en
