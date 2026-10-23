// Conteúdos das três trilhas de aprendizagem do FinEdu.
// Cada aula contém: título, objetivo, conteúdo, exemplo e atividade.
// Questionários e regras de XP serão implementados separadamente.

type LessonContent = [
  title: string,
  objective: string,
  explanation: string,
  example: string,
  exercise: string,
];

interface TrailContent {
  id: string;
  title: string;
  description: string;
  colorHex: string;
  lessons: LessonContent[];
}

export const trailContent: TrailContent[] = [
  {
    id: "seed-curso-financas-basicas",
    title: "Organize sua vida financeira",
    description:
      "Entenda receitas, despesas, orçamento e metas financeiras com exemplos próximos do cotidiano.",
    colorHex: "#4ADE80",
    lessons: [
      [
        "Entendendo suas receitas e despesas",

        "Entender a diferença entre receitas e despesas e reconhecer a importância de acompanhar os gastos.",

        `Você já chegou ao final do mês e se perguntou para onde foi todo o seu dinheiro? Essa situação é muito comum, principalmente quando não acompanhamos nossos gastos de perto. O primeiro passo para organizar sua vida financeira é entender a diferença entre receitas e despesas.

### O que são receitas?

Receitas são todos os valores que você recebe durante um período, normalmente um mês. Elas podem vir do salário, estágio, trabalhos extras, mesada, ajuda financeira da família, vendas ou rendimentos de investimentos.

Imagine que você recebe R$ 1.500 por mês em um estágio e mais R$ 200 com pequenos trabalhos. Sua receita mensal total será de R$ 1.700. Conhecer esse número permite entender quanto está disponível para pagar despesas e alcançar objetivos.

### O que são despesas?

Despesas são os valores gastos com produtos, serviços e compromissos.

- **Despesas fixas:** costumam se repetir com valores iguais ou semelhantes, como aluguel, mensalidade da faculdade ou plano de celular.
- **Despesas variáveis:** mudam conforme o consumo, como passeios, alimentação fora de casa, compras e transporte por aplicativo.

### Por que acompanhar seus gastos?

Pequenos gastos podem parecer insignificantes separadamente. Mas gastar R$ 15 em um lanche, cinco vezes por semana, representa aproximadamente R$ 300 em quatro semanas.

Isso não significa abrir mão de tudo que você gosta; significa saber o efeito de cada escolha no seu orçamento.

> O controle financeiro não serve para impedir você de gastar, mas para ajudar a gastar melhor.`,

        `Considere o seguinte orçamento mensal:

| Categoria | Valor mensal |
| --- | ---: |
| Receita mensal | R$ 2.000 |
| Alimentação | R$ 450 |
| Transporte | R$ 250 |
| Faculdade | R$ 500 |
| Lazer | R$ 200 |
| Assinaturas | R$ 100 |
| **Saldo restante** | **R$ 500** |

Nesse exemplo, a pessoa possui R$ 500 depois de pagar as despesas listadas. Esse dinheiro pode ser direcionado a uma reserva, investimentos ou metas.

Se as despesas ultrapassassem os R$ 2.000 recebidos, o orçamento estaria negativo e seria necessário rever gastos ou buscar soluções para aumentar a renda.`,

        `Durante os próximos três dias, anote todos os seus gastos, mesmo os menores. Depois, identifique quais são fixos e quais são variáveis.

Esta atividade é uma reflexão pessoal. Não é necessário enviar seus dados financeiros para a plataforma.`,
      ],
      [
        "Construindo seu orçamento mensal",

        "Organizar receitas e despesas em um orçamento mensal realista, considerando necessidades, desejos e objetivos financeiros.",

        `Agora que você entende suas receitas e despesas, o próximo passo é organizar essas informações. Um orçamento mensal é um plano que mostra quanto você espera receber, quanto pretende gastar e quanto deseja guardar. Ele funciona como um mapa para as decisões financeiras do dia a dia.

Sem planejamento, é comum gastar primeiro e tentar economizar apenas o que sobra. O problema é que muitas vezes não sobra nada. Um orçamento ajuda a definir prioridades antes que o dinheiro acabe.

### Como começar?

Primeiro, registre sua renda e liste suas despesas. Depois, separe o dinheiro em três categorias:

- **Necessidades essenciais:** moradia, alimentação, transporte e contas básicas.
- **Desejos e estilo de vida:** lazer, jogos, restaurantes e serviços de streaming.
- **Objetivos financeiros:** reserva, viagens, estudos e investimentos.

### A regra 50/30/20

Uma referência conhecida sugere dividir a renda líquida em:

- **50% para necessidades.**
- **30% para desejos.**
- **20% para objetivos financeiros.**

Essa regra não é uma obrigação. Quem possui uma renda menor, gastos essenciais elevados ou uma realidade familiar diferente pode precisar de outra divisão. O orçamento precisa ser realista para funcionar.

### Como manter o orçamento funcionando?

Você pode acompanhar os gastos em aplicativo, planilha ou nas notas do celular.

No final do mês, compare os valores planejados aos realizados. Se uma categoria ultrapassou o limite, procure entender o motivo e faça um ajuste no mês seguinte.

Orçamento é uma ferramenta flexível: aprender e corrigir faz parte do processo.

> Planejamento financeiro é um processo de aprendizado e adaptação.`,

        `Com uma renda líquida de R$ 2.000, a divisão de referência 50/30/20 seria:

| Categoria | Percentual | Valor mensal |
| --- | ---: | ---: |
| Necessidades essenciais | 50% | R$ 1.000 |
| Desejos e estilo de vida | 30% | R$ 600 |
| Objetivos financeiros | 20% | R$ 400 |
| **Total** | **100%** | **R$ 2.000** |

Os valores são uma referência didática. A distribuição deve ser ajustada à realidade de cada pessoa, preservando as despesas essenciais.`,

        `Imagine que você recebe R$ 1.500 por mês. Como distribuiria esse dinheiro entre necessidades, lazer e objetivos?

Monte uma divisão considerando sua realidade.

Esta atividade é uma reflexão pessoal. Não é necessário enviar seus dados financeiros para a plataforma.`,
      ],
      [
        "Transformando sonhos em metas financeiras",

        "Transformar um objetivo pessoal em uma meta financeira com valor, prazo e planejamento de contribuições mensais.",

        `Comprar um notebook, viajar, pagar um curso ou conquistar independência financeira são sonhos que podem depender de dinheiro.

Mas desejar algo é diferente de planejar sua realização. Uma meta financeira combina um objetivo, um valor e um prazo.

### Como definir uma boa meta?

Uma meta deve responder:

- **O que quero conquistar?**
- **Quanto custa?**
- **Em quanto tempo quero alcançar?**

Com essas informações, você consegue estimar quanto precisa guardar por mês e avaliar se esse valor cabe no orçamento.

### Metas de curto, médio e longo prazo

- **Curto prazo:** costumam ser alcançadas em até aproximadamente um ano, como um celular ou uma viagem.
- **Médio prazo:** podem levar alguns anos, como uma especialização ou motocicleta.
- **Longo prazo:** envolvem períodos maiores, como comprar um imóvel ou formar patrimônio.

Esses prazos são referências e variam conforme a pessoa.

### Comece pequeno e acompanhe o progresso

Se a meta é juntar R$ 6.000, divida-a em marcos:

- R$ 500.
- R$ 1.500.
- R$ 3.000.
- R$ 6.000.

Isso torna a caminhada menos abstrata. Imprevistos podem exigir ajustes de prazo ou valor, e isso é normal.

> Consistência é mais importante do que perfeição.`,

        `Imagine a compra de um notebook de R$ 2.400 em 12 meses.

| Informação | Valor |
| --- | ---: |
| Custo do notebook | R$ 2.400 |
| Prazo | 12 meses |
| Valor mensal necessário | R$ 200 |

**Cálculo:** R$ 2.400 ÷ 12 = R$ 200 por mês.

O cálculo desconsidera rendimentos e mudanças de preço. Antes de adotar a meta, verifique se o valor mensal cabe no orçamento sem comprometer despesas essenciais.`,

        `Escolha um objetivo que gostaria de alcançar nos próximos 12 meses.

Estime seu custo e calcule quanto precisaria guardar mensalmente sem comprometer despesas essenciais.

Esta atividade é uma reflexão pessoal. Não é necessário enviar seus dados financeiros para a plataforma.`,
      ],
    ],
  },
  {
    id: "seed-curso-reserva-emergencia",
    title: "Construa sua reserva de emergência",
    description:
      "Compreenda a função da reserva, estime uma meta e desenvolva o hábito de guardar dinheiro.",
    colorHex: "#22C55E",
    lessons: [
      [
        "Por que precisamos de uma reserva de emergência?",

        "Compreender a função da reserva de emergência e distinguir imprevistos de gastos planejáveis.",

        `Imagine que seu celular, necessário para estudar ou trabalhar, pare de funcionar. Ou que você perca uma fonte de renda e ainda precise pagar suas contas.

Mesmo com um bom orçamento, imprevistos acontecem. Para lidar com eles, é importante construir uma reserva de emergência.

### O que é uma reserva de emergência?

É uma quantia separada para enfrentar despesas inesperadas e relevantes. Ela ajuda a evitar que uma situação urgente leve imediatamente ao uso de empréstimos ou ao acúmulo de dívidas.

Exemplos incluem:

- Perda de renda.
- Reparos urgentes na casa.
- Despesas médicas imprevistas.
- Consertos necessários para trabalhar.

### Emergência não é qualquer gasto

Uma promoção, uma viagem de última hora ou o lançamento de um novo celular não são emergências. São desejos que podem ser atendidos por metas planejadas.

Usar a reserva para compras comuns pode deixá-lo desprotegido quando um problema real acontecer.

### Três características importantes

- **Segurança:** priorizar alternativas com baixo risco de perda.
- **Liquidez:** poder resgatar o dinheiro com facilidade.
- **Acessibilidade:** obter os recursos dentro do tempo exigido pela emergência, considerando horários e condições de resgate.

A prioridade da reserva não é a maior rentabilidade, mas a proteção financeira.

### E se eu ainda não consigo guardar muito?

Não é necessário começar com uma quantia alta. Separar R$ 20, R$ 30 ou R$ 50 por mês pode ajudar a construir o hábito.

Escolha um valor possível, sem comprometer alimentação, moradia ou outras necessidades essenciais.

> Uma reserva pequena já pode fazer diferença.`,

        `Compare estas duas situações:

- **O celular necessário para estudar ou trabalhar parou de funcionar:** um conserto essencial e inesperado pode justificar o uso da reserva.
- **Um novo modelo de celular entrou em promoção:** a compra é um desejo que pode receber planejamento próprio.

A diferença está na necessidade e na urgência do gasto, e não apenas no produto envolvido.`,

        `Pense em dois imprevistos que poderiam afetar sua rotina atualmente. Estime quanto custaria lidar com cada um deles.

Esta atividade é uma reflexão pessoal. Não é necessário enviar seus dados financeiros para a plataforma.`,
      ],
      [
        "Quanto dinheiro devo guardar?",

        "Estimar uma meta de reserva considerando despesas essenciais, estabilidade da renda e responsabilidades financeiras.",

        `O tamanho adequado da reserva depende das despesas essenciais, da estabilidade da renda e das responsabilidades financeiras de cada pessoa.

Por isso, não existe um único valor que funcione para todo mundo.

### Conheça suas despesas essenciais

Comece somando o custo mensal de necessidades como:

- Moradia.
- Alimentação.
- Transporte.
- Água e energia.
- Outras contas indispensáveis.

### Quantos meses considerar?

Uma referência comum é formar uma reserva equivalente a 3 a 6 meses de despesas essenciais.

Quem possui renda variável, maior instabilidade profissional ou mais pessoas dependentes financeiramente pode necessitar de uma proteção superior.

### Construa por etapas

Esses valores podem assustar no começo, mas não precisam ser alcançados de uma vez.

Você pode iniciar com R$ 300, depois buscar R$ 1.000, um mês de despesas e, gradualmente, vários meses.

Se suas despesas ou responsabilidades mudarem, reavalie a meta.

> A reserva deve ser construída de acordo com sua realidade, e não com a de outras pessoas.`,

        `Considere estas despesas essenciais:

| Despesa essencial | Valor mensal |
| --- | ---: |
| Moradia | R$ 700 |
| Alimentação | R$ 400 |
| Transporte | R$ 200 |
| Contas básicas | R$ 200 |
| **Total mensal** | **R$ 1.500** |

Nesse exemplo:

- **Três meses:** R$ 1.500 × 3 = R$ 4.500.
- **Seis meses:** R$ 1.500 × 6 = R$ 9.000.

São referências de cálculo. A meta deve considerar a situação de cada pessoa.`,

        `Estime suas despesas essenciais por mês. Multiplique o total por três e use o resultado como primeira referência de meta, ajustando-a à sua situação.

Esta atividade é uma reflexão pessoal. Não é necessário enviar seus dados financeiros para a plataforma.`,
      ],
      [
        "Como criar o hábito de guardar dinheiro",

        "Planejar contribuições possíveis e desenvolver consistência na construção e recomposição da reserva.",

        `Saber que precisamos economizar é diferente de transformar a intenção em rotina.

Guardar dinheiro exige planejamento, repetição e metas compatíveis com a renda disponível. A boa notícia é que não é necessário começar com valores altos.

### Consistência vence metas impossíveis

Imagine alguém que promete guardar R$ 500 mensais, mas raramente consegue, e outra pessoa que separa R$ 100 todos os meses.

Após 12 meses, a segunda terá acumulado R$ 1.200, sem considerar rendimentos.

Uma meta menor, porém sustentável, pode gerar mais resultado.

### Separe o dinheiro no início do mês

Depois de considerar despesas essenciais e compromissos prioritários, reservar parte do dinheiro quando a renda chega pode evitar que tudo seja gasto antes.

Uma transferência automática para uma conta separada, se disponível, também pode ajudar.

### Calcule o valor dos aportes

Divida o valor que deseja acumular pela quantidade de meses disponíveis.

O cálculo é uma referência e desconsidera rendimentos. Se o aporte for inviável, aumente o prazo ou estabeleça uma meta intermediária.

### E se eu precisar usar a reserva?

A reserva existe para emergências. Usá-la em uma necessidade real não é fracasso.

Quando a situação se estabilizar, reorganize o orçamento e retome os aportes para reconstruí-la.

> Segurança financeira se constrói e se mantém ao longo do tempo.`,

        `Se a meta é de R$ 3.600 para os próximos 18 meses:

| Informação | Valor |
| --- | ---: |
| Meta | R$ 3.600 |
| Prazo | 18 meses |
| Aporte mensal | R$ 200 |

**Cálculo:** R$ 3.600 ÷ 18 = R$ 200 por mês.

O cálculo desconsidera rendimentos. Se R$ 200 mensais não couberem no orçamento, revise o prazo ou estabeleça uma meta intermediária.`,

        `Escolha um valor que poderia guardar por mês. Calcule quanto acumularia após 6 e 12 meses, sem considerar rendimentos.

Esta atividade é uma reflexão pessoal. Não é necessário enviar seus dados financeiros para a plataforma.`,
      ],
    ],
  },
  {
    id: "seed-curso-como-investir",
    title: "Introdução aos investimentos",
    description:
      "Conheça risco, retorno, liquidez, prazo e diversificação, sem recomendações de ativos específicos.",
    colorHex: "#10B981",
    lessons: [
      [
        "Entendendo risco e retorno",

        "Compreender a relação entre risco e retorno e considerar objetivos, prazo e tolerância a perdas antes de investir.",

        `Ao conhecer os investimentos, muitas pessoas perguntam: “Quanto dinheiro posso ganhar?”.

Mas existe outra questão igualmente importante: quais riscos estou assumindo para tentar obter esse resultado?

Entender a relação entre risco e retorno ajuda a evitar decisões impulsivas.

### O que é retorno?

Retorno é o resultado financeiro de um investimento em determinado período.

Esse resultado pode ser positivo ou negativo. Para avaliar um investimento, também é necessário considerar impostos, taxas e os efeitos da inflação.

### O que é risco?

Risco é a possibilidade de o resultado ser diferente do esperado, inclusive com perdas.

Entre os exemplos estão:

- **Risco de mercado:** relacionado a oscilações de preço.
- **Risco de crédito:** quando um emissor pode deixar de pagar.
- **Risco de liquidez:** quando é difícil resgatar ou vender o investimento no momento desejado ou sem aceitar um preço desfavorável.

### Mais risco garante mais lucro?

Não. Investimentos arriscados podem oferecer maior retorno potencial, mas também podem sofrer perdas importantes.

O fato de um ativo ter valorizado no passado não garante que isso continuará acontecendo.

### Conheça seu perfil

Antes de investir, considere:

- **Seu objetivo:** para que servirá o dinheiro?
- **Seu prazo:** quando precisará dele?
- **Sua tolerância a risco:** quanto de oscilação ou perda conseguiria suportar?

Quem precisa do dinheiro em poucos meses possui necessidades diferentes de quem investe pensando em décadas.

> Investir bem não é escolher sempre o maior retorno, e sim entender riscos e objetivos.`,

        `Considere um investimento inicial de R$ 1.000:

| Situação | Valor final | Resultado |
| --- | ---: | ---: |
| Valorização | R$ 1.080 | Ganho de R$ 80, equivalente a 8% |
| Desvalorização | R$ 950 | Perda de R$ 50, equivalente a 5% |

Os cálculos são didáticos e desconsideram impostos, taxas e efeitos da inflação.

O retorno pode ser positivo ou negativo, e o resultado passado não garante o resultado futuro.`,

        `Imagine que R$ 1.000 investidos percam temporariamente 10% do valor. Como você reagiria?

Reflita sobre o que isso revela de sua tolerância a oscilações.

Esta atividade é uma reflexão pessoal. Não é necessário enviar seus dados financeiros para a plataforma.`,
      ],
      [
        "O que são liquidez e prazo?",

        "Relacionar a facilidade de acesso ao dinheiro, o prazo do objetivo e as condições de resgate de um investimento.",

        `Rentabilidade não é o único critério para avaliar um investimento.

Também é essencial saber quando e em quais condições será possível recuperar o dinheiro. É aí que entram liquidez e prazo.

### O que significa liquidez?

Liquidez é a facilidade de transformar um investimento em dinheiro disponível, sem enfrentar perdas relevantes decorrentes dessa conversão.

- **Alta liquidez:** costuma permitir resgate ou venda mais facilmente.
- **Baixa liquidez:** pode exigir mais tempo ou tornar a saída mais difícil.

### O que é prazo de investimento?

O prazo é o período em que você pretende manter o dinheiro aplicado.

Podemos pensar em:

- **Curto prazo:** objetivos próximos.
- **Médio prazo:** objetivos para os próximos anos.
- **Longo prazo:** objetivos para muitos anos.

Essas categorias são referências gerais; cada produto pode possuir condições específicas.

### Atenção ao vencimento

Alguns investimentos têm uma data de vencimento, quando o valor deve ser devolvido conforme o contrato.

Isso não significa que todos possam ser resgatados antecipadamente ou sem perdas.

Sempre verifique:

- Regras de resgate.
- Prazos para disponibilização dos recursos.
- Carências.
- Riscos de uma saída antecipada.

> Não basta perguntar quanto o investimento rende: pergunte também quando poderá precisar do dinheiro.`,

        `Compare dois objetivos:

| Objetivo | Necessidade de acesso |
| --- | --- |
| R$ 2.000 separados para imprevistos | Priorizar segurança e facilidade de acesso |
| Compra planejada para daqui a cinco anos | Possibilidade de avaliar prazos maiores, compreendendo condições e riscos |

O prazo do objetivo ajuda a avaliar quando o dinheiro precisará estar disponível.

Uma aplicação que só permita acesso depois da data em que você precisa pagar uma despesa pode não atender ao objetivo, mesmo que tenha rentabilidade atrativa.`,

        `Compare dois objetivos: uma emergência inesperada e uma compra planejada para daqui a cinco anos.

Qual exige maior facilidade de acesso aos recursos?

Esta atividade é uma reflexão pessoal. Não é necessário enviar seus dados financeiros para a plataforma.`,
      ],
      [
        "Diversificação e decisões conscientes",

        "Entender como a diversificação reduz a concentração de risco e reconhecer critérios para decisões financeiras conscientes.",

        `Imagine ter R$ 5.000 para investir. Você colocaria tudo em uma única alternativa?

Essa pergunta apresenta o conceito de diversificação, que significa distribuir recursos entre diferentes investimentos para reduzir a dependência de uma única fonte de risco.

### Por que diversificar?

Quem investe todo o patrimônio em ações de uma única empresa depende muito do desempenho daquela empresa.

Outra pessoa que distribui os recursos entre investimentos com características diferentes pode reduzir sua exposição a um único evento negativo.

Mesmo assim, diversificação não garante lucro nem elimina riscos.

### Ter muitos investimentos não basta

Uma carteira pode conter dez ativos e ainda depender dos mesmos fatores de risco.

Por exemplo, possuir ações de várias empresas do mesmo setor pode manter uma concentração importante.

Diversificar exige conhecer as características e os comportamentos dos investimentos, não apenas contar quantos existem.

### Como decidir de forma mais consciente?

Antes de investir, pergunte:

- Qual é meu objetivo?
- Quando precisarei do dinheiro?
- O que posso perder?
- Conheço os riscos?
- Esse investimento combina com minha realidade?

Desconfie de promessas de lucros elevados, rápidos e sem riscos.

### Conhecimento antes de pressa

Você não precisa conhecer todos os produtos financeiros para desenvolver uma mentalidade de investidor.

Compreender risco, retorno, liquidez, prazo e diversificação já permite avaliar oportunidades com mais cuidado e evitar decisões baseadas apenas em impulso.

> Investir é uma ferramenta para objetivos financeiros, não uma corrida para enriquecer rapidamente.`,

        `Uma pessoa distribui seu dinheiro entre várias empresas, mas todas pertencem ao mesmo setor.

Apesar de possuir diferentes investimentos, ela ainda pode ser afetada por um problema que atinja esse setor inteiro.

Por isso, diversificar não significa apenas aumentar a quantidade de produtos. É necessário compreender quais fatores podem afetá-los.

**Diversificação pode reduzir a concentração de risco, mas não elimina riscos nem garante lucro.**`,

        `Um amigo sugere aplicar todo o dinheiro em um ativo porque ele valorizou muito recentemente.

Quais perguntas você faria antes de considerar a sugestão?

Esta atividade é uma reflexão pessoal. Não é necessário enviar seus dados financeiros para a plataforma.`,
      ],
    ],
  },
];