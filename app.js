const express = require('express');
const mariadb = require('mariadb');



 const pool = mariadb.createPool({
     host: "localhost",
     user: "root",
     database: "db1",
     password:  "1234"
 })


const app = express();
app.use(express.json())
const port = 3000;

//consulta de todos os dados
app.get("/", (req, res) => {
    pool.getConnection({
      
    }).then(connection => {
        connection.query("SELECT * FROM Carros").then(result => {
            connection.end(); // Encerra a conexão
            res.json(result); // Retorna os dados como resposta em JSON
        }).catch(error => {
            connection.end(); // Certifique-se de encerrar a conexão em caso de erro
            console.log(error.message);
            res.status(500).send('Erro ao buscar dados de carros');
        });
    }).catch(error => {
        console.log(error.message);
        res.status(500).send('Erro ao conectar ao banco de dados');
    });
});
//insere os dados
app.post("/", async (req,res)=>{
    const {velocidade_maxima, modelo, fabricante, cor, ano} = req.body;

        const connection = await pool.getConnection();
        const query = "INSERT INTO Carros (velocidade_maxima, modelo, fabricante, cor, ano) VALUES (?, ?, ?, ?, ?)";
        const values = [velocidade_maxima, modelo, fabricante, cor, ano];

        await connection.query(query, values);
        connection.release();

        res.status(201).send("Registro de carro inserido com sucesso!");
    }) 

 //atualizar
 app.put("/:id", async (req,res)=>{

    //ver se existe no banco para autualizar/////////////////////
    const id = req.params.id
    const{velocidade_maxima, modelo, fabricante, cor, ano} = req.body;

    const connection = await pool.getConnection()
    const query = "UPDATE Carros SET velocidade_maxima= ?, modelo = ?, fabricante = ?, cor = ?, ano = ? WHERE id = ?";
    const values = [velocidade_maxima, modelo, fabricante, cor, ano, id]

    await connection.query(query,values);
    connection.release();
    res.status(201).send("carro atualizado com sucesso!");
 })   

//consulta um elemento
app.get("/:id", async(req, res)=>{
    const id = req.params.id

    const connection = await pool.getConnection()
    const query = "SELECT * FROM Carros WHERE id=?"
    const values = [id]
    
    
    dados = await connection.query(query,values)
    connection.release();
    res.json(dados)
})


//deletar
app.delete("/:id", async(req, res)=>{
    const id = req.params.id

    const connection = await pool.getConnection();
    const query = "DELETE FROM Carros WHERE id= ?";
    const values = [id]

    await connection.query(query, values);
    connection.release();
    res.status(201).send("carro removido com sucesso!");

})
//atualizar somente um campo
app.patch("/:id", async (req, res) => {
    const id = req.params.id; // Obtém o ID do registro a ser atualizado parcialmente a partir dos parâmetros da rota.
    const { modelo, fabricante, cor, ano } = req.body; // Obtém os campos a serem atualizados parcialmente do corpo da solicitação.

    const connection = await pool.getConnection();
    let query = "UPDATE Carros SET";
    const values = [];

    if (modelo) {
        query += " modelo = ?,";
        values.push(modelo);
    }

    if (fabricante) {
        query += " fabricante = ?,";
        values.push(fabricante);
    }

    if (cor) {
        query += " cor = ?,";
        values.push(cor);
    }

    if (ano) {
        query += " ano = ?,";
        values.push(ano);
    }

    // Remove a última vírgula se houver campos para atualizar.
    if (values.length > 0) {
        query = query.slice(0, -1);
    }

    query += " WHERE id = ?";
    values.push(id);

    dados= await connection.query(query, values);
    connection.release();

    const updatedFields = {
        modelo: req.body.modelo,
        fabricante: req.body.fabricante,
        // Inclua apenas os campos atualizados
    };
    
    res.json(updatedFields); // Retorna apenas os campos atualizados como resposta em JSON.
});

app.listen(port,()=>{


    console.log(`Servidor Express está rodando em http://localhost:${port}`);
})