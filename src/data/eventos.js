// One-time story events, triggered by milestone. Shown as a modal that
// pauses the game; their flag persists in the save (game.eventosVistos).

export const EVENTOS = [
  {
    id: 'esequibo',
    requiereHito: 3, // Hito 4: salario real $2.000 (primer mundo)
    titulo: 'El Esequibo se une como estado',
    texto:
      'Con el país en niveles de primer mundo, la Guayana Esequiba solicita la ' +
      'confirmación de su entidad territorial y se convierte oficialmente en un ' +
      'nuevo estado de Venezuela. Un territorio inmenso, lleno de recursos, ' +
      'aparece en tu mapa — y hay todo por construir.',
  },
  {
    id: 'islas-abc',
    requierePibPc: 100_000, // beyond top-mundial: one of the richest economies alive
    titulo: 'Curazao, Bonaire y Aruba se unen',
    texto:
      'Con $100.000 de PIB per cápita, Venezuela es una de las economías más ' +
      'prósperas del planeta. En referéndums históricos, Curazao, Bonaire y ' +
      'Aruba votan unirse al país. El Caribe entero cambia de color: tres islas ' +
      'nuevas aparecen en tu mapa.',
  },
]
