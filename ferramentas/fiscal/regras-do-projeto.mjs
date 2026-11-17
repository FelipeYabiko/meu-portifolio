// Regras de fiscal só deste projeto. A fábrica nunca sobrescreve este arquivo.
// Toda vez que um erro for corrigido pela segunda vez, transforme em regra aqui (regra em comando não é esquecida;
// regra em texto é). Cada regra precisa de um teste em tests/ com um caso que passa e um que quebra.
//
// Exemplo:
//   {
//     id: 'sem-preco-quebrado',
//     tipos: ['*'],
//     checar: (p) => p.com(/\.html$/).filter((a) => /R\$\s?\d+\.\d{2}\b/.test(p.ler(a)))
//       .map((arquivo) => ({nivel: 'erro', arquivo, mensagem: 'preço com ponto: no Brasil é vírgula (R$ 49,90)'})),
//   },

export const regrasDoProjeto = [];
