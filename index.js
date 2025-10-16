const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const usuarios = [
  { id: 1, nombre: 'Ana García', email: 'ana@email.com', edad: 28 },
  { id: 2, nombre: 'Carlos López', email: 'carlos@email.com', edad: 32 },
  { id: 3, nombre: 'María Rodríguez', email: 'maria@email.com', edad: 25 },
  { id: 4, nombre: 'Pedro Martínez', email: 'pedro@email.com', edad: 30 }
];

const schema = buildSchema(`
  type Usuario {
    id: ID!
    nombre: String!
    email: String!
    edad: Int
  }

  type Query {
    usuarios: [Usuario]
    
    usuario(id: ID!): Usuario
    
    usuariosMayoresDe(edad: Int!): [Usuario]
    
    buscarUsuarios(nombre: String!): [Usuario]
  }

  type Mutation {
    agregarUsuario(nombre: String!, email: String!, edad: Int): Usuario
    
    actualizarUsuario(id: ID!, nombre: String, email: String, edad: Int): Usuario
    
    eliminarUsuario(id: ID!): Boolean
  }
`);

const root = {
  usuarios: () => usuarios,
  
  usuario: ({ id }) => usuarios.find(user => user.id == id),
  
  usuariosMayoresDe: ({ edad }) => usuarios.filter(user => user.edad > edad),
  
  buscarUsuarios: ({ nombre }) => 
    usuarios.filter(user => 
      user.nombre.toLowerCase().includes(nombre.toLowerCase())
    ),
  
  agregarUsuario: ({ nombre, email, edad }) => {
    const nuevoUsuario = {
      id: usuarios.length + 1,
      nombre,
      email,
      edad
    };
    usuarios.push(nuevoUsuario);
    return nuevoUsuario;
  },
  
  actualizarUsuario: ({ id, nombre, email, edad }) => {
    const usuarioIndex = usuarios.findIndex(user => user.id == id);
    if (usuarioIndex === -1) {
      throw new Error('Usuario no encontraado!!!');
    }
    
    if (nombre) usuarios[usuarioIndex].nombre = nombre;
    if (email) usuarios[usuarioIndex].email = email;
    if (edad !== undefined) usuarios[usuarioIndex].edad = edad;
    
    return usuarios[usuarioIndex];
  },
  
  eliminarUsuario: ({ id }) => {
    const usuarioIndex = usuarios.findIndex(user => user.id == id);
    if (usuarioIndex === -1) {
      return false;
    }
    
    usuarios.splice(usuarioIndex, 1);
    return true;
  }
};

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true 
}));

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
  console.log(`Servidor GraphQL corriendo en http://localhost:${PORT}/graphql`);
});