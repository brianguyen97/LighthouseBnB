// Requirements
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

/*
 Accepts an email as a string and returns a promise.
 If the promise resolves, it will resolve with the user object with the given email address,
 otherwise it will return null.
 */

const getUserWithEmail = function (email) {
  const queryString = `
      SELECT *
      FROM users
      WHERE LOWER(email) = $1;`;
  return pool
    .query(queryString, [email.toLowerCase()])
    .then((res) => {
      if (res.rows.length) {
        return res.rows[0];
      }
      return null;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getUserWithEmail = getUserWithEmail;

/*
 Accepts an id as a string and returns a promise.
 If the promise resolves, it will resolve with the user object with the given id,
 otherwise it will return null.
 */
const getUserWithId = function (id) {
  const queryString = `
      SELECT * FROM users
      WHERE id = $1;`;
  return pool
    .query(queryString, [id])
    .then((result) => {
      return result.rows[0] || null;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;

/*
Accepts a user object that contains a name, email and password property,
the function will insert a new user into or database. It also returns
a promise that resolves with the new user object.
*/

const addUser = function (user) {
  const { name, email, password } = user;
  return pool
    .query(
      `
    INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;
  `,
      [name, email, password]
    )
    .then((res) => {
      return res.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const queryString = `
      SELECT
          properties.*,
          reservations.*,
          avg(property_reviews.rating) AS average_rating
      FROM property_reviews
      JOIN reservations ON properties.id = property_reviews.property_id
      JOIN properties ON properties.id = reservations.property_id
      WHERE 
          reservations.guest_id = $1 AND
          reservations.end_date < now()::date
      GROUP BY reservations.id, properties.id
      ORDER BY reservations.start_date
      LIMIT $2;
  `;
  return pool.query(queryString, [guest_id, limit]).then((res) => res.rows);
};
exports.getAllReservations = getAllReservations;

/// Properties

/*
 Accepts an options object that contains a city, owner_id, minimum_price_per_night,
 maximum_price_per_night, and minimum_rating and a limit (default 10).
 This function builds a query string that will filter our search results based on these options.
 */

const getAllProperties = function (options, limit = 10) {
  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id`;
  let whereClause = [];
  let queryParams = [];

  if (options.city) {
    queryParams.push(`%${options.city.toLowerCase()}%`);
    whereClause.push(`LOWER(city) LIKE $${queryParams.length}`);
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    whereClause.push(`cost_per_night >= $${queryParams.length}`);
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    whereClause.push(`cost_per_night <= $${queryParams.length}`);
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    whereClause.push(`owner_id = $${queryParams.length}`);
  }

  if (whereClause.length) {
    queryString = queryString + " WHERE " + whereClause.join(" AND ");
  }

  queryString += " GROUP BY properties.id";

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += ` HAVING avg(rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += ` ORDER BY cost_per_night LIMIT $${queryParams.length}`;
  console.log(queryString, queryParams);

  return pool
    .query(queryString, queryParams)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getAllProperties = getAllProperties;

/* This function will receive a property object and will return
 a promise to the saved version of the property.<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const {
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms,
  } = property;

  return pool
    .query(
      `
    INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `,
      [
        owner_id,
        title,
        description,
        thumbnail_photo_url,
        cover_photo_url,
        cost_per_night,
        street,
        city,
        province,
        post_code,
        country,
        parking_spaces,
        number_of_bathrooms,
        number_of_bedrooms,
      ]
    )
    .then((res) => res.rows[0]);
};
exports.addProperty = addProperty;
