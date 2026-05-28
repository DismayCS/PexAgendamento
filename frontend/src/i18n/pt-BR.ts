export default {
  pages: {
    login: {
      title: 'Entrar',
      description: 'Acesse o painel com seu e-mail, usuário ou celular.',
      identifier: 'E-mail, usuário ou celular',
      password: 'Senha',
      submit: 'Entrar',
      loading: 'Entrando...',
      signupPrompt: 'Não possui conta?',
      signupLink: 'Cadastre-se aqui'
    },
    register: {
      title: 'Crie sua conta',
      description: 'Cadastre-se para gerenciar clientes e agendamentos.',
      name: 'Nome completo',
      username: 'Usuário',
      email: 'E-mail',
      phone: 'Celular',
      password: 'Senha',
      confirmPassword: 'Repetir senha',
      submit: 'Criar conta',
      loading: 'Enviando...',
      signinPrompt: 'Já possui conta?',
      signinLink: 'Entre aqui'
    },
    appointments: {
      title: 'Agenda',
      description: 'Controle horários, clientes e serviços em um único painel.',
      newButton: 'Novo agendamento',
      calendar: {
        detailsTitle: 'Detalhes do agendamento',
        attend: 'Atender',
        cancel: 'Desmarcar',
        edit: 'Editar'
      }
    },
    clients: {
      title: 'Clientes',
      description: 'Gerencie a lista de clientes e dados de contato.'
    },
    services: {
      title: 'Serviços',
      description: 'Organize os serviços oferecidos e os insumos usados.'
    },
    products: {
      title: 'Produtos',
      description: 'Cadastre produtos para venda e insumos do salão.'
    },
    stock: {
      title: 'Previsão de estoque',
      description: 'Monitoramento do consumo previsto para planejar compras.'
    },
    movements: {
      title: 'Movimentações de estoque',
      description: 'Registre entradas, saídas e reajustes.'
    }
  },
  settings: {
    account: 'Configurações da conta',
    primaryColor: 'Cor principal',
    language: 'Idioma',
    logout: 'Sair',
    menuLabel: 'Configurações',
    languages: {
      en: 'Inglês',
      'pt-BR': 'Português (Brasil)'
    }
  },
  navigation: {
    appointments: 'Agendamentos',
    clients: 'Clientes',
    services: 'Servi\u00e7os',
    products: 'Produtos',
    stock: 'Estoque',
    movements: 'Movimenta\u00e7\u00f5es'
  },
  common: {
    cancel: 'Cancelar',
    save: 'Salvar',
    reload: 'Recarregar'
  }
} satisfies Record<string, any>;
