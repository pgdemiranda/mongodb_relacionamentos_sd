
print("2.1 — Enriquecer o dataset")

printjson(db.livro.insertMany([
  { 
    title: "livro 01", 
    url: "http://example.com",
    editora: ed[1], 
    autores: [au[0], au[1]] 
  },
  { 
    title: "livro 02", 
    url: "hhttp://example.com",
    editora: ed[2], 
    autores: [au[2]] 
  },
  { 
    title: "Tlivro 03", 
    url: "http://example.com",
    editora: ed[1], 
    autores: [au[0]] 
  },
  { 
    title: "livro 04", 
    url: "http://example.com",
    editora: ed[0], 
    autores: [au[1]] 
  }
]));

print("2.2 — $lookup básico")


printjson(db.livro.aggregate([
  { $lookup: { from: "editora", localField: "editora",
               foreignField: "_id", as: "ed" } },
  { $unwind: "$ed" },            // desfaz o array (1:1 -> objeto)
  { $project: { _id: 0, title: 1, editora: "$ed.nome", cidade: "$ed.cidade" } }
]).toArray());

printjson(db.livro.aggregate([
  { $lookup: { from: "autor", localField: "autores",
               foreignField: "_id", as: "autores_doc" } },
  { $project: { _id: 0, title: 1, "autores_doc.nome": 1 } }]).toArray());