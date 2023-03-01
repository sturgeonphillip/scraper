// other cases with difficult data
// table data filtered by first cell's data
function extractData (data: Document) {
  const tableData: HTMLTableElement = Array.from(
    data.querySelectorAll('table'),
  ).filter(t => t.children[0].children[0].children[0].innerHTML.match(
    /Unique text in first cell which IDs the table/,
  ),)[0];
};


/**
 * <div class="pokemon">
 *  Name: Pikachu <br />
 *  Number: 25 <br />
 *  Type: Electric <br />
 *  Weakness: Ground
 * </div>
 */
// *potential* function to filter HTML
function extractPokemonData (document: Document) {
  const raw = document.querySelector('.pokemon');
  if (typeof raw === 'string') {
    const name = raw.match(/Name: (\w+)/)[0];
    const num = raw.match(/Number: (\d+)/)[0];
  }
}
