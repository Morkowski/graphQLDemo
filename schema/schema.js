const graphQl = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphQl;

const dataServerAdress = 'http://localhost:3000'

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return axios.get(`${dataServerAdress}/companies/${parentValue.companyId}`)
                    .then(response => response.data);
            }
        }
    })
});

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get(`${dataServerAdress}/companies/${parentValue.id}/users`)
                .then(response => response.data);
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, args) {
                return axios.get(`${dataServerAdress}/users/${args.id}`)
                    .then(response => response.data);
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, args) {
                return axios.get(`${dataServerAdress}/companies/${args.id}`)
                    .then(response => response.data);
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type:GraphQLString }
            },
            resolve(parentValue, { firstName, age }){
                return axios.post(`${dataServerAdress}/users`, {
                    firstName,
                    age
                })
                .then(response => response.data);
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parentValue, { id }){
                return axios.delete(`${dataServerAdress}/users/${id}`)
                    .then(response => response.data);
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type:GraphQLString }
            },
            resolve(parentValue, { id, firstName, age, companyId }){
                return axios.patch(`${dataServerAdress}/users/${id}`, {
                    firstName,
                    age,
                    companyId
                })
                .then(response => response.data);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});
