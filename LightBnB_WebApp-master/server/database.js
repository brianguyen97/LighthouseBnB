const properties = require("./json/properties.json");
const users = require("./json/users.json");

const { Pool } = require("pg");

const pool = new Pool({
  user: "vagrant",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const query = {
    name: "getUserWithEmail",
    text: "SELECT email FROM users WHERE email = $1",
    values: [email],
  };
  return pool
    .query(query)
    .then((res) => {
      console.log(res.rows ? res.rows[0] : null);
      return res.rows ? res.rows[0] : null;
    })
    .catch((e) => console.log(e));
};

exports.getUserWithEmail = getUserWithEmail;

// getUserWithEmail("tristanjacobs@gmail.com");

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const query = {
    name: "getUserWithId",
    text: `SELECT * FROM users WHERE id = $1`,
    values: [id],
  };
  return pool
    .query(query)
    .then((res) => {
      return res.rows ? res.rows[0] : null;
    })
    .catch((e) => console.log(e));
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const query = {
    text: `INSERT INTO users (name, email, password) VALUES
           ($1, $2, $3)
           RETURNING *;`,
    values: [`${user.name}`, `${user.email}`, `${user.password}`],
  };
  return pool
    .query(query)
    .then((res) => {
      console.log(res.rows[0]);
      return res.rows[0];
    })
    .catch((e) => console.log(e));
};

// exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return getAllProperties(null, 2);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
// const getAllProperties = (options, limit = 10) => {
//   return pool
//     .query(`SELECT * FROM properties LIMIT $1`, [limit])
//     .then((result) => {
//       console.log(result.rows);
//       return result.rows;
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// };

const getAllProperties = (options, limit = 10) => {
  const query = {
    name: "getAllProperties",
    text: "SELECT * FROM properties LIMIT $1",
    values: [limit],
  };
  return pool.query(query).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;