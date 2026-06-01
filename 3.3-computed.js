const db = db.getSiblingDB("patterns");

db.livro_resumo.drop();
db.resenhas_raw.drop();

// resumo do livro com valores base conhecidos
db.livro_resumo.insertOne({
  _id: "6a1ca6aa0bab98d9cc9df8a9",
  title: "MongoDB in Action",
  nota_media: 4.5,
  total_resenhas: 10
});

// write-time de forma dinâmica
function registrarResenha(livroId, usuario, texto, novaNota, novaMediaCalculada) {
  db.resenhas_raw.insertOne({ livroId, usuario, texto, nota: novaNota, ts: new Date() });
  
  // atualiza o resumo com $inc e $set
  db.livro_resumo.updateOne(
    { _id: livroId },
    { 
      $set: { nota_media: novaMediaCalculada, ultimo_update: new Date() }, 
      $inc: { total_resenhas: 1 } 
    },
    { upsert: true }
  );
}

// usuário insere uma nova resenha nota 5
// nova média proporcional: ((4.5 * 10) + 5) / 11 = 4.54
registrarResenha("6a1ca6aa0bab98d9cc9df8a9", "Pablo Miranda", "Excelente livro!", 5, 4.54);