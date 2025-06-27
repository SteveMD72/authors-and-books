const express = require("express");
const expressGraphQL = require("express-graphql");
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require("graphql");

const app = express();

const authors = [
	{ id: 1, name: "J.K. Rowling" },
	{ id: 2, name: "Bathilda Bagshot" },
	{ id: 3, name: "Gilderoy Lockhart" },
];

const books = [
	{ id: 1, name: "Harry Potter and the Sorcerer's Stone", authorId: 1 },
	{ id: 2, name: "Harry Potter and the Chamber of Secrets", authorId: 2 },
	{ id: 3, name: "Harry Potter and the Prisoner of Azkaban", authorId: 3 },
	{ id: 4, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
	{ id: 5, name: "Harry Potter and the Order of the Phoenix", authorId: 2 },
	{ id: 6, name: "Harry Potter and the Half-Blood Prince", authorId: 3 },
	{ id: 7, name: "Harry Potter and the Deathly Hallows", authorId: 1 },
	{ id: 8, name: "Fantastic Beasts and Where to Find Them", authorId: 2 },
	{ id: 9, name: "Quidditch Through the Ages", authorId: 3 },
	{ id: 10, name: "The Tales of Beedle the Bard", authorId: 1 },
];

const BookType = new GraphQLObjectType({
	name: "Book",
	description: "This represents a list of books written by an author",
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		authorId: { type: GraphQLNonNull(GraphQLInt) },
		author: {
			type: AuthorType,
			resolve: (book) => {
				return authors.find((author) => author.id === book.authorId);
			},
		},
	}),
});

const AuthorType = new GraphQLObjectType({
	name: "Author",
	description: "This represents the author of the book",
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		books: {
			type: GraphQLList(BookType),
			resolve: (author) => {
				return books.filter((book) => book.authorId === author.id);
			},
		},
	}),
});

const RootQueryType = new GraphQLObjectType({
	name: "query",
	descriptionL: "Route Query",
	fields: () => ({
		book: {
			type: BookType,
			description: "A single book",
			args: {
				id: { type: GraphQLInt },
			},
			resolve: (parent, args) => books.find((book) => book.id === args.id),
		},
		books: {
			type: GraphQLList(BookType),
			description: "A list of books",
			resolve: () => books,
		},
		authors: {
			type: GraphQLList(AuthorType),
			description: "A list of authors",
			resolve: () => authors,
		},
		author: {
			type: AuthorType,
			description: "A single author",
			args: {
				id: { type: GraphQLInt },
			},
			resolve: (parent, args) => authors.find((author) => author.id === args.id),
		},
	}),
});

const RouteMutationType = new GraphQLObjectType({
	name: "Mutation",
	description: "Root Mutation",
	fields: () => ({
		addBook: {
			type: BookType,
			description: "Add a book",
			args: {
				name: { type: GraphQLNonNull(GraphQLString) },
				authorId: { type: GraphQLNonNull(GraphQLInt) },
			},
			resolve: (parent, args) => {
				const newBook = {
					id: books.length + 1,
					name: args.name,
					authorId: args.authorId,
				};
				books.push(newBook);
				return newBook;
			},
		},
		addAuthor: {
			type: AuthorType,
			description: "Add an author",
			args: {
				name: { type: GraphQLNonNull(GraphQLString) },
				id: { type: GraphQLNonNull(GraphQLInt) },
			},
			resolve: (parent, args) => {
				const newAuthor = {
					id: authors.length + 1,
					name: args.name,
				};
				authors.push(newAuthor);
				return newAuthor;
			},
		},
	}),
});

const schema = new GraphQLSchema({
	query: RootQueryType,
	mutation: RouteMutationType,
});

app.use(
	"/graphql",
	expressGraphQL.graphqlHTTP({
		schema: schema,
		graphiql: true,
	})
);

app.listen(5000, () => console.log(`Server is running`));
