const db = db.getSiblingDB("patterns");
["livros_subset", "resenhas"].forEach(c => db[c].drop());

// carrega 3 resenhas mais recentes + contador
db.livros_subset.insertOne({
  _id: "6a1ca6aa0bab98d9cc9df8a9",
  title: "MongoDB in Action",
  resenhas_top: [
    { usuario: "Ana", nota: 5, texto: "Instigante e prático.", ts: new Date() },
    { usuario: "Bob", nota: 4, texto: "Muito bom para engenheiros.", ts: new Date() },
    { usuario: "Carlos", nota: 5, texto: "Gostei muito da abordagem.", ts: new Date() }
  ],
  resenhas_count: 1450
});

// coleção 'resenhas' guarda o histórico completo
const bulkResenhas = [];
for (let i = 1; i <= 10; i++) {
  bulkResenhas.push({ 
    livroId: "6a1ca6aa0bab98d9cc9df8a9", 
    usuario: "Leitor_" + i, 
    nota: (i % 2) + 4, 
    texto: "Conteúdo da resenha antiga " + i, 
    ts: new Date() 
  });
}
db.resenhas.insertMany(bulkResenhas);

printjson(db.livros_subset.findOne({ _id: "6a1ca6aa0bab98d9cc9df8a9" }));
printjson(db.resenhas.find({ livroId: "6a1ca6aa0bab98d9cc9df8a9" }).sort({ ts: -1 }).limit(3).toArray());