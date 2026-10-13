/*
 * Fórmulas padrão do Programa Nutricional Suinocultura – Progress (Rebanho).
 * Cada fase lista a porcentagem de cada ingrediente, na mesma ordem de INGREDIENTES
 * (kg de cada ingrediente para cada 100 kg de ração).
 */
const INGREDIENTES = [
  'Milho',
  'Farelo de soja',
  'Farelo de trigo',
  'Açúcar',
  'Progress 3',
  'Progress 4',
  'Power Inicial',
  'Progress Crescimento',
  'Progress Terminação',
  'Progress Reprodução',
];

const FORMULAS_PADRAO = {
  'Pré-Inicial 1 (7 a 35 dias)':   [40, 15, 0, 5, 40, 0, 0, 0, 0, 0],
  'Pré-Inicial 2 (35 a 49 dias)':  [50, 25, 0, 5, 0, 20, 0, 0, 0, 0],
  'Inicial (50 a 70 dias)':        [60, 31, 0, 4, 0, 0, 5, 0, 0, 0],
  'Crescimento (71 a 110 dias)':   [72, 25, 0, 0, 0, 0, 0, 3, 0, 0],
  'Terminação (111 dias – abate)': [77, 20, 0, 0, 0, 0, 0, 0, 3, 0],
  'Gestação':                      [57, 16, 24, 0, 0, 0, 0, 0, 0, 3],
  'Lactação':                      [62, 30, 0, 5, 0, 0, 0, 0, 0, 3],
};
