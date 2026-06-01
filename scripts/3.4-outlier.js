const db = db.getSiblingDB("patterns");
["usuarios", "seguidores_extras"].forEach(c => db[c].drop());

// usuario comum
db.usuarios.insertOne({
  _id: "U1",
  nome: "Pablo Miranda",
  seguidores_users: ["u2", "u3", "u42"]
});
printjson(db.usuarios.findOne({ _id: "U1" }, { nome: 1, seguidores_users: 1 }));

// preenchimento do array embutido até um limite seguro de corte (ex: 1000)
const baseSeguidores = [];
for (let i = 1; i <= 1000; i++) baseSeguidores.push("u" + i);

// usuario influente
db.usuarios.insertOne({
  _id: "U99",
  nome: "Stephen King",
  seguidores_users: baseSeguidores,
  has_extras: true // marcador de outlier
});

// novos seguidores excedentes diretamente na coleção isolada de transbordo
db.seguidores_extras.insertMany(
  Array.from({ length: 5 }, (_, i) => ({ 
    celebridade: "U99", 
    seguidor: "extra_user_" + i, 
    ts: new Date() 
  }))
);

// validação do comportamento na camada de aplicação
const perfilTarget = db.usuarios.findOne({ _id: "U99" }, { nome: 1, has_extras: 1 });
const totalExtras = db.seguidores_extras.countDocuments({ celebridade: "U99" });