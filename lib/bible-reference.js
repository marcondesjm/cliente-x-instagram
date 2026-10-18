const BOOKS={genesis:'Genesis',exodo:'Exodus',rute:'Ruth',samuel:'Samuel',reis:'Kings',daniel:'Daniel',jonas:'Jonah',ester:'Esther',lucas:'Luke',marcos:'Mark',mateus:'Matthew',joao:'John',atos:'Acts',corintios:'Corinthians',galatas:'Galatians'};
export function englishReference(reference='') {
 const match=reference.match(/^(?:(\d)\s+)?([\p{L}]+)\s+(.+)$/u);
 const key=match?.[2].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const book=BOOKS[key];
 if(!book)throw new Error('Livro bíblico sem tradução de pesquisa cadastrada.');
 return `${match[1]?match[1]+' ':''}${book} ${match[3].replace(/[–—]/g,'-')}`;
}
