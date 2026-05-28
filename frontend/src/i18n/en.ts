export default {
  pages: {
    login: {
      title: 'Sign in',
      description: 'Access the dashboard with your email, username or phone.',
      identifier: 'Email, username or phone',
      password: 'Password',
      submit: 'Sign in',
      loading: 'Signing in...',
      signupPrompt: "Don't have an account?",
      signupLink: 'Create one here'
    },
    register: {
      title: 'Create account',
      description: 'Create an account to manage clients and appointments.',
      name: 'Full name',
      username: 'Username',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      confirmPassword: 'Repeat password',
      submit: 'Create account',
      loading: 'Submitting...',
      signinPrompt: 'Already registered?',
      signinLink: 'Sign in here'
    },
    appointments: {
      title: 'Scheduling',
      description: 'Manage appointments, clients and services in one place.',
      newButton: 'New appointment',
      calendar: {
        detailsTitle: 'Appointment details',
        attend: 'Attend',
        cancel: 'Cancel',
        edit: 'Edit'
      }
    },
    clients: {
      title: 'Clients',
      description: 'Manage your client list and contact details.'
    },
    services: {
      title: 'Services',
      description: 'Organize offered services and shared consumables.'
    },
    products: {
      title: 'Products',
      description: 'Register products for sale and salon supplies.'
    },
    stock: {
      title: 'Stock forecast',
      description: 'Track expected consumption and plan purchases.'
    },
    movements: {
      title: 'Stock movements',
      description: 'Register entries, exits and adjustments.'
    }
  },
  settings: {
    account: 'Account settings',
    primaryColor: 'Primary color',
    language: 'Language',
    logout: 'Sign out',
    menuLabel: 'Settings',
    languages: {
      en: 'English',
      'pt-BR': 'Portuguese (Brazil)'
    }
  },
  navigation: {
    appointments: 'Appointments',
    clients: 'Clients',
    services: 'Services',
    products: 'Products',
    stock: 'Stock',
    movements: 'Movements'
  },
  common: {
    cancel: 'Cancel',
    save: 'Save',
    reload: 'Reload'
  }
} satisfies Record<string, any>;
