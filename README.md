# Atividade MongoDB — Relacionamentos e Schema Design

## Parte 1 — Modelagem de relacionamentos

### 1.1 — Decisões embed × referência

**Entregue:**
- Lista de **coleções** que você criaria e para **cada coleção**, **1 documento JSON de exemplo** preenchido:

R:

1. usuarios:
``` json
{
  "_id": {"$oid": "65f1a2b3c4d5e6f7a8b90123"},
  "nome": "Pablo Miranda",
  "email": "pablo.miranda@livraria.com",
  "bio": "Ama livros e obras de fantasia medieval.",
  "data_cadastro": {"$date": "2026-05-29T10:00:00Z"},
  "perfil": {
    "foto_url": "https://storage.api/users/pablo.miranda.jpg",
  },
  "estante": [
    {
      "livro_id": {"$oid": "65f1a2b3c4d5e6f7a8b90456"},
      "status": "lendo",
      "adicionado_em": {"$date": "2026-05-01T14:20:00Z"}
    },
    {
      "livro_id": {"$oid": "65f1a2b3c4d5e6f7a8b90789"},
      "status": "lido",
      "adicionado_em": {"$date": "2026-03-10T18:00:00Z"}
    }
  ]
}
```

2. resenhas:
``` json
{
  "_id": {"$oid": "65f1a2b3c4d5e6f7a8b90999"},
  "usuario_id": {"$oid": "65f1a2b3c4d5e6f7a8b90123"},
  "livro_id": {"$oid": "65f1a2b3c4d5e6f7a8b90456"},
  "nota": 5,
  "texto": "Melhor coisa que eu já li na vida, o grande abra alas na fantasia.",
  "data": {"$date": "2026-05-20T19:30:00Z"},
  "curtidas": 42
}
```

3. livros:
``` json 
{
  "_id": {"$oid": "65f1a2b3c4d5e6f7a8b90456"},
  "titulo": "Duna",
  "autores": ["Frank Herbert"],
  "editora": "Aleph",
  "ano": 2017,
  "generos": ["Ficção Científica", "Espaço"],
  "isbn": "9788576573005",
  "sinopse": "Uma jornada épica em um mundo desértico de Arrakis."
}
```

4. comentarios:
``` json
{
  "_id": {"$oid": "65f1a2b3c4d5e6f7a8b90111"},
  "resenha_id": {"$oid": "65f1a2b3c4d5e6f7a8b90999"},
  "usuario_id": {"$oid": "65f1a2b3c4d5e6f7a8b90222"},
  "texto": "Concordo totalmente! O ritmo do livro é sensacional.",
  "data": {"$date": "2026-05-21T08:15:00Z"}
}
```

5. seguidores:
``` json
{
  "_id": {"$oid": "65f1a2b3c4d5e6f7a8b90aaa"},
  "seguidor_id": {"$oid": "65f1a2b3c4d5e6f7a8b90123"},
  "seguido_id": {"$oid": "65f1a2b3c4d5e6f7a8b90222"},
  "data_inicio": {"$date": "2026-02-01T12:00:00Z"}
}
```

Originalmente tínhamos pensado em apenas 3 coleções, uma para usuários, um para reviews e um para os livros. O problema é que um livro famoso, um usuário popular, comentários que poderiam gerar novos comentários, poderiam fazer o documento passar do limite estabelecido de 16 MB, à partir daí criamos mais duas coleções, uma para comentários e outra para seguidores.

- Para cada item (a)–(e): **decisão (embed/ref) + 2–3 frases de justificativa**,
  considerando tamanho do documento (limite BSON 16 MB), frequência de leitura
  conjunta, frequência de update do dado e crescimento do relacionamento:

| # | Relacionamento | Cardinalidade típica |
|---|---|---|
| (a) | Usuário ↔ foto/perfil/configurações | 1:1 |
| (b) | Resenha ↔ comentários | 1:poucos a 1:muitos |
| (c) | Livro ↔ resenhas | 1:muitos (pode explodir) |
| (d) | Usuário ↔ livros nas estantes | N:N |
| (e) | Usuário ↔ usuários (seguir) | N:N (grafo) |

R:

a. Embed: informações estáticas, as informações são pessoais, descrição de bio e configurações. Fazer tudo junto é viável, as informações devem ser pouco alteradas (uma nova foto, uma mudança na bio) e é isso.

b. Ref: a maior parte das resenhas deve atrair pouco ou nenhum comentário, mas há casos em que uma resenha pode gerar uma discussão acalorada (positiva ou negativa) e o tamanho do documento pode crescer, e carregar todo o documento com cada um dos comentários pode atingir o limite do documento.

c. Ref: situação semelhante, livros que são fundantes de um segmento literário, ou de grande impacto, pode atrair muitos reviews, que por sua vez podem atrair mais ou menos comentários. Referenciar eles não só ajudam a aliviar a leitura desses documentos, mas também a escrita.

d. Embed: podemos deixar a informação junto com o usuário, que vai adicionar (muito raramente excluir) alguns livros que podem ser acessados juntos, informações que não vão ser alteradas com frequência e que podem ser disponibilizadas instantaneamente quando necessário.

e. Ref: um problema em redes sociais, aplicados ao contexto de MongoDB, é, na nossa visão, está ligado aos nós que representam usuários influentes e que podem agregar mais e mais seguidores. Eles podem representar um estouro do limite do documento, mas se decidíssemos por embedding, teríamos que lidar com o custo computacional de atualização dos seguirores, a frequência de leitura de quem os seguidores também seguem e assim em diante, acaba também representando um problema que pode ser solucionado ao isolar os seguidores em uma coleção separada.

### 1.2 — Cardinalidade que muda a decisão

Para o item (c) (Livro ↔ resenhas): mostre **como sua decisão muda** entre:
- um livro **comum** (dezenas de resenhas), e
- um **best-seller** (centenas de milhares de resenhas).

R: um livro comum pode manter suas poucas resenhas como embedding, seriam prováveis dezenas de resenhas sendo lidas junto com os dados do livro, um problema é que um livro pode ser elevado ao posto de **best-seller** e daí teríamos que alterar a maneira como lemos as resenhas que deixariam de ser dezenas para centenas de milhares (deixar como está bate no problema ). Podemos resolver isso simplesmente não carregando TODAS as centenas de milhares de reviews de uma vez.

Cite **qual Schema Design Pattern** resolve o segundo caso e **por quê**.

R: podemos utilizar **Subset**. No caso traríamos somente os dados quentes, que seriam as resenhas que tenham recebido mais votos da comunidade, ou que tenham mais acessos. Esses dados estão como embeddings nos dados de cada livro podem rotacionar na medida em que outras resenhas forem se tornando mais relevantes. Podemos utilizar também o **Outlier**, já que nem todo livro se torna um **best-seller**, e quando ele passa a receber mais atenção através de resenhas, uma flag poderia confirmar que as resenhas passaríam para a coleção resenhas.

### 1.3 — N:N: de que lado guardar a referência?

Para o item (e) (seguir), você guardaria o array de IDs no documento de **quem
segue**, de **quem é seguido**, em **ambos**, ou em uma **coleção de ligação**
(`segue`)? Justifique em **4–6 linhas** considerando: usuários com **milhões de
seguidores** (outliers), consultas "quem eu sigo" vs "quem me segue", e o custo
de manter os dois lados sincronizados.

R: escolhemos utilizar deixar uma coleção de ligação chamada seguidores. Para uma rede social, guardar os IDs nos documentos dos usuários vai chegar ao limite do documento de 16mb em contas com mais seguidores, além de cada update se tornar custoso. Adotar a referência em ambos os lados exigiria mais complexidade e poderia degradar a performance de escrita; a coleção de ligação isola o crescimento dos dados e permite indexar os campos `seguidor_id` e `seguido_id`, respondendo consultas de seguidores e seguidos.

---

# Parte 3 — Schema Design Patterns

Escolha o domínio da **rede social de leitura** para aplicar os padrões.
Para cada item, **entregue o documento JSON resultante + 2–3 frases de justificativa**.

### 3.1 — Extended Reference

Mostre como você aplicaria **Extended Reference** para exibir uma **resenha** já
com o **título do livro** e o **nome do usuário**, sem `$lookup` na leitura comum.
Indique **quais campos** você duplicaria e **por que são "estáveis o suficiente"**.
Cite **um campo que você NÃO duplicaria** e por quê.

R: Duplicariamos as colunas(titulo do livro e nome do usuário), pois são campos altamente estáveis que quase nunca mudam na vida real. O ganho de velocidade ao abrir a página  compensaria o raríssimo custo de atualizar eses dados em lote caso um dia mudem.

Já as colunas(preco do livro e status_estoque) são dados altamente voláteis (que mudam a todo momento por promoções ou vendas). Duplicá-los geraria um pesadelo de sincronização, exigindo milhares de atualizações no banco a cada alteração de valor.

Exemplo: {
  "_id": "resenha_abc123",
  "nota": 5,
  "texto": "Uma obra-prima absoluta sobre o absurdo da condição humana.",
  "livro": {
    "id": "livro_kafka_01",
    "titulo": "O Processo"
  },
  "usuario": {
    "id": "usr_aderaldo_99",
    "nome": "Aderaldo Neto"
  }
}

### 3.2 — Subset

Aplique o **Subset Pattern** ao **livro** de forma a embarcar só as **3 resenhas
mais recentes** + um contador, mantendo o restante numa coleção `resenhas`.
Mostre o documento `livro` e descreva, em **2 frases**, como a tela "ver todas as
resenhas" funciona.

### 3.3 — Computed

Aplique o **Computed Pattern** para manter a **nota média** e o **total de
resenhas** de cada livro **atualizados em tempo de escrita** (em vez de recalcular
com `aggregate` a cada leitura). Mostre o documento e o `updateOne` com `$inc`
que você rodaria a cada nova resenha.

R: 

### 3.4 — Escolha livre: Bucket, Outlier ou Versioning

Escolha **um** padrão entre **Bucket**, **Outlier** ou **Schema Versioning** e
aplique-o a um problema **plausível** da rede de leitura (ex.: eventos de
"páginas lidas por dia" → Bucket; usuário com milhões de seguidores → Outlier;
campo `bio` que virou objeto estruturado → Versioning). Justifique a escolha.
# mongodb_relacionamentos_sd
