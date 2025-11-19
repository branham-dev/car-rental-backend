import { getConnectionPool } from "@/database/dbconfig.js"

type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

type LoginUser = {
  email: string;
  password: string;
}

export const registerUser = async (newUser: NewUser): Promise<number> => {
  // console.log('Model:', newUser)

  const database = getConnectionPool();
  const request = database.request()

  for (const [key, value] of Object.entries(newUser)) {
    request.input(key, value);
  }

  const query = /*sql*/ `
    INSERT INTO crs.users (first_name, last_name, email, password, contact_phone, address)
    VALUES (@firstName, @lastName, @email, @password, @phone, @address);
  `
  const response = await request.query(query);
  // console.log(response)
  return response.rowsAffected[0];

}
export const loginUser = async (loginUser: LoginUser): Promise<unknown | undefined> => {
  const { email } = loginUser
  const database = getConnectionPool()
  const query = /*sql*/ `
    SELECT user_id, first_name, last_name, email, password, role
    FROM crs.users
    WHERE email = @email
  `
  const response = await database.request().input("email", email).query(query);
  console.log(response.recordset[0]);
  return response.recordset[0]
}