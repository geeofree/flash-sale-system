import { inject, injectable } from "inversify";
import { TOKENS } from "../utils/DependencyInjection.js";
import type { Database } from "./DbService.js";
import { jsonResponse } from "../utils/Response.js";
import { StatusCodes } from "http-status-codes";
import { UsersTable } from "../../db/schema.js";
import { eq, getTableColumns } from "drizzle-orm";
import { hash, verify } from "argon2";

export type SignInParams = {
  username: string;
  password: string;
}

export type SignUpParams = {
  username: string;
  password: string;
  role: "Admin" | "User";
}

@injectable()
export class AuthService {
  @inject(TOKENS.DB)
  private db!: Database;

  async signIn(params: SignInParams) {
    try {
      const { username, password } = params;
      const [user] = await this.db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.username, username))
        .limit(1);

      if (user == null) {
        return jsonResponse<null>({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "Invalid username or password.",
          data: null,
        })
      }

      const passwordMatches = await verify(user.password, password)

      if (!passwordMatches) {
        return jsonResponse<null>({
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "Invalid username or password.",
          data: null,
        })
      }

      const { password: _password, ...data } = user;

      return jsonResponse<Omit<typeof UsersTable.$inferSelect, "password">>({
        statusCode: StatusCodes.OK,
        message: "Successfully signed in!",
        data,
      })
    } catch (error: unknown) {
      console.log(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while signing in.",
        data: null,
      })
    }
  }

  async signUp(params: SignUpParams) {
    try {
      const hashedPassword = await hash(params.password);
      const data = {
        username: params.username,
        role: params.role,
        password: hashedPassword
      }

      const { password, ...returnedColumns } = getTableColumns(UsersTable)

      const [user] = await this.db.insert(UsersTable)
        .values(data)
        .returning(returnedColumns);

      if (user == null) {
        console.error('Created user was empty somehow.');
        return jsonResponse<null>({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Something went wrong while signing up.",
          data: null,
        })
      }

      return jsonResponse<Omit<typeof UsersTable.$inferSelect, "password">>({
        statusCode: StatusCodes.CREATED,
        message: "Successfully signed up!",
        data: user,
      });
    } catch (error: unknown) {
      console.log(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while signing in.",
        data: null,
      })
    }
  }
}
