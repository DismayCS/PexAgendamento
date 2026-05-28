import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const at = (daysFromNow: number, hour: number) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

const buildMonthDates = () => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const year = start.getFullYear();
  const month = start.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_v, idx) => {
    const dayDate = new Date(year, month, idx + 1);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate;
  });
};

async function main() {
  const senha_hash = await bcrypt.hash('123456', 10);
  await prisma.usuario.upsert({
    where: { usuario: 'admin' },
    update: {},
    create: {
      nome_completo: 'Admin Demo',
      usuario: 'admin',
      email: 'admin@example.com',
      celular: '11999990000',
      senha_hash
    }
  });

  const clientsData = [
    { nome_completo: 'Ana Souza', cpf: '12345678901', data_nascimento: new Date('1990-03-12'), endereco: 'Rua das Flores, 123 - Guaiba/RS', telefone_fixo: '5133345566', celular: '51987654321', email: 'ana.souza@example.com' },
    { nome_completo: 'Bruna Lima', cpf: '98765432100', data_nascimento: new Date('1988-07-25'), endereco: 'Av. Central, 999 - Guaiba/RS', telefone_fixo: '5132224455', celular: '51999887766', email: 'bruna.lima@example.com' },
    { nome_completo: 'Carla Ferreira', cpf: '45678912300', data_nascimento: new Date('1993-11-05'), endereco: 'R. Vergueiro, 450 - Guaiba/RS', telefone_fixo: '5132110099', celular: '51970002233', email: 'carla.ferreira@example.com' },
    { nome_completo: 'Debora Santos', cpf: '32165498700', data_nascimento: new Date('1985-04-18'), endereco: 'R. dos Pinheiros, 800 - Guaiba/RS', telefone_fixo: '5131992233', celular: '51960004455', email: 'debora.santos@example.com' },
    { nome_completo: 'Eduarda Nunes', cpf: '65498732100', data_nascimento: new Date('1995-01-30'), endereco: 'Av. Brigadeiro, 300 - Guaiba/RS', telefone_fixo: '5134882200', celular: '51981112233', email: 'eduarda.nunes@example.com' },
    { nome_completo: 'Fernanda Ribeiro', cpf: '85274196300', data_nascimento: new Date('1991-09-14'), endereco: 'R. Heitor Penteado, 1100 - Guaiba/RS', telefone_fixo: '5135007788', celular: '51995556677', email: 'fernanda.ribeiro@example.com' },
    { nome_completo: 'Gabriela Torres', cpf: '74185296300', data_nascimento: new Date('1992-12-02'), endereco: 'R. Clelia, 210 - Guaiba/RS', telefone_fixo: '5134665522', celular: '51987778899', email: 'gabriela.torres@example.com' },
    { nome_completo: 'Helena Costa', cpf: '96325874100', data_nascimento: new Date('1987-06-08'), endereco: 'R. Cardeal Arcoverde, 1500 - Guaiba/RS', telefone_fixo: '5131227788', celular: '51974443322', email: 'helena.costa@example.com' },
    { nome_completo: 'Isabella Martins', cpf: '15975348620', data_nascimento: new Date('1994-08-22'), endereco: 'R. Fradique Coutinho, 280 - Guaiba/RS', telefone_fixo: '5132778899', celular: '51981114455', email: 'isabella.martins@example.com' },
    { nome_completo: 'Juliana Prado', cpf: '26841975360', data_nascimento: new Date('1989-05-17'), endereco: 'Av. Sumare, 700 - Guaiba/RS', telefone_fixo: '5132441133', celular: '51996661234', email: 'juliana.prado@example.com' },
    { nome_completo: 'Larissa Almeida', cpf: '30715928460', data_nascimento: new Date('1986-10-03'), endereco: 'R. Cerro Cora, 1200 - Guaiba/RS', telefone_fixo: '5132116655', celular: '51993337700', email: 'larissa.almeida@example.com' },
    { nome_completo: 'Mariana Silva', cpf: '41978523610', data_nascimento: new Date('1992-02-14'), endereco: 'R. Harmonia, 450 - Guaiba/RS', telefone_fixo: '5132448899', celular: '51995558811', email: 'mariana.silva@example.com' },
    { nome_completo: 'Natalia Pires', cpf: '52874196300', data_nascimento: new Date('1990-06-10'), endereco: 'R. Capote Valente, 320 - Guaiba/RS', telefone_fixo: '5133112299', celular: '51981113344', email: 'natalia.pires@example.com' },
    { nome_completo: 'Olivia Mendes', cpf: '63521987400', data_nascimento: new Date('1987-03-28'), endereco: 'Av. Reboucas, 1800 - Guaiba/RS', telefone_fixo: '5132334455', celular: '51992233445', email: 'olivia.mendes@example.com' },
    { nome_completo: 'Patricia Rocha', cpf: '74236915800', data_nascimento: new Date('1993-09-09'), endereco: 'R. Oscar Freire, 900 - Guaiba/RS', telefone_fixo: '5132556677', celular: '51998887766', email: 'patricia.rocha@example.com' },
    { nome_completo: 'Renata Dias', cpf: '85149276300', data_nascimento: new Date('1985-11-19'), endereco: 'Av. Faria Lima, 2500 - Guaiba/RS', telefone_fixo: '5133445566', celular: '51994445511', email: 'renata.dias@example.com' },
    { nome_completo: 'Silvia Ramos', cpf: '91478523600', data_nascimento: new Date('1991-01-05'), endereco: 'R. Teodoro Sampaio, 700 - Guaiba/RS', telefone_fixo: '5133667788', celular: '51997776655', email: 'silvia.ramos@example.com' },
    { nome_completo: 'Teresa Cunha', cpf: '62359814700', data_nascimento: new Date('1988-12-30'), endereco: 'R. Bela Cintra, 430 - Guaiba/RS', telefone_fixo: '5132558899', celular: '51993332211', email: 'teresa.cunha@example.com' },
    { nome_completo: 'Vanessa Araujo', cpf: '73519824600', data_nascimento: new Date('1990-04-04'), endereco: 'R. Joao Moura, 510 - Guaiba/RS', telefone_fixo: '5133779900', celular: '51990001122', email: 'vanessa.araujo@example.com' },
    { nome_completo: 'Aline Barros', cpf: '86421975300', data_nascimento: new Date('1994-07-21'), endereco: 'Av. Angelica, 1220 - Guaiba/RS', telefone_fixo: '5133442211', celular: '51995551212', email: 'aline.barros@example.com' },
    { nome_completo: 'Beatriz Castro', cpf: '97531864200', data_nascimento: new Date('1986-02-08'), endereco: 'R. Augusta, 1550 - Guaiba/RS', telefone_fixo: '5133554466', celular: '51997778844', email: 'beatriz.castro@example.com' },
    { nome_completo: 'Camila Duarte', cpf: '18642975300', data_nascimento: new Date('1991-05-19'), endereco: 'R. Cardoso de Almeida, 980 - Guaiba/RS', telefone_fixo: '5133664411', celular: '51993335566', email: 'camila.duarte@example.com' },
    { nome_completo: 'Daniela Esteves', cpf: '29753186400', data_nascimento: new Date('1989-03-14'), endereco: 'Av. Pacaembu, 400 - Guaiba/RS', telefone_fixo: '5133882211', celular: '51991112233', email: 'daniela.esteves@example.com' },
    { nome_completo: 'Elisa Fernandes', cpf: '31864297500', data_nascimento: new Date('1993-08-02'), endereco: 'R. Itacolomi, 210 - Guaiba/RS', telefone_fixo: '5133221144', celular: '51992223344', email: 'elisa.fernandes@example.com' },
    { nome_completo: 'Flavia Gomes', cpf: '42975318600', data_nascimento: new Date('1987-06-27'), endereco: 'R. Minas Gerais, 150 - Guaiba/RS', telefone_fixo: '5133445566', celular: '51996667788', email: 'flavia.gomes@example.com' },
    { nome_completo: 'Heloysa Andrade', cpf: '54086429700', data_nascimento: new Date('1992-10-12'), endereco: 'R. da Consolacao, 900 - Guaiba/RS', telefone_fixo: '5133998855', celular: '51990003344', email: 'heloysa.andrade@example.com' },
    { nome_completo: 'Ingrid Queiroz', cpf: '65197384200', data_nascimento: new Date('1990-08-18'), endereco: 'R. Bento Goncalves, 120 - Guaiba/RS', telefone_fixo: '5133887766', celular: '51992221100', email: 'ingrid.queiroz@example.com' },
    { nome_completo: 'Joana Moreira', cpf: '76208493100', data_nascimento: new Date('1988-01-24'), endereco: 'Av. Republica, 640 - Guaiba/RS', telefone_fixo: '5133554411', celular: '51994443322', email: 'joana.moreira@example.com' },
    { nome_completo: 'Katia Freitas', cpf: '87319542000', data_nascimento: new Date('1992-03-31'), endereco: 'R. Santa Catarina, 230 - Guaiba/RS', telefone_fixo: '5133669988', celular: '51997771100', email: 'katia.freitas@example.com' },
    { nome_completo: 'Luana Peixoto', cpf: '98420653100', data_nascimento: new Date('1987-07-07'), endereco: 'Av. Brasil, 1500 - Guaiba/RS', telefone_fixo: '5133223311', celular: '51990007788', email: 'luana.peixoto@example.com' },
    { nome_completo: 'Melissa Teixeira', cpf: '19531764200', data_nascimento: new Date('1994-05-15'), endereco: 'R. Pelotas, 420 - Guaiba/RS', telefone_fixo: '5133111144', celular: '51995551122', email: 'melissa.teixeira@example.com' },
    { nome_completo: 'Nicole Carvalho', cpf: '20642875300', data_nascimento: new Date('1991-11-11'), endereco: 'R. Canoas, 310 - Guaiba/RS', telefone_fixo: '5133442299', celular: '51991114477', email: 'nicole.carvalho@example.com' },
    { nome_completo: 'Priscila Almeida', cpf: '31753986400', data_nascimento: new Date('1986-09-02'), endereco: 'Av. Porto Alegre, 800 - Guaiba/RS', telefone_fixo: '5133556677', celular: '51997770011', email: 'priscila.almeida@example.com' },
    { nome_completo: 'Queila Barbosa', cpf: '42864097500', data_nascimento: new Date('1993-12-20'), endereco: 'R. Pelotas, 1020 - Guaiba/RS', telefone_fixo: '5133997744', celular: '51990002255', email: 'queila.barbosa@example.com' },
    { nome_completo: 'Rafaela Matos', cpf: '53975108600', data_nascimento: new Date('1989-02-13'), endereco: 'R. Bento Ribeiro, 210 - Guaiba/RS', telefone_fixo: '5133225588', celular: '51993338877', email: 'rafaela.matos@example.com' }
  ];

  await prisma.cliente.createMany({ data: clientsData, skipDuplicates: true });
  const clients = await prisma.cliente.findMany({
    where: { nome_completo: { in: clientsData.map((c) => c.nome_completo) } }
  });
  const clientByName = Object.fromEntries(clients.map((c) => [c.nome_completo, c]));

  const servicesData = [
    { nome: 'Corte feminino', duracao: 60, observacao: 'Lavagem inclusa', preco: 120 },
    { nome: 'Corte masculino', duracao: 40, observacao: 'Modelagem inclusa', preco: 80 },
    { nome: 'Coloracao', duracao: 120, observacao: 'Tonalizacao completa', preco: 260 },
    { nome: 'Escova e finalizacao', duracao: 70, observacao: 'Protecao termica incluida', preco: 110 },
    { nome: 'Hidratacao profunda', duracao: 50, observacao: 'Mascara nutritiva', preco: 150 }
  ];

  await prisma.servico.createMany({ data: servicesData, skipDuplicates: true });
  const services = await prisma.servico.findMany({
    where: { nome: { in: servicesData.map((s) => s.nome) } }
  });
  const serviceByName = Object.fromEntries(services.map((s) => [s.nome, s]));

  const productsData = [
    { nome: 'Shampoo regenerador', tipo: 'Higienizacao', quantidade: 50, preco: 48, tamanho: 300, unidade: 'ML', classe: 'INSUMO' },
    { nome: 'Condicionador nutritivo', tipo: 'Tratamento', quantidade: 42, preco: 55, tamanho: 300, unidade: 'ML', classe: 'INSUMO' },
    { nome: 'Mascara reconstrutora', tipo: 'Tratamento', quantidade: 35, preco: 89, tamanho: 250, unidade: 'ML', classe: 'INSUMO' },
    { nome: 'Oleo finalizador', tipo: 'Finalizacao', quantidade: 28, preco: 65, tamanho: 100, unidade: 'ML', classe: 'INSUMO' },
    { nome: 'Pomada modeladora', tipo: 'Finalizacao', quantidade: 60, preco: 39, tamanho: 80, unidade: 'G', classe: 'INSUMO' },
    { nome: 'Tonalizante cobre', tipo: 'Coloracao', quantidade: 24, preco: 75, tamanho: 90, unidade: 'ML', classe: 'INSUMO' },
    { nome: 'Leave-in antifrizz', tipo: 'Finalizacao', quantidade: 40, preco: 58, tamanho: 150, unidade: 'ML', classe: 'INSUMO' },
    { nome: 'Kit home care (shampoo + mascara)', tipo: 'Venda', quantidade: 18, preco: 189, tamanho: 550, unidade: 'ML', classe: 'VENDA' }
  ];

  await prisma.produto.createMany({ data: productsData, skipDuplicates: true });
  const products = await prisma.produto.findMany({
    where: { nome: { in: productsData.map((p) => p.nome) } }
  });
  const productByName = Object.fromEntries(products.map((p) => [p.nome, p]));

  const serviceProductsData = [
    { servico: 'Corte feminino', produto: 'Shampoo regenerador', consumo: 15 },
    { servico: 'Corte feminino', produto: 'Condicionador nutritivo', consumo: 12 },
    { servico: 'Corte masculino', produto: 'Shampoo regenerador', consumo: 12 },
    { servico: 'Corte masculino', produto: 'Pomada modeladora', consumo: 5 },
    { servico: 'Coloracao', produto: 'Tonalizante cobre', consumo: 50 },
    { servico: 'Coloracao', produto: 'Mascara reconstrutora', consumo: 20 },
    { servico: 'Escova e finalizacao', produto: 'Shampoo regenerador', consumo: 15 },
    { servico: 'Escova e finalizacao', produto: 'Leave-in antifrizz', consumo: 10 },
    { servico: 'Hidratacao profunda', produto: 'Mascara reconstrutora', consumo: 30 },
    { servico: 'Hidratacao profunda', produto: 'Oleo finalizador', consumo: 4 }
  ].map((item) => ({
    servico_id: serviceByName[item.servico].id,
    produto_id: productByName[item.produto].id,
    consumo: item.consumo
  }));

  await prisma.servicoProduto.createMany({ data: serviceProductsData, skipDuplicates: true });

  const stockMoves = [
    { produto: 'Shampoo regenerador', quantidade: 30, observacao: 'Lote inicial' },
    { produto: 'Condicionador nutritivo', quantidade: 24, observacao: 'Lote inicial' },
    { produto: 'Mascara reconstrutora', quantidade: 18, observacao: 'Lote inicial' },
    { produto: 'Oleo finalizador', quantidade: 16, observacao: 'Lote inicial' },
    { produto: 'Pomada modeladora', quantidade: 40, observacao: 'Lote inicial' },
    { produto: 'Tonalizante cobre', quantidade: 12, observacao: 'Lote inicial' },
    { produto: 'Leave-in antifrizz', quantidade: 22, observacao: 'Lote inicial' },
    { produto: 'Kit home care (shampoo + mascara)', quantidade: 10, observacao: 'Prateleira de vendas' }
  ].map((move) => ({
    produto_id: productByName[move.produto].id,
    tipo: 'ENTRADA' as const,
    quantidade: move.quantidade,
    observacao: move.observacao
  }));

  await prisma.movimentoEstoque.createMany({ data: stockMoves, skipDuplicates: true });

  // Limpa agendamentos anteriores para repovoar o mes atual
  await prisma.agendamentoProduto.deleteMany();
  await prisma.agendamento.deleteMany();

  const monthDays = buildMonthDates();
  const hours = [9, 10, 11, 13, 14, 16, 17, 18];
  const clientsList = Object.values(clientByName);
  const servicesList = Object.values(serviceByName);

  let idx = 0;
  for (const dayIndex in monthDays) {
    const day = monthDays[dayIndex as unknown as number];
    const perDay = 5 + (Number(dayIndex) % 3); // 5, 6, 7 alternando

    for (let i = 0; i < perDay; i++) {
      const cliente = clientsList[(idx + i) % clientsList.length];
      const servico = servicesList[(idx + i * 2) % servicesList.length];
      const hour = hours[i % hours.length];
      const slot = new Date(day);
      slot.setHours(hour, 0, 0, 0);

      const agendamento = await prisma.agendamento.create({
        data: {
          cliente_id: cliente.id,
          servico_id: servico.id,
          data_hora: slot,
          status: 'AGENDADO',
          metodo_pagamento: ['PIX', 'DEBITO', 'CREDITO', 'DINHEIRO'][(idx + i) % 4] as any
        }
      });

      const relatedProducts = serviceProductsData.filter((sp) => sp.servico_id === servico.id);
      if (relatedProducts.length) {
        await prisma.agendamentoProduto.createMany({
          data: relatedProducts.map((sp) => ({
            agendamento_id: agendamento.id,
            produto_id: sp.produto_id,
            consumo: sp.consumo
          }))
        });
      }
    }

    idx += perDay;
  }

  console.log('Seed concluido com usuarios, clientes, servicos, produtos e agendamentos de exemplo.');
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
