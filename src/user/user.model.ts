import { getConnectionPool } from "@/database/dbconfig.js";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: string;
}

export const findEmail = async (email: string) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    SELECT * FROM crs.users WHERE email = @email AND is_deleted = 0
  `
  const response = await database.request().input("email", email).query(query);
  return response.recordset[0];
}

export const listUsers = async ({ offset, limit }: { offset: number; limit: number; }) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    SELECT * FROM crs.users WHERE is_deleted = 0
    ORDER BY created_at DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `

  const response = await database.request().input("offset", offset).input("limit", limit).query(query)
  // console.log("Hello", response)
  return response.recordset;
}

export const findUser = async (id: string) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    SELECT * FROM crs.users WHERE user_id = @id
  `
  const response = await database.request().input("id", id).query(query);

  return response.recordset[0]
}

export const createUser = async (newUser: User): Promise<number> => {
  // console.log("Hello")
  console.log("Model, Create user:", newUser);
  const database = getConnectionPool();
  const query = /*sql*/ `
    INSERT INTO crs.users (first_name, last_name, email, password, contact_phone, address, role)
    VALUES (@firstName, @lastName, @email, @password, @contactPhone, @address, @role)
  `
  const request = database.request()
  for (const [key, value] of Object.entries(newUser)) {
    request.input(key, value);
  }
  // console.log("Request", request)
  const response = await request.query(query);
  return response.rowsAffected[0];
}



export const updateUser = async (id: string, payload: Record<string, any>) => {

  const keys = Object.keys(payload);
  if (keys.length === 0) return 0;

  const setClauses: string[] = [];

  const database = getConnectionPool();
  const request = database.request();
  request.input("id", id);

  keys.forEach((k, idx) => {
    const dbCol = k.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`); // camel -> snake
    const param = `p${idx}`;
    setClauses.push(`${dbCol} = @${param}`);
    request.input(param, (payload as any)[k]);
  });

  const setSql = setClauses.join(", ");

  const query = /*sql*/ `
    UPDATE crs.users SET ${setSql}, updated_at = GETDATE() WHERE user_id = @id;
  `

  const response = await request.query(query);
  return response.rowsAffected[0];
}




export const deleteUser = async (id: string): Promise<number> => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    UPDATE crs.users SET is_deleted = 1, updated_at = GETDATE() WHERE user_id = @id
  `
  console.log("Here")
  const response = await database.request().input("id", id).query(query);
  console.log(response)
  return response.rowsAffected[0]
}